import path from "path";
import fs from "fs-extra";

export interface ProjectConfig {
  componentsDir: string;
  utilsDir: string;
  tailwindConfig: string;
  typescript: boolean;
}

export const DEFAULT_CONFIG: ProjectConfig = {
  componentsDir: "src/components/bearnie",
  utilsDir: "src/utils",
  tailwindConfig: "tailwind.config.mjs",
  typescript: true,
};

export const CONFIG_FILE = "bearnie.json";

export async function getProjectConfig(
  cwd: string
): Promise<ProjectConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILE);

  if (await fs.pathExists(configPath)) {
    const content = await fs.readFile(configPath, "utf-8");
    return JSON.parse(content);
  }

  return null;
}

export async function saveProjectConfig(
  cwd: string,
  config: ProjectConfig
): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

export async function isAstroProject(cwd: string): Promise<boolean> {
  const packageJsonPath = path.join(cwd, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    return false;
  }

  const packageJson = await fs.readJson(packageJsonPath);
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return "astro" in deps;
}

export async function hasTailwindInstalled(cwd: string): Promise<boolean> {
  const packageJsonPath = path.join(cwd, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    return false;
  }

  const packageJson = await fs.readJson(packageJsonPath);
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return "tailwindcss" in deps;
}

export async function writeComponentFile(
  cwd: string,
  config: ProjectConfig,
  componentPath: string,
  content: string,
  overwrite: boolean = false
): Promise<{ written: boolean; path: string }> {
  const fullPath = path.join(cwd, config.componentsDir, componentPath);

  // Check if file exists
  if ((await fs.pathExists(fullPath)) && !overwrite) {
    return { written: false, path: fullPath };
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(fullPath));

  // Write file
  await fs.writeFile(fullPath, content);

  return { written: true, path: fullPath };
}

export async function writeUtilFile(
  cwd: string,
  config: ProjectConfig,
  utilPath: string,
  content: string,
  overwrite: boolean = false
): Promise<{ written: boolean; path: string }> {
  const fullPath = path.join(cwd, config.utilsDir, utilPath);

  if ((await fs.pathExists(fullPath)) && !overwrite) {
    return { written: false, path: fullPath };
  }

  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content);

  return { written: true, path: fullPath };
}
