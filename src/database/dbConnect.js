const { connect } = require('mongoose');

module.exports = async () => {
  try {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log('DB is connected');
  } catch (error) {
    console.error(error);
  }
};
