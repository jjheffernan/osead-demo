import { describe, expect, it } from "vitest";
import { demoStaff } from "../config/staff";
import {
  agentMarkets,
  assignedInquiries,
  assignmentsForAgent,
} from "../config/agent-assignments";

describe("agent-assignments", () => {
  it("maps every demoStaff id to a market", () => {
    for (const staff of demoStaff) {
      expect(agentMarkets[staff.id]).toBeTruthy();
    }
  });

  it("scopes mara-ellison when that id is passed explicitly", () => {
    const mara = assignmentsForAgent("mara-ellison");

    expect(mara.market).toBeTruthy();
    expect(mara.inquiries.length).toBeGreaterThan(0);
    expect(mara.inquiries.every((inquiry) => inquiry.staffId === "mara-ellison")).toBe(
      true,
    );
  });

  it("scopes each agent's inbox to only their own assigned fixtures", () => {
    const { inquiries } = assignmentsForAgent("jonah-reed");
    expect(inquiries.length).toBeGreaterThan(0);
    for (const inquiry of inquiries) {
      expect(inquiry.staffId).toBe("jonah-reed");
    }
    expect(assignedInquiries.length).toBeGreaterThanOrEqual(inquiries.length);
  });
});
