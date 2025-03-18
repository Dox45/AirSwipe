import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    price: v.number(),
    totalTickets: v.number(),
    userId: v.string(),
    subaccountCode: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
  }).index("by_slug", ["slug"]),
  tickets: defineTable({
    eventId: v.id("events"),
    buyerUserId: v.string(), // Who purchased the ticket
    recipientUserId: v.optional(v.string()), // Who the ticket is for
    purchasedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_buyer", ["buyerUserId"])
    .index("by_recipient", ["recipientUserId"])
    .index("by_user_event", ["buyerUserId", "eventId"]),



  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    recipientUserId: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired")
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId","status"])
    .index("by_user_event", ["userId", "recipientUserId","eventId"])
    .index("by_user", ["userId"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.string(),
    stripeConnectId: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  subaccounts: defineTable({
    userId: v.string(),
    subaccountId: v.number(),
    subaccountCode: v.string(),
    businessName: v.string(),
    settlementBank: v.string(),
    accountNumber: v.string(),
    percentageCharge: v.number(),
  }).index("by_user", ["userId"]),
});
