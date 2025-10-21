#!/bin/sh

# set the version for our file
# requires NPM 7.20+
version=$(npm pkg get version | tr -d '"')

rm -rf build
mkdir -p build
cd src
zip -r ../build/zotero-github-star-count-${version}.xpi *
cd ..

# patch plugin version
sed -i -E "s/\"version\": *\"[^\"]+\"/\"version\": \"${version}\"/" updates.json
sed -i -E "s/\"version\": *\"[^\"]+\"/\"version\": \"${version}\"/" src/manifest.json

# patch update link
updatelink="https://github.com/vitaminac/zotero-github-star-count/releases/download/v${version}/zotero-github-star-count-${version}.xpi"
sed -i -E "s#\"update_link\": *\"[^\"]+\"#\"update_link\": \"${updatelink}\"#" updates.json

# patch XPI hash
hash=$(sh -c 'sha256sum < "$1" | cut -d" " -f1' -- ./build/zotero-github-star-count-${version}.xpi)
sed -i -E "s/\"update_hash\": *\"[^\"]+\"/\"update_hash\": \"sha256:${hash}\"/" updates.json

