import Adw from "gi://Adw";
import Gio from "gi://Gio";
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class MoveInstancePrefs extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: _("Configuration"),
    });

    window.add(page);
    page.add(group);

    const forceSingleInstanceRow = new Adw.SwitchRow({
      title: _("Treat all apps as single instance"),
      subtitle: _(
        "Move any dragged app to the current workspace instead of launching a new window",
      ),
    });
    settings.bind(
      "force-all",
      forceSingleInstanceRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
    group.add(forceSingleInstanceRow);

    const whitelistRow = new Adw.EntryRow({
      title: _(
        "Force specific apps by adding their wmclass (comma separated).",
      ),
      show_apply_button: true,
    });

    whitelistRow.set_tooltip_text(
      _(
        "e.g. org.gnome.Nautilus, firefox-esr, org.gnome.Console\nFind it with Looking Glass (Alt+F2, lg) → Windows.",
      ),
    );
    whitelistRow.text = settings.get_strv("whitelist").join(", ");

    whitelistRow.connect("apply", (entry) => {
      const wmClassList = entry
        .get_text()
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
      settings.set_strv("whitelist", wmClassList);
    });

    settings.bind(
      "force-all",
      whitelistRow,
      "sensitive",
      Gio.SettingsBindFlags.GET | Gio.SettingsBindFlags.INVERT_BOOLEAN,
    );

    group.add(whitelistRow);

    const resetRow = new Adw.ButtonRow({
      title: _("Reset all settings"),
    });
    resetRow.add_css_class("destructive-action");
    resetRow.connect("activated", () => {
      const resetDialog = new Adw.AlertDialog({
        heading: _("Reset all settings?"),
        body: _("This will restore all options to their default values."),
      });
      resetDialog.add_response("cancel", _("Cancel"));
      resetDialog.add_response("reset", _("Reset"));
      resetDialog.set_response_appearance(
        "reset",
        Adw.ResponseAppearance.DESTRUCTIVE,
      );
      resetDialog.set_default_response("cancel");
      resetDialog.set_close_response("cancel");
      resetDialog.connect("response", (_, response) => {
        if (response !== "reset") return;
        for (const key of settings.settings_schema.list_keys())
          settings.reset(key);
        whitelistRow.text = "";
      });
      resetDialog.present(window);
    });
    group.add(resetRow);
  }
}
