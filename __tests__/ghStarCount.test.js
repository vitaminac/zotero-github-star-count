const base = require('../src/ghstar.js');
const hasStarCount = require('./__data__/ghResponseHasStarCount.js');
const singleItemWithCount = require('./__data__/zoteroItemsListSingleItemWithCount.js');
const singleItemWithCountLegacyFormat = require('./__data__/zoteroItemsListSingleItemWithCountLegacyFormat.js');
const singleItemNoCount = require('./__data__/zoteroItemsListSingleItemWithNoCount.js');
const singleItemSoftware = require('./__data__/zoteroItemsListSingleItemSoftware.js');
const singleItemNonSoftware = require('./__data__/zoteroItemsListSingleItemNonSoftware.js');
const itemsList = require('./__data__/zoteroItemsList.js');
const extraFieldTester = require('./__data__/extraFieldExtractorData.js');

window.alert = jest.fn();

describe('Verify $__ghstar.app sanity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  it('init() should set app', () => {
    const id = 'ghstar';
    const version = '4.0.0';
    const rootURI = 'justinribeiro.com';
    base.$__ghstar.app.init({ id, version, rootURI });

    expect(base.$__ghstar.app.__initialized).toBe(true);
  });

  it('getStarCount() should return number', () => {
    const test = base.$__ghstar.app.getStarCount(hasStarCount.data);
    expect(test).toBe(1028);
  });

  describe("when buildGhStarCountExtraInfoLine()", () => {
    it("should format string with star count and Github repository URL", () => {
      const count = base.$__ghstar.app.getStarCount(hasStarCount.data);
      const test = base.$__ghstar.app.buildGhStarCountExtraInfoLine(count, singleItemWithCount.data.url);
      expect(test).toEqual('GHSTAR: 0001028 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count');
    });
  });

  it('getGithubRestApiUrl() should output string', async () => {
    const string = await base.$__ghstar.app.getGithubRestApiUrl(
      singleItemNoCount.data.url,
    );
    expect(string).toEqual(
      'https://api.github.com/repos/vitaminac/zotero-github-star-count',
    );
  });

  it('updateItem() should change extra field when legacy data present', () => {
    const item = singleItemWithCountLegacyFormat.data;
    const extra = jest.spyOn(item, 'setField');
    const tx = jest.spyOn(item, 'saveTx');
    base.$__ghstar.app.updateItem(item, 400, item.url);
    expect(extra).toHaveBeenCalled();
    expect(tx).toHaveBeenCalled();
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0000400 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count \nbla bla bla',
    );
  });

  it('updateItem() should change extra field when data present', () => {
    const item = singleItemWithCount.data;
    const extra = jest.spyOn(item, 'setField');
    const tx = jest.spyOn(item, 'saveTx');
    base.$__ghstar.app.updateItem(item, 1000, singleItemWithCount.data.url);
    expect(extra).toHaveBeenCalled();
    expect(tx).toHaveBeenCalled();
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0001000 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count \nbla bla bla',
    );
  });

  it('updateItem() should change extra field when no data present', () => {
    const item = { ...singleItemNoCount.data };
    const extra = jest.spyOn(item, 'setField');
    const tx = jest.spyOn(item, 'saveTx');
    base.$__ghstar.app.updateItem(item, 10, singleItemNoCount.data.url);
    expect(extra).toHaveBeenCalled();
    expect(tx).toHaveBeenCalled();
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0000010 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count \n',
    );
  });

  it('getExistingGithubRepoUrl() should return Github URL for software item', () => {
    const item = singleItemSoftware.data;
    const test = base.$__ghstar.app.getExistingGithubRepoUrl(item);
    expect(test).toBe("https://github.com/vitaminac/zotero-github-star-count");
  });

  it('getExistingGithubRepoUrl() should return empty string for non software item', () => {
    const item = singleItemNonSoftware.data;
    const test = base.$__ghstar.app.getExistingGithubRepoUrl(item);
    expect(test).toBe("");
  });

  it('processGithubStarResponse() 200 should set item data', () => {
    const item = { ...singleItemSoftware.data };
    const targetUrl = base.$__ghstar.app.getGithubRestApiUrl(item.url);
    base.$__ghstar.app.processGithubStarResponse(
      200,
      hasStarCount.data,
      item.url,
      targetUrl,
      item,
      (item, citeCount) => {
        base.$__ghstar.app.updateItem(item, citeCount, item.url);
      },
    );
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0001028 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count \n',
    );
  });

  it('addToWindow sets up world', async () => {
    const info = jest.spyOn(base.$__ghstar.debugger, 'info');

    // there's no menu in JSDOM, so we make one temp wise
    const ele = global.document.createElement('div');
    ele.id = 'zotero-itemmenu';
    global.document.body.appendChild(ele);

    await base.$__ghstar.app.addToWindow(global.window);

    // expect(base.$__ghstar.app.__citedByPrefix).toBe('ghstar-citedByPrefix');
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('removeFromWindow runs failsafe in case unregister fails', async () => {
    const info = jest.spyOn(base.$__ghstar.debugger, 'info');

    // there's no menu in JSDOM, so we make one temp wise
    const ele = global.document.createElement('div');
    ele.id = 'ghstar-get-count';
    global.document.body.appendChild(ele);

    await base.$__ghstar.app.removeFromWindow(global.window);

    expect(info).toHaveBeenCalledTimes(1);
  });

  it('processItems burns correctly', async () => {
    const info = jest.spyOn(base.$__ghstar.debugger, 'info');
    jest.spyOn($__ghstar.app, 'retrieveGithubStarCountData');
    jest.spyOn($__ghstar.app, 'processGithubStarResponse');
    await base.$__ghstar.app.processItems(itemsList);
  });

  it('getApiEndpoint handles bad data URL', async () => {
    const alert = jest.spyOn(global.window, 'alert');
    base.$__ghstar.app.__preferenceDefaults.defaultGithubApiEndpoint = 'gibbgerish';
    await base.$__ghstar.app.getApiEndpoint();

    expect(alert).toHaveBeenCalledTimes(1);
  });

  it('verify field key lookup in getGhStarCountExtraInfoLineColumnData', () => {
    const item = singleItemWithCount.data;
    const citeCount = base.$__ghstar.app.getGhStarCountExtraInfoLineColumnData(item, 'ghStarCount');
    expect(citeCount).toBe(1000);

    const ghStarLastUpdated = base.$__ghstar.app.getGhStarCountExtraInfoLineColumnData(item, 'ghStarLastUpdated');
    expect(ghStarLastUpdated).toBe('1/1/2025, 12:00:00 AM');

    const githubRepoUrl = base.$__ghstar.app.getGhStarCountExtraInfoLineColumnData(
      item,
      'githubRepoUrl',
    );
    expect(githubRepoUrl).toBe("https://github.com/vitaminac/zotero-github-star-count");
  });

  it('extra Field Extractor tests', () => {
    for (const test of extraFieldTester) {
      const verify = base.$__ghstar.app.extraFieldExtractor(test.string);
      expect(verify).toEqual(test.expectedResult);
    }
  });
});
