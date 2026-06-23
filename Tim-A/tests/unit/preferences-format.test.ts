import { describe, expect, it } from "vitest";

import {
  formatPreferenceDate,
  getDashboardPreferenceStyle,
  getLanguageCode,
} from "@/features/preferences/format";

describe("preference formatting", () => {
  it("maps selected language to an html language code", () => {
    expect(getLanguageCode("English")).toBe("en");
    expect(getLanguageCode("Indonesian")).toBe("id");
    expect(getLanguageCode("Greek")).toBe("el");
  });

  it("turns font size preference into dashboard css", () => {
    expect(getDashboardPreferenceStyle(12)).toContain("font-size: 16px");
    expect(getDashboardPreferenceStyle(18)).toContain("font-size: 24px");
  });

  it("formats dates with selected date format and time zone", () => {
    expect(
      formatPreferenceDate("2026-06-23", {
        date_format: "DD/MM/YYYY",
        time_zone: "Asia/Jakarta",
      }),
    ).toBe("23/06/2026");

    expect(
      formatPreferenceDate("2026-06-23", {
        date_format: "MM/DD/YYYY",
        time_zone: "UTC",
      }),
    ).toBe("06/23/2026");
  });
});
