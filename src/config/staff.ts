/** Demo staff for the About / homepage people section. */
export interface StaffMember {
  /** Stable id for testimonials targetId. */
  id: string;
  name: string;
  role: string;
  bio: string;
}

export const demoStaff: StaffMember[] = [
  {
    id: "mara-ellison",
    name: "Mara Ellison",
    role: "Principal Broker",
    bio: "Twenty years matching families with Atlantic homes — from weeklong gatherings to quiet second-home buys.",
  },
  {
    id: "jonah-reed",
    name: "Jonah Reed",
    role: "Rental Director",
    bio: "Coordinates calendars, owner preferences, and the details that keep a beach week unhurried.",
  },
  {
    id: "priya-santos",
    name: "Priya Santos",
    role: "Sales Advisor",
    bio: "Guides purchases with rental history, HOA nuance, and a clear path from inquiry to private showing.",
  },
  {
    id: "cole-brennan",
    name: "Cole Brennan",
    role: "Guest Experience",
    bio: "The human reply after “check availability” — arrival notes, house quirks, and local recommendations.",
  },
];
