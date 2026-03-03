#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.2.3"
  exit 1
fi

VERSION="$1"

# Validate semver-ish format (Chrome manifest requires 1-4 dot-separated integers)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?$ ]]; then
  echo "Error: Version must be in format X.Y.Z or X.Y.Z.W (e.g. 1.2.3)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Update package.json
jq --arg v "$VERSION" '.version = $v' "$SCRIPT_DIR/package.json" > "$SCRIPT_DIR/package.json.tmp" \
  && mv "$SCRIPT_DIR/package.json.tmp" "$SCRIPT_DIR/package.json"
echo "Updated package.json to version $VERSION"

# Update public/manifest.json
jq --arg v "$VERSION" '.version = $v' "$SCRIPT_DIR/public/manifest.json" > "$SCRIPT_DIR/public/manifest.json.tmp" \
  && mv "$SCRIPT_DIR/public/manifest.json.tmp" "$SCRIPT_DIR/public/manifest.json"
echo "Updated public/manifest.json to version $VERSION"

# Ask about git tag
read -rp "Create git tag v$VERSION? [y/N] " CREATE_TAG
if [[ "$CREATE_TAG" =~ ^[Yy]$ ]]; then
  read -rp "Tag description: " TAG_DESC
  git tag -a "v$VERSION" -m "$TAG_DESC"
  echo "Created tag v$VERSION"
fi
