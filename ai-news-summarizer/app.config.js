const { config } = require('dotenv');
config(); // loads .env into process.env

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NEWS_API_KEY: process.env.NEWS_API_KEY,
    },
  };
};
