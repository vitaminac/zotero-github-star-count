const base = require('../src/ghstar.js');
const hasStarCount = require('./__data__/ghResponseHasStarCount.js');
const singleItemWithCount = require('./__data__/zoteroItemsListSingleItemWithCount.js');
const singleItemWithCountLegacyFormat = require('./__data__/zoteroItemsListSingleItemWithCountLegacyFormat.js');
const singleItemNoCount = require('./__data__/zoteroItemsListSingleItemWithNoCount.js');
const singleItemNoTitle = require('./__data__/zoteroItemsListSingleItemWithNoTitle.js');
const singleItemHtmlTitle = require('./__data__/zoteroItemsListSingleItemWithHtmlTitle.js');
const singleItemNoCreators = require('./__data__/zoteroItemsListSingleItemWithNoCreators.js');
const itemsList = require('./__data__/zoteroItemsList.js');
const extraFieldTester = require('./__data__/extraFieldExtractorData.js');

window.alert = jest.fn();
jest.useRealTimers();

describe('Verify $__ghstar.app sanity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2024, 12, 1));
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

  it('buildcitecountstring() string + count', () => {
    const count = base.$__ghstar.app.getStarCount(hasStarCount.data);
    const test = base.$__ghstar.app.buildCiteCountString(count);
    expect(test).toEqual('GHSTAR: 0001028 2024-12-31T23:00:00.000Z 0');
  });

  it('generateItemUrl() should output string', async () => {
    const string = await base.$__ghstar.app.generateItemUrl(
      singleItemNoCount.data,
    );
    expect(string).toEqual(
      'https://api.github.com/repos/vitaminac/zotero-github-star-count',
    );
  });

  it('generateItemUrl() should handle HTML in title', async () => {
    const string = await base.$__ghstar.app.generateItemUrl(
      singleItemHtmlTitle.data,
    );
    expect(string).toEqual(
      'https://api.github.com/repos/vitaminac/zotero-github-star-count',
    );
  });

  it('updateItem() should change extra field when legacy data present', () => {
    const item = singleItemWithCountLegacyFormat.data;
    const extra = jest.spyOn(item, 'setField');
    const tx = jest.spyOn(item, 'saveTx');
    base.$__ghstar.app.updateItem(item, 400);
    expect(extra).toHaveBeenCalled();
    expect(tx).toHaveBeenCalled();
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0000400 2024-12-31T23:00:00.000Z 0.22 \nPublisher: SAGE Publications Inc',
    );
  });

  it('updateItem() should change extra field when data present', () => {
    const item = singleItemWithCount.data;
    const extra = jest.spyOn(item, 'setField');
    const tx = jest.spyOn(item, 'saveTx');
    base.$__ghstar.app.updateItem(item, 1000);
    expect(extra).toHaveBeenCalled();
    expect(tx).toHaveBeenCalled();
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0001000 2024-12-31T23:00:00.000Z 0.54 \nPublisher: SAGE Publications Inc',
    );
  });

  it('updateItem() should change extra field when no data present', () => {
    const item = { ...singleItemNoCount.data };
    const extra = jest.spyOn(item, 'setField');
    const tx = jest.spyOn(item, 'saveTx');
    base.$__ghstar.app.updateItem(item, 10);
    expect(extra).toHaveBeenCalled();
    expect(tx).toHaveBeenCalled();
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0000010 2024-12-31T23:00:00.000Z 0.01 \n',
    );
  });

  it('hasRequiredFields() should return true with sane data', () => {
    const item = { ...singleItemNoCount.data };
    const test = base.$__ghstar.app.hasRequiredFields(item);
    expect(test).toBe(true);
  });

  it('hasRequiredFields() should return false with no title', () => {
    const item = singleItemNoTitle.data;
    const test = base.$__ghstar.app.hasRequiredFields(item);
    expect(test).toBe(false);
  });

  it('hasRequiredFields() should return false with no creators', () => {
    const item = singleItemNoCreators.data;
    const test = base.$__ghstar.app.hasRequiredFields(item);
    expect(test).toBe(false);
  });

  it('processGithubStarResponse() 200 should set item data', () => {
    const item = { ...singleItemNoCount.data };
    const targetUrl = base.$__ghstar.app.generateItemUrl(singleItemNoCount.data);
    base.$__ghstar.app.processGithubStarResponse(
      200,
      hasStarCount.data,
      null,
      targetUrl,
      item,
      (item, citeCount) => {
        base.$__ghstar.app.updateItem(item, citeCount);
      },
    );
    expect(item.getField('extra')).toEqual(
      'GHSTAR: 0001028 2024-12-31T23:00:00.000Z 0.56 \n',
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

    expect(info).toHaveBeenCalledTimes(8);
  });

  it('getApiEndpoint handles bad data URL', async () => {
    const alert = jest.spyOn(global.window, 'alert');
    base.$__ghstar.app.__preferenceDefaults.defaultGithubApiEndpoint = 'gibbgerish';
    await base.$__ghstar.app.getApiEndpoint();

    expect(alert).toHaveBeenCalledTimes(1);
  });

  it('verify field key lookup in setColumnData', () => {
    const item = singleItemWithCount.data;
    const citeCount = base.$__ghstar.app.setColumnData(item, 'citationCount');
    expect(citeCount).toBe(1000);

    const lastUpdated = base.$__ghstar.app.setColumnData(item, 'lastUpdated');
    expect(lastUpdated).toBe('1/1/2025, 12:00:00 AM');

    const relevanceScore = base.$__ghstar.app.setColumnData(
      item,
      'relevanceScore',
    );
    expect(relevanceScore).toBe(0.54);
  });

  it('extra Field Extractor tests', () => {
    for (const test of extraFieldTester) {
      const verify = base.$__ghstar.app.extraFieldExtractor(test.string);
      expect(verify).toEqual(test.expectedResult);
    }
  });
});
