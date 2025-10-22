const data = [
    {
    string: 'GHSTAR:00001001',
    expectedResult: {
      ghStarCount: 1001,
      ghStarLastUpdated: '',
      ghUrl: "",
    },
  },
  {
    string: 'GHSTAR: 00001000',
    expectedResult: {
      ghStarCount: 1000,
      ghStarLastUpdated: '',
      ghUrl: "",
    },
  },

  {
    string: 'badstartdata GHSTAR: 00001001',
    expectedResult: {
      ghStarCount: 0,
      ghStarLastUpdated: '',
      ghUrl: "",
    },
  },
  {
    string: 'GHSTAR: 0000010 2025-01-01T00:00:00.000Z \n',
    expectedResult: {
      ghStarCount: 10,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "",
    },
  },
  {
    string:
      'GHSTAR: 0000400 2025-01-01T00:00:00.000Z \nbla bla bla',
    expectedResult: {
      ghStarCount: 400,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "",
    },
  },
  {
    string:
      'some custom data on top\nGHSTAR: 0000401 2025-01-01T00:00:00.000Z \nbla bla bla',
    expectedResult: {
      ghStarCount: 401,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "",
    },
  },
  {
    string:
      'some custom data on top\nGHSTAR: 0000401 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count\nbla bla bla',
    expectedResult: {
      ghStarCount: 401,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "https://github.com/vitaminac/zotero-github-star-count",
    },
  },
  {
    string:
      'GHSTAR: 0010401 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count\nbla bla bla',
    expectedResult: {
      ghStarCount: 10401,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "https://github.com/vitaminac/zotero-github-star-count",
    },
  },
  {
    string:
      'GHSTAR: 0010433 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count \n',
    expectedResult: {
      ghStarCount: 10433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "https://github.com/vitaminac/zotero-github-star-count",
    },
  },
  {
    string:
      'GHSTAR: 0000433 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count',
    expectedResult: {
      ghStarCount: 433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "https://github.com/vitaminac/zotero-github-star-count",
    },
  },
  {
    string:
      'GHSTAR:0000433 2025-01-01T00:00:00.000Z https://github.com/vitaminac/zotero-github-star-count ',
    expectedResult: {
      ghStarCount: 433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "https://github.com/vitaminac/zotero-github-star-count",
    },
  },
  {
    string:
      'GHSTAR:0000433 2025-01-01T00:00:00.000Z ',
    expectedResult: {
      ghStarCount: 433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      ghUrl: "",
    },
  },
];

module.exports = data;
