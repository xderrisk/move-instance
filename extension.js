import * as Workspace from "resource:///org/gnome/shell/ui/workspace.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class MoveInstanceExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._originalAcceptDrop = Workspace.Workspace.prototype.acceptDrop;
    const settings = this._settings;
    const originalAcceptDrop = this._originalAcceptDrop;

    Workspace.Workspace.prototype.acceptDrop = function (source) {
      const app = source.app || (source.getApp ? source.getApp() : null);

      if (app) {
        const windows = app.get_windows();
        const whitelist = settings.get_strv("whitelist");

        const hasMatchedWMClass = windows.some((window) => {
          const wmClass = window.get_wm_class()?.toLowerCase() || "";
          return whitelist.some((item) => wmClass.includes(item.toLowerCase()));
        });

        const isSingleInstance =
          !app.can_open_new_window() || hasMatchedWMClass;

        if (isSingleInstance && windows.length > 0) {
          const windowToMove =
            windows.find((w) => w.get_window_type() === 0) || windows[0];
          if (windowToMove) {
            windowToMove.change_workspace(this.metaWorkspace);
            return true;
          }
        }
      }
      return originalAcceptDrop.apply(this, arguments);
    };
  }

  disable() {
    Workspace.Workspace.prototype.acceptDrop = this._originalAcceptDrop;
    this._originalAcceptDrop = null;
    this._settings = null;
  }
}
