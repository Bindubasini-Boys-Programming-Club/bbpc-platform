import chalk from "chalk";
import ora from "ora";
import { getRegistryIndex } from "../utils/registry.js";
import { brand, messages, print } from "../utils/ui.js";

interface ListOptions {
  json?: boolean;
}

export async function list(options: ListOptions) {
  const spinner = ora({
    text: messages.fetching(),
    color: "green",
  }).start();

  try {
    const registry = await getRegistryIndex();
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(registry.components, null, 2));
      return;
    }

    // Header
    print.newline();
    console.log(`  ${messages.listHeader(registry.version)}`);
    print.newline();

    // Group by category
    const categories = new Map<string, typeof registry.components>();

    for (const component of registry.components) {
      const cat = component.category || "other";
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      categories.get(cat)!.push(component);
    }

    // Category config with emojis
    const categoryConfig: Record<string, { emoji: string; label: string }> = {
      foundation: { emoji: "🎨", label: "Foundation" },
      form: { emoji: "📝", label: "Form" },
      layout: { emoji: "📐", label: "Layout" },
      navigation: { emoji: "🧭", label: "Navigation" },
      feedback: { emoji: "💬", label: "Feedback" },
      disclosure: { emoji: "📂", label: "Disclosure" },
      display: { emoji: "✨", label: "Display" },
      other: { emoji: "📦", label: "Other" },
    };

    const categoryOrder = [
      "foundation",
      "form",
      "layout",
      "navigation",
      "feedback",
      "disclosure",
      "display",
      "other",
    ];

    // Display by category
    for (const category of categoryOrder) {
      const components = categories.get(category);
      if (!components || components.length === 0) continue;

      const config = categoryConfig[category] || { emoji: "📦", label: category };
      console.log(`  ${config.emoji} ${chalk.bold(config.label)}`);
      print.newline();

      for (const component of components) {
        const name = brand.accent(component.name.padEnd(18));
        const desc = brand.muted(component.description);
        console.log(`     ${name} ${desc}`);
      }

      print.newline();
    }

    // Footer
    console.log(`  ${messages.listFooter(registry.components.length)}`);
    print.newline();

    // Quick actions
    console.log(`  ${chalk.bold("Quick commands:")}`);
    console.log(`  ${brand.muted("→")} Add a component:    ${chalk.cyan("npx bearnie add button")}`);
    console.log(`  ${brand.muted("→")} Add everything:     ${chalk.cyan("npx bearnie add --all")}`);
    console.log(`  ${brand.muted("→")} Add CSS variables:  ${chalk.cyan("npx bearnie add styles")}`);
    print.newline();

  } catch (error) {
    spinner.fail(messages.networkError());
    print.hint(messages.networkErrorHelp());
    process.exit(1);
  }
}
