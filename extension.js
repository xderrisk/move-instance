import * as Workspace from "resource:///org/gnome/shell/ui/workspace.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class MoveInstanceExtension extends Extension {
  enable() {
    const settings = this.getSettings();
    const origDrop = Workspace.Workspace.prototype.acceptDrop;

    Workspace.Workspace.prototype.acceptDrop = function (source) {
      const app = source.app ?? source.getApp?.();
      if (!app) return origDrop.apply(this, arguments);

      const windows = app.get_windows();
      if (!windows.length) return origDrop.apply(this, arguments);

      const whitelist = settings.get_strv("whitelist");
      const hasWL = windows.some((w) =>
        whitelist.some((item) =>
          (w.get_wm_class() ?? "").toLowerCase().includes(item.toLowerCase()),
        ),
      );

      if (!app.can_open_new_window() || hasWL) {
        const win =
          windows.find((w) => w.get_window_type() === 0) ?? windows[0];
        win.change_workspace(this.metaWorkspace);
        return true;
      }

      return origDrop.apply(this, arguments);
    };

    this._origDrop = origDrop;
  }

  disable() {
    Workspace.Workspace.prototype.acceptDrop = this._origDrop;
    this._origDrop = null;
  }
}
