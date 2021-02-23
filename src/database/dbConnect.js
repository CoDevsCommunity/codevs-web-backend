const { connect } = require('mongoose');

module.exports = async () => {
  try {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    });
    console.log('DB is connected');
  } catch (error) {
    console.error(error);
  }
};
