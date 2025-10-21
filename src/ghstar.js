/**
 * A short hand typedef for general use, not exhaustive of the Zotero Schema
 * @typedef {Object} ZoteroGenericItem
 * @property {function} getCreators returns an array of creators/authors
 * @property {function} getField returns a specific schema field
 * @property {String} DOI
 * @property {String} ISSN
 * @property {String} abstractNote
 * @property {String} accessDate
 * @property {Array} collections
 * @property {ZoteroCreator[]} creators
 * @property {String} date
 * @property {String} dateAdded
 * @property {String} dateModified
 * @property {String} extra
 * @property {String} issue
 * @property {String} itemType
 * @property {String} journalAbbreviation
 * @property {String} key
 * @property {String} pages
 * @property {String} publicationTitle
 * @property {Object} relations
 * @property {Array} tags
 * @property {String} title
 * @property {String} url
 * @property {String} version
 * @property {String} volume
 */

/**
 * A short hand typedef for general use, not exhaustive of the Zotero Schema
 * @typedef {Object} ZoteroCreator
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} creatorType
 */

Components.utils.import('resource://gre/modules/Services.jsm');

$__ghstar = {};

$__ghstar.debugger = {
  /**
   * Print an info message to the console
   * @param {string} message
   */
  info: function (message) {
    this.__debugMessage(message, 3);
  },
  /**
   * Print an error message to the console
   * @param {string} message
   */
  warn: function (message) {
    this.__debugMessage(message, 1);
  },
  /**
   * Print an warning message to the console
   * @param {string} message
   */
  error: function (message) {
    this.__debugMessage(message, 0);
  },
  /**
   * Print a message to the debug console
   * @param {string} message
   * @param {number} level
   * @param {number} maxDepth
   * @param {object} stack
   */
  __debugMessage: function (message, level = 3, maxDepth = 5, stack = null) {
    const prependMessage = `[GHSTAR]: ${message}`;
    Zotero.Debug.log(prependMessage, level, maxDepth, stack);
  },
};

$__ghstar.util = {
  /**
   * A method to sleep via setTimeout/promise
   * @async
   * @param {number} ms
   */
  sleep: async function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  /**
   * Promise-based XHR for getting data (don't use fetch() it'll bust Scholar)
   * @param {object} opts
   * @param {string} opts.method HTTP Verb (e.g. GET)
   * @param {string} opts.url HTTP endpoint uri
   * @returns
   */
  request: async function (opts) {
    $__ghstar.debugger.info(`${opts.method} ${opts.url}`);
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method, opts.url);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(xhr);
        }
      };
      if (opts.headers) {
        Object.keys(opts.headers).forEach((key) => {
          xhr.setRequestHeader(key, opts.headers[key]);
        });
      }
      xhr.send();
    });
  },
  /**
   * Get a random number
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  randomInteger: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  /**
   * Add zero's to a given string
   * @param {string} string the string to pad with zeros
   * @param {number} length the length of the string
   * @returns
   */
  padCountWithZeros: function (string, length) {
    return string.padStart(length, '0');
  },
  /**
   * Open a user interactive window, holds the window reference, and waits to
   * complete the recaptcha check before resolving promise
   * @param {string} targetUrl The url which caused the recaptcha
   * @return {Promise}
   */
  openRecaptchaWindow: async function (targetUrl) {
    const window = Zotero.getMainWindow();

    const alertMessage = await window.document.l10n.formatValue(
      'ghstar-recapatcha-alert',
    );
    window.alert(alertMessage);

    let intervalWindowCloseState;

    const checkWindowClosed = (modalWindowHandle, resolve) => {
      if (modalWindowHandle?.closed) {
        $__ghstar.debugger.info('recaptcha window closed');
        clearInterval(intervalWindowCloseState);
        resolve();
      } else {
        $__ghstar.debugger.info(`waiting for recaptcha user complete...`);
      }
    };

    const recaptchaWindow = Zotero.openInViewer(targetUrl);

    return new Promise((resolve) =>
      checkWindowClosed(recaptchaWindow, resolve),
    );
  },
};

$__ghstar.app = {
  /**
   * The overall length of the citation count
   * @private
   */
  __citeCountStrLength: 7,
  /**
   * The string prefix for the citation count
   * @private
   */
  __extraEntryPrefix: 'GHSTAR',
  /**
   * The string append for the citation count
   * @private
   */
  __extraEntrySeparator: ' \n',
  /**
   * The string for when citation count is empty
   * @private
   */
  __noData: 'NoCitationData',
  /**
   * Default String search in Github API,
   * will override based on locale
   * @private
   */
  __citedByPrefix: 'Cited by',
  /**
   * My own marker for init; not for general use
   * @private
   */
  __initialized: false,
  /**
   * Key holder for Zotero Column Management
   * @type {string | string[] | false}
   * @private
   */
  __registeredDataKey: false,
  /**
   * Key holder for Zotero Item Notifier Management
   * @type {string | string[] | false}
   * @private
   */
  __registeredNotifierKey: false,
  /**
   * Fallbacks for Zotero preferences
   * @private
   */
  __preferenceDefaults: {
    useRandomWait: true,
    randomWaitMinMs: 1000,
    randomWaitMaxMs: 5000,
    useFuzzyMatch: false,
    useSearchTitleFuzzyMatch: false,
    useSearchAuthorsMatch: true,
    useDateRangeMatch: false,
    defaultGithubApiEndpoint: 'https://api.github.com',
  },
  /**
   * Initialize our world.
   * @return {void}
   */
  init: ({ id, version, rootURI } = {}) => {
    if (this.initialized) return;
    this.id = id;
    this.version = version;
    this.rootURI = rootURI;

    // sanity
    $__ghstar.app.__initialized = true;

    $__ghstar.debugger.info(`Init() Complete! ${this.rootURI}`);
  },

  main: async function () {
    // Global properties are included automatically in Zotero 7
    // no need for default spin-up
  },

  getActivePane: function () {
    return Zotero.getActiveZoteroPane();
  },

  /**
   * Return the a resuable progress window for user updates
   * @returns Zotero.ProgressWindow
   */
  getProgressWindow: function () {
    if (!$__ghstar.app.progressWindow) {
      $__ghstar.app.progressWindow = new Zotero.ProgressWindow();
    }
    return $__ghstar.app.progressWindow;
  },

  addToWindow: async function (window) {
    const doc = window.document;

    // Fluent for localization
    window.MozXULElement.insertFTLIfNeeded('ghstar.ftl');

    const XUL_NS =
      'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

    // Add menu option
    const menuitem = doc.createElementNS(XUL_NS, 'menuitem');
    menuitem.id = 'ghstar-get-count';
    menuitem.classList.add(
      'menuitem-iconic',
      'zotero-menuitem-retrieve-metadata',
    );
    menuitem.setAttribute('data-l10n-id', 'ghstar-menuitem');
    menuitem.addEventListener('command', async () => {
      await $__ghstar.app.updateItemMenuEntries();
    });
    doc.getElementById('zotero-itemmenu').appendChild(menuitem);

    $__ghstar.debugger.info(`Menu Item Option Added to Right Click Menu`);

    const columnLabel = await doc.l10n.formatValue('ghstar-column-name');
    const columnLastUpdateLabel = await doc.l10n.formatValue(
      'ghstar-ghStarLastUpdated-column-name',
    );
    $__ghstar.app.__registeredDataKey =
      await Zotero.ItemTreeManager.registerColumns([
        {
          dataKey: 'ghstarCount',
          label: columnLabel,
          pluginID: 'dalao1002@gmail.com',
          dataProvider: (item, dataKey) => {
            return this.setColumnData(item, 'ghStarCount');
          },
          zoteroPersist: ['width', 'hidden', 'sortDirection'],
        },
        {
          dataKey: 'ghstarCountUpdated',
          label: columnLastUpdateLabel,
          pluginID: 'dalao1002@gmail.com',
          dataProvider: (item, dataKey) => {
            return this.setColumnData(item, 'ghStarLastUpdated');
          },
          zoteroPersist: ['width', 'hidden', 'sortDirection'],
        }
      ]);

    $__ghstar.app.registerNotifier();
  },

  /**
   * Register a notifier for items added to the library
   */
  registerNotifier: async function () {
    const callback = {
      notify: async (event, type, ids) => {
        this.onItemNotify(event, type, ids);
      },
    };
    $__ghstar.app.__registeredNotifierKey = Zotero.Notifier.registerObserver(
      callback,
      ['item'],
    );
  },

  /**
   * Update the citation count for a newly added item
   * @param {string} event
   * @param {string} type
   * @param {number[] | string[]} ids
   */
  onItemNotify: async (event, type, ids) => {
    const useAutoCountUpdate = Zotero.Prefs.get(
      'extensions.zotero.ghstar.useAutoCountUpdate',
      true,
    );

    $__ghstar.debugger.info(`useAutoCountUpdate set to ${useAutoCountUpdate}`);

    if (useAutoCountUpdate && event === 'add' && type === 'item') {
      $__ghstar.debugger.info(`useAutoSearch running on new add!`);
      const newItems = await Zotero.Items.getAsync(ids);
      await $__ghstar.app.processItems(newItems);
    }
  },

  /**
   * Set the custom column for the GHStarExtra field key by parsing the extra field
   * @param {String} extraString
   */
  setColumnData: function (item, field) {
    const extraString = item.getField('extra');
    const data = this.extraFieldExtractor(extraString);
    return data[field];
  },

  /**
   * GHSTAR Extra Data Type
   * @typedef {Object} GHStarExtra
   * @property {number} ghStarCount - The GS citation count
   * @property {date} lateUpdated - The last time we pulled the data.
   * @property {number} relevanceScore - The relative relevance of the citations
   */
  /**
   * Break apart all the variants we can think of for other uses
   * @param {String} extraString
   * @return {GHStarExtra}
   */
  extraFieldExtractor: function (extraString) {
    const parts = {
      ghStarCount: 0,
      ghStarLastUpdated: '',
      relevanceScore: 0,
    };
    try {
      // Look everywhere but always on a single line
      const regex = new RegExp(
        String.raw`^${this.__extraEntryPrefix}.*$`,
        'gm',
      );
      const match = extraString.match(regex)[0];

      if (match) {
        // cool, a match, let's break it up
        let matches = match.split(' ');
        if (matches[0] !== `GHSTAR:`) {
          // Compressed string, split it
          const splitter = matches[0].split(':');
          matches.shift();
          matches = splitter.concat(matches);
        }

        parts.ghStarCount = parseInt(matches[1] ?? parts?.ghStarCount);
        parts.ghStarLastUpdated = matches[2]
          ? new Date(matches[2]).toLocaleString()
          : parts?.ghStarLastUpdated;
        parts.relevanceScore =
          parseFloat(matches[3] ?? parts?.relevanceScore) || 0;
      }
    } catch {
      // dead case for weird behavior
    }
    return parts;
  },

  removeFromWindow: async function (win) {
    const doc = win.document;
    await Zotero.ItemTreeManager.unregisterColumns(
      $__ghstar.app.registeredDataKey,
    );

    try {
      // failsafe
      doc.querySelector('#ghstar-get-count').remove();
      $__ghstar.debugger.info('Running failsafe remove custom column.');
    } catch {}
  },
  addToAllWindows: function () {
    var windows = Zotero.getMainWindows();
    for (let win of windows) {
      if (!win.ZoteroPane) continue;
      this.addToWindow(win);
    }
  },
  removeFromAllWindows: function () {
    var windows = Zotero.getMainWindows();
    for (let win of windows) {
      if (!win.ZoteroPane) continue;
      this.removeFromWindow(win);
    }
  },
  /**
   * Verify is the Zotero item record is Github repo
   * @param {ZoteroGenericItem} item
   * @return {boolean}
   */
  hasRequiredFields: function (item) {
    return item.itemType === "computerProgram" && item.getField("url") && item.getField("url").startsWith("https://github.com/");
  },
  updateCollectionMenuEntry: async function () {
    const zoteroPane = $__ghstar.app.getActivePane();
    const window = Zotero.getMainWindow();

    const permissionAlertString = await window.document.l10n.formatValue(
      'ghstar-lackPermissions',
    );

    if (!zoteroPane.canEditLibrary()) {
      window.alert(permissionAlertString);
      return;
    }

    const group = zoteroPane.getSelectedGroup();
    if (group) {
      this.updateGroup(zoteroPane.getSelectedGroup());
      return;
    }

    const collection = zoteroPane.getSelectedCollection();
    if (collection) {
      await this.updateCollection(collection);
      return;
    }

    const unSupportedEntryTypeString = await window.document.l10n.formatValue(
      'ghstar-unSupportedEntryType',
    );
    window.alert(unSupportedEntryTypeString);
    return;
  },
  updateItemMenuEntries: async function () {
    const zoteroPane = $__ghstar.app.getActivePane();
    const window = Zotero.getMainWindow();

    if (!zoteroPane.canEditLibrary()) {
      const permissionAlertString = await window.document.l10n.formatValue(
        'ghstar-lackPermissions',
      );
      window.alert(permissionAlertString);
      return;
    }
    await this.processItems(zoteroPane.getSelectedItems());
  },
  updateGroup: async function () {
    const window = Zotero.getMainWindow();
    const unSupportedGroupCollectionString =
      await window.document.l10n.formatValue('ghstar-unSupportedGroupCollection');
    window.alert(unSupportedGroupCollectionString);
    return;
  },
  updateCollection: async function (collection) {
    await this.processItems(collection.getChildItems());
    const childCollections = collection.getChildCollections();
    for (let idx = 0; idx < childCollections.length; ++idx) {
      this.updateCollection(childCollections[idx]);
    }
  },
  /**
   * fetch and process data and update the selected entries from Zotero
   * @param {ZoteroGenericItem[]} items
   */
  processItems: async function (items) {
    const useQueue = Zotero.Prefs.get(
      'extensions.zotero.ghstar.useRandomWait',
      $__ghstar.app.__preferenceDefaults.useRandomWait,
    );

    let queueMinWaitMs;
    let queueMaxWaitMs;

    $__ghstar.debugger.info(`Use Queue: ${useQueue}`);

    if (useQueue) {
      queueMinWaitMs = Zotero.Prefs.get(
        'extensions.zotero.ghstar.randomWaitMinMs',
        $__ghstar.app.__preferenceDefaults.randomWaitMinMs,
      );
      queueMaxWaitMs = Zotero.Prefs.get(
        'extensions.zotero.ghstar.randomWaitMaxMs',
        $__ghstar.app.__preferenceDefaults.randomWaitMaxMs,
      );

      $__ghstar.debugger.info(`Min: ${queueMinWaitMs} Max: ${queueMaxWaitMs}`);
    }

    // we need to validate if the Github API URL setting is sane
    // otherwise we risk DDoS'ing the user with alerts
    const apiEndpoint = await this.getApiEndpoint();
    if (!apiEndpoint) {
      // we threw the error to the user, bail on any other work
      $__ghstar.debugger.error(
        `Github API URL is malformed in Settings, stopping work.`,
      );
      return;
    }

    /**
     * @param {number} index
     * @param {ZoteroGenericItem} item
     */
    for (const [index, item] of items.entries()) {
      if (!this.hasRequiredFields(item)) {
        $__ghstar.debugger.warn(
          `skipping item '${item.getField(
            'title',
          )}': empty URL or non Github software'`,
        );
      } else {
        // check the prefs in case user override, don't use it on the first item
        // either way
        if (useQueue && index > 0) {
          const queueTime = $__ghstar.util.randomInteger(
            queueMinWaitMs,
            queueMaxWaitMs,
          );

          $__ghstar.debugger.info(`queued for ${queueTime} ms later.`);
          await $__ghstar.util.sleep(queueTime);
        }

        const response = await this.retrieveGithubStarCountData(item);
        await this.processGithubStarResponse(
          response.status,
          response.responseText,
          1000,
          response.responseURL,
          item,
        );
      }
    }
  },
  /**
   * update a record with the citation data
   * @param {ZoteroGenericItem} item
   * @param {number} citeCount
   */
  updateItem: function (item, citeCount) {
    const fieldExtra = item.getField('extra');
    const fieldPublicationDate = item.getField('date');
    const buildNewCiteCount = this.buildCiteCountString(
      citeCount,
      fieldPublicationDate,
    );
    let revisedExtraField;

    if (fieldExtra.startsWith(this.__extraEntryPrefix)) {
      revisedExtraField = fieldExtra.replace(
        new RegExp(String.raw`${this.__extraEntryPrefix}:(.*)[^ \n]`, 'g'),
        buildNewCiteCount,
      );
      $__ghstar.debugger.info(
        `existing cite count in extra field, updating to ${buildNewCiteCount} ${revisedExtraField}`,
      );
    } else {
      $__ghstar.debugger.info(`no existing cite count in extra field, adding`);
      revisedExtraField =
        `${buildNewCiteCount}${this.__extraEntrySeparator}`.concat(
          '',
          fieldExtra,
        );
    }
    item.setField('extra', revisedExtraField);

    try {
      item.saveTx();
    } catch (e) {
      $__ghstar.debugger.error(
        `could not update extra field with citation count: ${e}`,
      );
    }

    this.openProgressWindow(citeCount, item.getField('title'));
  },
  /**
   * Show the progress window pop-up with the latest change
   * @param {number} count Total number of citations
   * @param {string} title ZoteroItem title
   */
  openProgressWindow: async function (count, title) {
    const window = Zotero.getMainWindow();
    const progressPopUp = this.getProgressWindow();
    const headlineLabel = await window.document.l10n.formatValue(
      'ghstar-progresswindow-title',
    );
    const descriptionLabel = await window.document.l10n.formatValue(
      'ghstar-progresswindow-desc',
    );

    progressPopUp.changeHeadline(headlineLabel);
    progressPopUp.addDescription(`${descriptionLabel}: ${count}, "${title}"`);
    progressPopUp.show();
    progressPopUp.startCloseTimer();
  },

  /**
   * Retrieve the Github stars count for a given Zotero item record
   * @param {ZoteroGenericItem} item Used to generate the fetch() string
   * @param {function} callback callback on complete
   */
  retrieveGithubStarCountData: async function (item) {
    const targetUrl = await this.generateItemUrl(item);
    return $__ghstar.util.request({ method: 'GET', url: targetUrl });
  },
  /**
   * process the fetch request for information
   * @param {number} requestStatus the http response from the XHR
   * @param {string} requestData  the http response string from the XHR
   * @param {string} requestRetry the http retry header, if available
   * @param {string} targetUrl which url did we request
   * @param {ZoteroGenericItem} item the item we're looking up
   * @param {function} callback the updateItem callback.
   */
  processGithubStarResponse: async function (
    requestStatus,
    requestData,
    requestRetry,
    targetUrl,
    item,
  ) {
    $__ghstar.debugger.info(`Request Status: ${requestStatus}`);
    let retryResponse;
    switch (requestStatus) {
      case 200:
        $__ghstar.debugger.info(
          "Github API returned result, parsing star count",
        );
        this.updateItem(item, this.getStarCount(requestData));
        break;
      default:
        $__ghstar.debugger.error(
          `Github API fetch failed for item: ${targetUrl}`,
        );
        break;
    }
  },
  /**
   * Validate and return the Github API URL API target
   * @returns {URL|null}
   */
  getApiEndpoint: async function () {
    let apiEndpoint;
    try {
      apiEndpoint = new URL(
        Zotero.Prefs.get(
          'extensions.zotero.ghstar.defaultGithubApiEndpoint',
          $__ghstar.app.__preferenceDefaults.defaultGithubApiEndpoint,
        ),
      );
    } catch {
      const window = Zotero.getMainWindow();
      const invalidGoogleScholarURL = await window.document.l10n.formatValue(
        'ghstar-invalidGoogleScholarURL',
      );
      window.alert(invalidGoogleScholarURL);
      return null;
    }
    return apiEndpoint;
  },

  /**
   * Generate a Github API URL to use to fetch data
   * @param {ZoteroGenericItem} item
   * @returns string
   */
  generateItemUrl: async function (item) {
    const apiEndpoint = await $__ghstar.app.getApiEndpoint();

    // get URL field
    const url = item.getField('url') || '';

    const targetUrl = url.replace(/^https:\/\/github.com\//, `${apiEndpoint.href}repos/`);
    $__ghstar.debugger.info(`Github API Endpoint Ready: ${targetUrl}`);

    return encodeURI(targetUrl);
  },
  /**
   * Create the citation string for use on the item record
   * @param {number} citeCount
   * @returns string
   */
  buildCiteCountString: function (citeCount, publicationDate) {
    let data;
    if (citeCount < 0) {
      data = this.__noData;
    } else {
      data = $__ghstar.util.padCountWithZeros(
        citeCount.toString(),
        this.__citeCountStrLength,
      );
    }

    return `${this.__extraEntryPrefix}: ${data} ${new Date().toISOString()} 0`;
  },
  /**
   * Parse the raw response for citation count
   * @param {string} responseText The raw string data to look for cited data
   * @returns number
   */
  getStarCount: function (responseText) {
    const count = JSON.parse(responseText)?.stargazers_count || 0;
    $__ghstar.debugger.info(
          `parsing star count ${count}`,
    );
    return count;
  },
};

/**
 * The handlers are what bind to the actions within the overlay XUL
 */
$__ghstar.handlers = {
  updateCollectionMenuEntry: async function () {
    await $__ghstar.app.updateCollectionMenuEntry();
  },
  updateItemMenuEntries: async function () {
    await $__ghstar.app.updateItemMenuEntries();
  },
};

// For testing only
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $__ghstar,
  };
}
