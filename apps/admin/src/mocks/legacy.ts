import { sampleAt } from "./now";
import type { PreviewState } from "./types";
export const roles = ["Admin", "Risk", "Support", "Finance"] as const;
export const countryOptions = [
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" }, { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" }, { code: "SG", name: "Singapore" },
];
export const initialState: PreviewState = {
  users: [
    { id: "staff-001", name: "Alex Morgan", email: "alex@example.com", roles: ["Admin"], status: "Active", twoFactor: "Enrolled", lastLogin: sampleAt(204120) },
    { id: "staff-002", name: "Jordan Lee", email: "jordan@example.com", roles: ["Admin", "Risk"], status: "Active", twoFactor: "Enrolled", lastLogin: sampleAt(205800) },
    { id: "staff-003", name: "Samira Khan", email: "samira@example.com", roles: ["Risk"], status: "Active", twoFactor: "Enrolled", lastLogin: sampleAt(206880) },
    { id: "staff-004", name: "Daniel Brooks", email: "daniel@example.com", roles: ["Support"], status: "Active", twoFactor: "Enrolled", lastLogin: sampleAt(263520) },
    { id: "staff-005", name: "Priya Shah", email: "priya@example.com", roles: ["Finance"], status: "Invited", twoFactor: "Setup required", lastLogin: null },
    { id: "staff-006", name: "Evan Reed", email: "evan@example.com", roles: ["Support"], status: "Disabled", twoFactor: "Enrolled", lastLogin: sampleAt(717840) },
  ],
  events: [
    { id: "event-005", at: sampleAt(204120), actor: "Alex Morgan", action: "admin.login", entity: "staff-001", ip: "192.0.2.10", before: null, after: { outcome: "Sample sign-in" } },
    { id: "event-004", at: sampleAt(205020), actor: "Alex Morgan", action: "admin.created", entity: "staff-005", ip: "192.0.2.10", before: null, after: { email: "priya@example.com", roles: ["Finance"], status: "Invited" } },
    { id: "event-003", at: sampleAt(206520), actor: "Jordan Lee", action: "admin.updated", entity: "staff-003", ip: "192.0.2.11", before: { roles: ["Support"] }, after: { roles: ["Risk"] } },
    { id: "event-002", at: sampleAt(262620), actor: "Alex Morgan", action: "settings.updated", entity: "platform", ip: "192.0.2.10", before: { platformName: "Demo" }, after: { platformName: "Funded HUB" } },
    { id: "event-001", at: sampleAt(268320), actor: "Alex Morgan", action: "admin.disabled", entity: "staff-006", ip: "192.0.2.10", before: { status: "Active" }, after: { status: "Disabled" } },
  ],
  settings: { platformName: "Funded HUB", supportEmail: "support@example.com", restrictedCountries: [] },
};

export const currentPreviewUser = "staff-001";

export const descriptions = ["Platform ownership and access administration.","Risk oversight, rule publishing and investigation.","Trader assistance, KYC and content operations.","Payments, payout reviews and financial reporting."];
