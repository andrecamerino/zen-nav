// navkeys.uc.js — Sine mod: Ctrl+J/K tab cycling, Ctrl+H/L workspace cycling.
//
// Ctrl+H/L call gZenWorkspaces.changeWorkspaceShortcut() directly instead of
// dispatching cmd_zenWorkspaceForward/Backward, because that native path
// currently no-ops (sidebar "peeks" without switching) when Zen's sidebar is
// fully hidden in compact mode: https://github.com/zen-browser/desktop/issues/1813
(function () {
  if (window.__zenNavKeysInstalled) return;
  window.__zenNavKeysInstalled = true;

  window.addEventListener(
    "keydown",
    (event) => {
      if (!event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "j":
          gBrowser.tabContainer.advanceSelectedTab(1, true);
          break;
        case "k":
          gBrowser.tabContainer.advanceSelectedTab(-1, true);
          break;
        case "l":
          window.gZenWorkspaces?.changeWorkspaceShortcut(1);
          break;
        case "h":
          window.gZenWorkspaces?.changeWorkspaceShortcut(-1);
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
