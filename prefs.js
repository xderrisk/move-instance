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
        "e.g. or.gnome.Nautilus, firefox-esr, org.gnome.Console\nFind it with Looking Glass (Alt+F2, lg) → Windows.",
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

    group.add(whitelistRow);
  }
}
