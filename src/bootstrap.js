'use strict';
/* global Components, Services */
/* global $__ghstar */

const { classes: Cc, utils: Cu, interfaces: Ci } = Components;
let chromeHandle;

function log(msg) {
  Zotero.debug('GHSTAR:' + msg);
}

function install() {
  log('Installed GHSTAR 8.0.0');
}

async function startup({ id, version, rootURI }) {
  log('Starting GHSTAR 8.0.0');

  const aomStartup = Cc['@mozilla.org/addons/addon-manager;1'].getService(
    Ci.amIAddonManagerStartup,
  );
  var manifestURI = Services.io.newURI(rootURI + 'manifest.json');
  chromeHandle = aomStartup.registerChrome(manifestURI, [
    ['content', 'ghstar', rootURI],
  ]);

  const filePath = `${rootURI}/ghstar.js`;
  Services.scriptloader.loadSubScript(filePath);

  Zotero.PreferencePanes.register({
    pluginID: 'dalao1002@gmail.com',
    src: `${rootURI}prefs.xhtml`,
  });

  $__ghstar.app.init({ id, version, rootURI });
  $__ghstar.app.addToAllWindows();
  await $__ghstar.app.main();
}

function onMainWindowLoad({ window }) {
  $__ghstar.app.addToWindow(window);
}

function onMainWindowUnload({ window }) {
  $__ghstar.app.removeFromWindow(window);
}

function shutdown() {
  $__ghstar.app.removeFromAllWindows();
}

function uninstall() {
  $__ghstar.app.removeFromAllWindows();
}
