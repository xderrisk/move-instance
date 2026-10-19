UUID = move-instance@xderrisk.com
ZIP_FILE = $(UUID).shell-extension.zip
DEST = ~/.local/share/gnome-shell/extensions/$(UUID)
LOCALE_UUID = moveinstance
GNOME_VERSION := $(shell gnome-shell --version | grep -oP '\d+' | head -n 1)

.PHONY: compile-locales enable disable install pack logs nested pot

install: pack
	gnome-extensions install --force dist/$(ZIP_FILE)
	@echo "Installation completed in $(DEST)"

pack: compile-locales
	mkdir -p dist
	gnome-extensions pack --force --out-dir=dist

pot:
	xgettext -L Javascript -o ./po/moveinstance.pot *.js

compile-locales:
	@rm -rf locale
	@for po in po/*.po; do \
		lang=$$(basename $$po .po); \
		mkdir -p locale/$$lang/LC_MESSAGES; \
		msgfmt $$po -o locale/$$lang/LC_MESSAGES/$(LOCALE_UUID).mo; \
	done
	@echo "Translations ready."

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

nested: install
	if [ "$(GNOME_VERSION)" -ge 49 ]; then \
	    dbus-run-session gnome-shell --devkit --wayland; \
	else \
	    dbus-run-session gnome-shell --nested --wayland; \
	fi

logs:
	journalctl -f -o cat /usr/bin/gnome-shell | grep $(UUID)
