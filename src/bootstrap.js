var $__ghstar;

function log(msg) {
  Zotero.debug('GHSTAR:' + msg);
}

function install() {
  log('Installed GHSTAR 4.0.0');
}

async function startup({ id, version, rootURI }) {
  log('Starting GHSTAR 4.0.0');

  const filePath = `${rootURI}/ghstar.js`;
  Services.scriptloader.loadSubScript(filePath);

  Zotero.PreferencePanes.register({
    pluginID: 'justin@justinribeiro.com',
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
