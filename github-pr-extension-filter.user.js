// ==UserScript==
// @name         GitHub PR: show only one file extension
// @namespace    cpm-tools
// @version      1.3
// @description  Adds an "only" button to every extension in the "Filter by extension" menu of a pull request's changed files.
// @match        https://github.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const BUTTON_CLASS = "cpm-only-extension";

  // Both views honour ?file-filters[]=.cs; opening that address is one reload instead of one per toggled extension.
  function showOnlyExtension(extension) {
    const url = new URL(location.href);
    url.searchParams.delete("file-filters[]");
    url.searchParams.append("file-filters[]", extension);
    url.hash = "";
    location.assign(url.toString());
  }

  // Classic view: <input class="js-diff-file-type-option" type="checkbox" value=".ts"> inside a <label>.
  function addClassicButtons() {
    for (const input of document.querySelectorAll("input.js-diff-file-type-option")) {
      const label = input.closest("label");
      if (!label || label.querySelector("." + BUTTON_CLASS)) {
        continue;
      }
      label.appendChild(createOnlyButton(input.value));
    }
  }

  // New view: <ul aria-label="File extensions"> of <li role="menuitemcheckbox">,
  // each with a [data-component="ActionList.Item.Label"] holding ".cs".
  function addNewViewButtons() {
    for (const item of document.querySelectorAll('[aria-label="File extensions"] [role="menuitemcheckbox"]')) {
      if (item.querySelector("." + BUTTON_CLASS)) {
        continue;
      }
      const label = item.querySelector('[data-component="ActionList.Item.Label"]');
      const button = createOnlyButton(label.textContent.trim());
      button.style.marginLeft = "8px";
      label.after(button);
    }
  }

  function createOnlyButton(extension) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.textContent = "only";
    button.title = "Show only " + extension;
    button.style.cssText =
      "margin-left:auto;padding:0 8px;font-size:12px;line-height:20px;border-radius:6px;cursor:pointer;" +
      "border:1px solid var(--borderColor-default, #d0d7de);background:var(--bgColor-muted, #f6f8fa);" +
      "color:var(--fgColor-accent, #0969da);";
    for (const eventName of ["pointerdown", "mousedown", "pointerup", "mouseup", "keydown"]) {
      button.addEventListener(eventName, (event) => event.stopPropagation(), true);
    }
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        showOnlyExtension(extension);
      },
      true
    );
    return button;
  }

  function addButtons() {
    addClassicButtons();
    addNewViewButtons();
  }

  new MutationObserver(addButtons).observe(document.documentElement, { childList: true, subtree: true });
  addButtons();
})();
