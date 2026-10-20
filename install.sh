#!/usr/bin/env bash
set -euo pipefail

UUID="move-instance@xderrisk.com"
ZIP_NAME="${UUID}.shell-extension.zip"
REPO="xderrisk/move-instance"
BRANCH="${BRANCH:-main}"
TMP_DIR="$(mktemp -d)"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "Downloading ${REPO} (${BRANCH})..."
curl -fsSL "https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz" \
  | tar -xz -C "$TMP_DIR" --strip-components=1

cd "$TMP_DIR"

if ! command -v glib-compile-schemas >/dev/null; then
  echo "Error: glib-compile-schemas not found (install glib2 / libglib2.0-bin)." >&2
  exit 1
fi
glib-compile-schemas schemas/

rm -rf locale
if command -v msgfmt >/dev/null; then
  mkdir -p locale
  for po in po/*.po; do
    lang="$(basename "$po" .po)"
    mkdir -p "locale/$lang/LC_MESSAGES"
    msgfmt "$po" -o "locale/$lang/LC_MESSAGES/moveinstance.mo"
  done
  EXTRA_LOCALE=(--extra-source="$TMP_DIR/locale")
else
  echo "Warning: msgfmt not found, installing without translations (install gettext)." >&2
  EXTRA_LOCALE=()
fi

mkdir -p "$TMP_DIR/out"
gnome-extensions pack --force \
  "${EXTRA_LOCALE[@]}" \
  --extra-source="$TMP_DIR/schemas" \
  --schema="$TMP_DIR/schemas/org.gnome.shell.extensions.move-instance.gschema.xml" \
  --out-dir="$TMP_DIR/out" "$TMP_DIR"

gnome-extensions install --force "$TMP_DIR/out/$ZIP_NAME"

echo "Installed ${UUID}. Enabling..."
CURRENT="$(gsettings get org.gnome.shell enabled-extensions)"
if [[ "$CURRENT" == *"$UUID"* ]]; then
  echo "Already enabled."
else
  if [[ "$CURRENT" == "[]" ]]; then
    NEW="['${UUID}']"
  else
    NEW="$(echo "$CURRENT" | sed "s/]/, '${UUID}']/")"
  fi
  gsettings set org.gnome.shell enabled-extensions "$NEW"
fi

echo "Logging out in 5 seconds to apply (Ctrl+C to cancel)..."
sleep 5
gnome-session-quit --logout --no-prompt
