#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";

const REGISTRY_URL =
  process.env.BEARNIE_REGISTRY_URL || "https://bearnie.dev/registry";

interface ComponentFile {
  name: string;
  path: string;
  content: string;
}

interface ComponentRegistry {
  name: string;
  type?: "utility" | "component";
  description: string;
  category?: string;
  files: ComponentFile[];
  dependencies?: string[];
  registryDependencies?: string[];
}

interface RegistryIndex {
  components: Array<{
    name: string;
    description: string;
    category: string;
  }>;
}

// Fetch component data from registry
async function fetchComponent(name: string): Promise<ComponentRegistry | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/${name}.json`);
    if (!response.ok) return null;
    return (await response.json()) as ComponentRegistry;
  } catch {
    return null;
  }
}

// Fetch registry index
async function fetchIndex(): Promise<RegistryIndex | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/index.json`);
    if (!response.ok) return null;
    return (await response.json()) as RegistryIndex;
  } catch {
    return null;
  }
}

// Find project root by looking for package.json
function findProjectRoot(startDir: string): string | null {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// Create the MCP server
const server = new McpServer({
  name: "bearnie",
  version: "0.1.0",
});

// Tool: List all available components
server.tool(
  "list_components",
  "List all available Bearnie UI components with their descriptions and categories",
  {},
  async () => {
    const index = await fetchIndex();
    if (!index) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Could not fetch component registry. Please check your internet connection.",
          },
        ],
      };
    }

    const grouped = index.components.reduce((acc, comp) => {
      if (!acc[comp.category]) acc[comp.category] = [];
      acc[comp.category].push(comp);
      return acc;
    }, {} as Record<string, typeof index.components>);

    let output = "# Available Bearnie Components\n\n";
    for (const [category, components] of Object.entries(grouped).sort()) {
      output += `## ${
        category.charAt(0).toUpperCase() + category.slice(1)
      }\n\n`;
      for (const comp of components) {
        output += `- **${comp.name}**: ${comp.description}\n`;
      }
      output += "\n";
    }

    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: Get component details
server.tool(
  "get_component",
  "Get detailed information about a specific Bearnie component including its files and dependencies",
  {
    name: z
      .string()
      .describe(
        "The name of the component (e.g., 'button', 'accordion', 'dialog')"
      ),
  },
  async ({ name }) => {
    const component = await fetchComponent(name.toLowerCase());
    if (!component) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Component '${name}' not found. Use list_components to see available components.`,
          },
        ],
      };
    }

    let output = `# ${component.name}\n\n`;
    output += `**Description:** ${component.description}\n`;
    if (component.category) {
      output += `**Category:** ${component.category}\n`;
    }
    if (component.type === "utility") {
      output += `**Type:** Utility\n`;
    }
    output += "\n";

    if (component.dependencies?.length) {
      output += `**NPM Dependencies:** ${component.dependencies.join(", ")}\n\n`;
    }

    if (component.registryDependencies?.length) {
      output += `**Required Registry Dependencies:** ${component.registryDependencies.join(
        ", "
      )}\n\n`;
    }

    output += `## Files\n\n`;
    for (const file of component.files) {
      const ext = file.name.endsWith(".ts") ? "typescript" : "astro";
      output += `### ${file.path || file.name}\n\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
    }

    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: Add component to project
server.tool(
  "add_component",
  "Add a Bearnie component to the current Astro project. This will create the component files in src/components/bearnie/",
  {
    name: z
      .string()
      .describe(
        "The name of the component to add (e.g., 'button', 'accordion')"
      ),
    cwd: z
      .string()
      .optional()
      .describe("The working directory (defaults to current directory)"),
  },
  async ({ name, cwd }) => {
    const workingDir = cwd || process.cwd();
    const projectRoot = findProjectRoot(workingDir);

    if (!projectRoot) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Could not find project root (no package.json found). Make sure you're in an Astro project.",
          },
        ],
      };
    }

    const component = await fetchComponent(name.toLowerCase());
    if (!component) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Component '${name}' not found. Use list_components to see available components.`,
          },
        ],
      };
    }

    const results: string[] = [];

    // Helper to determine the correct destination path for a file
    const getFilePath = (file: ComponentFile, registryItem: ComponentRegistry): string => {
      // Use the path property which includes folder structure
      const relativePath = file.path || file.name;
      
      // Check if it's a utility
      if (registryItem.type === "utility" || relativePath.startsWith("utils/")) {
        return path.join(projectRoot, "src", relativePath);
      }
      
      // Otherwise it's a component
      return path.join(projectRoot, "src/components/bearnie", relativePath);
    };

    // Add registry dependencies first
    if (component.registryDependencies?.length) {
      for (const dep of component.registryDependencies) {
        const depComponent = await fetchComponent(dep);
        if (depComponent) {
          for (const file of depComponent.files) {
            const filePath = getFilePath(file, depComponent);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content);
            results.push(`✓ Added dependency: ${file.path || file.name}`);
          }
        }
      }
    }

    // Add the main component files
    for (const file of component.files) {
      const filePath = getFilePath(file, component);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content);
      results.push(`✓ Added: ${file.path || file.name}`);
    }

    let output = `# Added ${component.name}\n\n`;
    output += results.join("\n") + "\n\n";

    // Warn about npm dependencies
    if (component.dependencies?.length) {
      output += `## Required NPM Dependencies\n\n`;
      output += `Run the following command to install required packages:\n\n`;
      output += `\`\`\`bash\nnpm install ${component.dependencies.join(" ")}\n\`\`\`\n\n`;
    }

    output += `## Usage\n\n`;
    const componentName = component.name.charAt(0).toUpperCase() + component.name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    output += `\`\`\`astro\n---\nimport { ${componentName} } from "@/components/ui/${name}";\n---\n\n<${componentName}>Content</${componentName}>\n\`\`\``;

    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: Search components
server.tool(
  "search_components",
  "Search for Bearnie components by name, description, or category",
  {
    query: z
      .string()
      .describe(
        "Search query (matches against name, description, and category)"
      ),
  },
  async ({ query }) => {
    const index = await fetchIndex();
    if (!index) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Could not fetch component registry.",
          },
        ],
      };
    }

    const q = query.toLowerCase();
    const matches = index.components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No components found matching '${query}'. Use list_components to see all available components.`,
          },
        ],
      };
    }

    let output = `# Search Results for '${query}'\n\n`;
    for (const comp of matches) {
      output += `- **${comp.name}** (${comp.category}): ${comp.description}\n`;
    }

    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bearnie MCP server running on stdio");
}

main().catch(console.error);
