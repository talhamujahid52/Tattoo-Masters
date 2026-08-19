import { BLOCK_REASON_OPTIONS } from "../safety";

describe("BLOCK_REASON_OPTIONS", () => {
  it("uses the account-blocking copy and reason codes", () => {
    expect(BLOCK_REASON_OPTIONS).toEqual([
      { label: "Harassment", value: "harassment" },
      { label: "Inappropriate account", value: "inappropriate_account" },
      { label: "Impersonation", value: "impersonation" },
      { label: "Fake account", value: "fake_account" },
      { label: "Other", value: "other" },
    ]);
  });
});
