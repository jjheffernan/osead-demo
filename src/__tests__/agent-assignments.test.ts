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

  it("defaults to demoStaff[0] with a non-empty inbox and a market", () => {
    const defaultAssignment = assignmentsForAgent();
    const explicitAssignment = assignmentsForAgent(demoStaff[0].id);

    expect(defaultAssignment).toEqual(explicitAssignment);
    expect(defaultAssignment.market).toBeTruthy();
    expect(defaultAssignment.inquiries.length).toBeGreaterThan(0);
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
