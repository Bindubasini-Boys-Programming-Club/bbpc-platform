# Bearnie MCP Server

An MCP (Model Context Protocol) server that enables AI assistants like Claude, GitHub Copilot, and others to interact with the Bearnie UI component library.

## Features

- **List Components**: Browse all available Bearnie components
- **Search Components**: Find components by name, description, or category
- **Get Component Details**: View component source code and dependencies
- **Add Components**: Install components directly to your Astro project

## Installation

```bash
npm install -g @bearnie/mcp
```

Or use npx:

```bash
npx @bearnie/mcp
```

## Configuration

### VS Code (GitHub Copilot)

Add to your VS Code settings or `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "bearnie": {
      "command": "npx",
      "args": ["@bearnie/mcp"]
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "bearnie": {
      "command": "npx",
      "args": ["@bearnie/mcp"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "bearnie": {
      "command": "npx",
      "args": ["@bearnie/mcp"]
    }
  }
}
```

## Available Tools

### `list_components`

Lists all available Bearnie components grouped by category.

**Example prompt:** "What Bearnie components are available?"

### `search_components`

Search for components by name, description, or category.

**Parameters:**

- `query` (string): Search term

**Example prompt:** "Find Bearnie components for forms"

### `get_component`

Get detailed information about a specific component, including its source code.

**Parameters:**

- `name` (string): Component name (e.g., "button", "accordion")

**Example prompt:** "Show me the Bearnie button component"

### `add_component`

Add a component to your Astro project. Creates files in `src/components/bearnie/`.

**Parameters:**

- `name` (string): Component name to add
- `cwd` (string, optional): Working directory

**Example prompt:** "Add the accordion component to my project"

## Environment Variables

- `BEARNIE_REGISTRY_URL`: Override the default registry URL (default: `https://bearnie.dev/registry`)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev
```

## License

MIT
