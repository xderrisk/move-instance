# Contributing

Thanks for your interest in improving Move Already Open App! Here's how to set up a development environment and contribute.

## Development dependencies

- **GNOME Shell 48+**
- **make**
- **gettext**

On Debian:

```bash
sudo apt install make gettext
```

## Building and testing

| Command | Description |
| --- | --- |
| `make pack` | Build the extension zip into `dist/` (compiles locales first) |
| `make install` | Pack and install to `~/.local/share/gnome-shell/extensions/` |
| `make enable` / `make disable` | Enable or disable the extension |
| `make nested` | Run a nested Wayland GNOME Shell session for safe testing |
| `make logs` | Follow the journal for messages from this extension |
| `make pot` | Regenerate `po/moveinstance.pot` from the source |

## Contributing translations

Translations live in the `po/` directory. To add a new language, create a `.po` file from the template using your language code (e.g., `es` for Spanish):

```bash
msginit -i po/moveinstance.pot -o po/es.po -l es
```

Then translate the `msgstr` entries in the generated file. You can do this with any .po editor, for example [gTranslator](https://gitlab.gnome.org/GNOME/gtranslator/).

Compile the locales with `make compile-locales` and test the result with `make nested`. Finally, open a pull request with the new or updated `.po` file.

## Pull requests

- Keep changes focused and describe what they do and why.
- Test your changes in a nested shell (`make nested`) before submitting.
