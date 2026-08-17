import { describe, expect, it } from "vitest";
import { assertAllowedLink, assertHttpsImage, isLive, loadConfig } from "../src/config.js";

const baseEnv = {
  PINTEREST_APP_ID: "123",
  PINTEREST_APP_SECRET: "secret",
  MCP_BRIDGE_TOKEN: "123456789012345678901234",
};

describe("bridge config", () => {
  it("parks in dry-run by default", () => {
    const config = loadConfig(baseEnv);
    expect(config.PINTEREST_WRITE_MODE).toBe("dry-run");
    expect(isLive(config)).toBe(false);
  });

  it("allows exact Etsy hosts and blocks arbitrary destinations", () => {
    const config = loadConfig(baseEnv);
    expect(assertAllowedLink("https://www.etsy.com/listing/123", config).hostname).toBe("www.etsy.com");
    expect(() => assertAllowedLink("https://example.com/product", config)).toThrow(/not allowlisted/);
  });

  it("requires HTTPS image URLs", () => {
    expect(assertHttpsImage("https://images.example.com/pin.png").protocol).toBe("https:");
    expect(() => assertHttpsImage("http://images.example.com/pin.png")).toThrow(/HTTPS/);
  });
});
