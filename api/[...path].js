import { app } from "../src/app.js";

export default {
  async fetch(request) {
    return app.handle(request);
  },
};
