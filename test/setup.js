const mongoose = require('mongoose');

beforeEach(function(done) {
  mongoose.connect(`mongodb://localhost/${process.env.TEST_SUITE}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

afterEach(function(done) {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});

afterAll(done => {
  return done();
});
