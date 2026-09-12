import { csvCell } from "./download";

describe("CSV export safety", () => {
  it("preserves commas, newlines and quotes in user-entered titles", () => {
    expect(csvCell('Review "v2", then\nship')).toBe(
      '"Review ""v2"", then\nship"',
    );
  });
  it("prevents user content from becoming spreadsheet formulas", () => {
    expect(csvCell("=1+2")).toBe("'=1+2");
    expect(csvCell("+SUM(A1)")).toBe("'+SUM(A1)");
    expect(csvCell("@command")).toBe("'@command");
  });
  it("retains actual numeric values", () => {
    expect(csvCell(-20.5)).toBe("-20.5");
    expect(csvCell("A normal title")).toBe("A normal title");
  });
});
