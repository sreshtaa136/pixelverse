import "dotenv/config";

export default {
  expo: {
    ...require("./app.json").expo, // Load static settings from app.json
    extra: {
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
      APP_ID: process.env.APP_ID,
      ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
      ALGOLIA_ADMIN_KEY: process.env.ALGOLIA_ADMIN_KEY,
    },
  },
};
