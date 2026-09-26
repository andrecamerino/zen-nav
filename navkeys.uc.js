// navkeys.uc.js — Sine mod: Ctrl+J/K tab/folder cycling, Ctrl+H/L workspace cycling.
//
// Ctrl+J/K use gBrowser.tabContainer.advanceSelectedItem(), Firefox's native
// method for traversing tabs AND tab-group ("folder") labels in visual order:
// landing on a tab switches to it immediately; landing on a folder label just
// moves the keyboard-focus cursor there without opening it. Firefox's own
// tabContainer keydown handler already opens a focused folder label on plain
// Space/Enter (it calls .click() on it) - it just needs real DOM focus on the
// item to receive that keypress, which is why we call .focus() below. Once a
// folder is opened, its tabs become plain visible items in the same list, so
// further Ctrl+J/K steps through them exactly like top-level tabs.
//
// Ctrl+H/L normally call gZenWorkspaces.changeWorkspaceShortcut() directly
// instead of dispatching cmd_zenWorkspaceForward/Backward, because that
// native path currently no-ops (sidebar "peeks" without switching) when
// Zen's sidebar is fully hidden in compact mode:
// https://github.com/zen-browser/desktop/issues/1813
//
// Exception: if the currently selected tab is an "essential" tab (Zen's
// cross-workspace pinned row, marked with the zen-essential attribute),
// Ctrl+H/L instead step across that row via gZenWorkspaces'
// getCurrentEssentialsContainer() (its DOM children include the essential
// tab elements, in order, alongside non-tab layout elements we filter out).
// Only once you'd move past the first/last essential does it fall through
// to the normal workspace switch.
(function () {
  if (window.__zenNavKeysInstalled) return;
  window.__zenNavKeysInstalled = true;

  const getEssentials = () => {
    const container = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
    if (!container) return [];
    return [...container.children].filter((el) =>
      el.classList?.contains("tabbrowser-tab")
    );
  };

  const navigateWorkspaceOrEssential = (dir) => {
    const selected = gBrowser.selectedTab;
    if (selected?.hasAttribute("zen-essential")) {
      const essentials = getEssentials();
      const index = essentials.indexOf(selected);
      const nextIndex = index + dir;
      if (index !== -1 && nextIndex >= 0 && nextIndex < essentials.length) {
        gBrowser.selectedTab = essentials[nextIndex];
        gBrowser.tabContainer.ariaFocusedItem?.focus();
        return;
      }
    }
    window.gZenWorkspaces?.changeWorkspaceShortcut(dir);
  };

  window.addEventListener(
    "keydown",
    (event) => {
      if (!event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "j":
          gBrowser.tabContainer.advanceSelectedItem(1, true);
          gBrowser.tabContainer.ariaFocusedItem?.focus();
          break;
        case "k":
          gBrowser.tabContainer.advanceSelectedItem(-1, true);
          gBrowser.tabContainer.ariaFocusedItem?.focus();
          break;
        case "l":
          navigateWorkspaceOrEssential(1);
          break;
        case "h":
          navigateWorkspaceOrEssential(-1);
          break;
        default:
          return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true }
  );
})();
