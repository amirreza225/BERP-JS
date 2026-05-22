import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateEnv } from "./env.js";

describe("validateEnv", () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("passes with all required vars set", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test";
    process.env.BETTER_AUTH_SECRET = "secret";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    expect(() => validateEnv()).not.toThrow();
  });

  it("exits when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    process.env.BETTER_AUTH_SECRET = "secret";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    const exit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    expect(() => validateEnv()).toThrow("exit");
    expect(exit).toHaveBeenCalledWith(1);
  });

  it("exits when BETTER_AUTH_SECRET is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test";
    delete process.env.BETTER_AUTH_SECRET;
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    const exit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    expect(() => validateEnv()).toThrow("exit");
    expect(exit).toHaveBeenCalledWith(1);
  });
});
