const data = [
    {
    string: 'GHSTAR:00001001',
    expectedResult: {
      citationCount: 1001,
      lastUpdated: '',
      relevanceScore: 0,
    },
  },
  {
    string: 'GHSTAR: 00001000',
    expectedResult: {
      citationCount: 1000,
      lastUpdated: '',
      relevanceScore: 0,
    },
  },

  {
    string: 'badstartdata GHSTAR: 00001001',
    expectedResult: {
      citationCount: 0,
      lastUpdated: '',
      relevanceScore: 0,
    },
  },
  {
    string: 'GHSTAR: 0000010 2024-12-31T23:00:00.000Z \n',
    expectedResult: {
      citationCount: 10,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
  {
    string:
      'GHSTAR: 0000400 2024-12-31T23:00:00.000Z \nPublisher: SAGE Publications Inc',
    expectedResult: {
      citationCount: 400,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
  {
    string:
      'some custom data on top\nGHSTAR: 0000401 2024-12-31T23:00:00.000Z \nPublisher: SAGE Publications Inc',
    expectedResult: {
      citationCount: 401,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
  {
    string:
      'some custom data on top\nGHSTAR: 0000401 2024-12-31T23:00:00.000Z 2.2\nPublisher: SAGE Publications Inc',
    expectedResult: {
      citationCount: 401,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 2.2,
    },
  },
  {
    string:
      'GHSTAR: 0010401 2024-12-31T23:00:00.000Z 2.4\nPublisher: SAGE Publications Inc',
    expectedResult: {
      citationCount: 10401,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 2.4,
    },
  },
  {
    string:
      'GHSTAR: 0010433 2024-12-31T23:00:00.000Z 2.5 \n',
    expectedResult: {
      citationCount: 10433,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 2.5,
    },
  },
  {
    string:
      'GHSTAR: 0000433 2024-12-31T23:00:00.000Z 1.5',
    expectedResult: {
      citationCount: 433,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 1.5,
    },
  },
  {
    string:
      'GHSTAR:0000433 2024-12-31T23:00:00.000Z 1.5 ',
    expectedResult: {
      citationCount: 433,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 1.5,
    },
  },
  {
    string:
      'GHSTAR:0000433 2024-12-31T23:00:00.000Z ',
    expectedResult: {
      citationCount: 433,
      lastUpdated: '1/1/2025, 12:00:00 AM',
      relevanceScore: 0,
    },
  },
];

module.exports = data;
