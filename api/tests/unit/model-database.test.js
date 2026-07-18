jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../src/config/database');

describe('model database access', () => {
  beforeEach(() => {
    pool.query.mockReset();
    pool.query.mockResolvedValue([[]]);
  });

  it('uses the exported pool for read models', async () => {
    const Author = require('../../src/models/Author');
    const Field = require('../../src/models/Field');
    const Journal = require('../../src/models/Journal');
    const Keyword = require('../../src/models/Keyword');
    const Paper = require('../../src/models/Paper');
    const User = require('../../src/models/User');

    await Author.findAll();
    await Field.search('ai');
    await Journal.findAll();
    await Keyword.findAll();
    await Paper.getTopCited();
    await User.findAll();

    expect(pool.query).toHaveBeenCalledTimes(6);
  });
});
