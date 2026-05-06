import { describe, it, expect } from "vitest";
import { parseLrc } from "../lrcParser";

const sample = `
[ti:Test Song]
[ar:Test Artist]
[00:10.50]This line has no blank
[00:20.00]She was a {hero} to me
[00:30.12]Plain text line
`;

describe("parseLrc", () => {
  it("ignores metadata tags", () => {
    const lines = parseLrc(sample);
    expect(lines.every((l) => l.time > 0)).toBe(true);
  });

  it("parses timestamps correctly", () => {
    const lines = parseLrc(sample);
    expect(lines[0].time).toBeCloseTo(10.5);
    expect(lines[1].time).toBeCloseTo(20.0);
  });

  it("extracts blank word", () => {
    const lines = parseLrc(sample);
    expect(lines[1].blank).toBe("hero");
  });

  it("replaces blank with underscores in text", () => {
    const lines = parseLrc(sample);
    expect(lines[1].text).toContain("_____");
    expect(lines[1].text).not.toContain("{");
  });

  it("returns null blank for lines without placeholder", () => {
    const lines = parseLrc(sample);
    expect(lines[0].blank).toBeNull();
    expect(lines[2].blank).toBeNull();
  });
});
