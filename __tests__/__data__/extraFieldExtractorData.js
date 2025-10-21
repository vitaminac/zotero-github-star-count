const data = [
    {
    string: 'GHSTAR:00001001',
    expectedResult: {
      ghStarCount: 1001,
      ghStarLastUpdated: '',
      relevanceScore: 0,
    },
  },
  {
    string: 'GHSTAR: 00001000',
    expectedResult: {
      ghStarCount: 1000,
      ghStarLastUpdated: '',
      relevanceScore: 0,
    },
  },

  {
    string: 'badstartdata GHSTAR: 00001001',
    expectedResult: {
      ghStarCount: 0,
      ghStarLastUpdated: '',
      relevanceScore: 0,
    },
  },
  {
    string: 'GHSTAR: 0000010 2025-01-01T00:00:00.000Z \n',
    expectedResult: {
      ghStarCount: 10,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
  {
    string:
      'GHSTAR: 0000400 2025-01-01T00:00:00.000Z \nbla bla bla',
    expectedResult: {
      ghStarCount: 400,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
  {
    string:
      'some custom data on top\nGHSTAR: 0000401 2025-01-01T00:00:00.000Z \nbla bla bla',
    expectedResult: {
      ghStarCount: 401,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
  {
    string:
      'some custom data on top\nGHSTAR: 0000401 2025-01-01T00:00:00.000Z 2.2\nbla bla bla',
    expectedResult: {
      ghStarCount: 401,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 2.2,
    },
  },
  {
    string:
      'GHSTAR: 0010401 2025-01-01T00:00:00.000Z 2.4\nbla bla bla',
    expectedResult: {
      ghStarCount: 10401,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 2.4,
    },
  },
  {
    string:
      'GHSTAR: 0010433 2025-01-01T00:00:00.000Z 2.5 \n',
    expectedResult: {
      ghStarCount: 10433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 2.5,
    },
  },
  {
    string:
      'GHSTAR: 0000433 2025-01-01T00:00:00.000Z 1.5',
    expectedResult: {
      ghStarCount: 433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 1.5,
    },
  },
  {
    string:
      'GHSTAR:0000433 2025-01-01T00:00:00.000Z 1.5 ',
    expectedResult: {
      ghStarCount: 433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 1.5,
    },
  },
  {
    string:
      'GHSTAR:0000433 2025-01-01T00:00:00.000Z ',
    expectedResult: {
      ghStarCount: 433,
      ghStarLastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
];

module.exports = data;
