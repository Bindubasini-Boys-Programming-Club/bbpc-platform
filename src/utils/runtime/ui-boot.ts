import { initComboboxes } from "@/utils/runtime/combobox";
import { initCommands, initCommandDialogs } from "@/utils/runtime/command";
import { initDisclosureTriggers } from "@/utils/runtime/disclosure-triggers";
import { initPopovers } from "@/utils/runtime/popover";

let hasBoundPageLoadListener = false;

function runUiInit() {
  initDisclosureTriggers();
  initPopovers();
  initCommands();
  initCommandDialogs();
  initComboboxes();
}

export function bootUiRuntime() {
  runUiInit();

  if (hasBoundPageLoadListener) return;
  hasBoundPageLoadListener = true;

  document.addEventListener("astro:page-load", runUiInit);
}
