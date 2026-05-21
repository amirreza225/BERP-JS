import { app } from "../src/server.js";

export default {
  async fetch(request) {
    return app.handle(request);
  },
};
