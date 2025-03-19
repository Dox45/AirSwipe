import { query, action, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { TICKET_STATUS } from "./constants";


export const getUserTicketForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const ticket = await ctx.db
      .query("tickets")
      .filter((q) =>
        q.and(
          q.eq(q.field("eventId"), eventId),
          q.or(q.eq(q.field("buyerUserId"), userId), q.eq(q.field("recipientUserId"), userId))
        )
      )
      .first();

    return ticket;
  },
});


// export const getTicketWithDetails = query({
//   args: { 
//     eventId: v.id("events"),
//     userId: v.string(),
//   },
//   handler: async (ctx, { eventId, userId }) => {
//     // Find ticket for this user and event
//     const ticket = await ctx.db
//       .query("tickets")
//       .withIndex("by_user_event", q => q.eq("buyerUserId", userId).eq("eventId", eventId))
//       .first();

//     if (!ticket) return null;

//     const event = await ctx.db.get(ticket.eventId);

//     return {
//       ...ticket,
//       event,
//     };
//   },
// });

export const getTicketWithDetails = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;

    const event = await ctx.db.get(ticket.eventId);

    return {
      ...ticket,
      event,
    };
  },
});

export const getValidTicketsForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used"))
      )
      .collect();
  },
});

export const createTicket = mutation({
  args: {
    eventId: v.id("events"),
    buyerUserId: v.string(),
    recipientUserId: v.string(),
    status: v.union(
      v.literal(TICKET_STATUS.VALID),
      v.literal(TICKET_STATUS.USED),
      v.literal(TICKET_STATUS.REFUNDED),
      v.literal(TICKET_STATUS.CANCELLED)
    ),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Create ticket record
    const ticketId = await ctx.db.insert("tickets", {
      eventId: args.eventId,
      buyerUserId: args.buyerUserId,
      recipientUserId: args.recipientUserId,
      status: args.status,
      amount: args.amount,
      purchasedAt: Date.now(),
    });
    return ticketId;
  },
});

export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal(TICKET_STATUS.VALID),
      v.literal(TICKET_STATUS.USED),
      v.literal(TICKET_STATUS.REFUNDED),
      v.literal(TICKET_STATUS.CANCELLED)
    ),
  },
  handler: async (ctx, { ticketId, status }) => {
    await ctx.db.patch(ticketId, { status });
  },
});



export const getTicketPrice = query({
  args: { eventId: v.id("events") }, // Ensure correct ID type
  handler: async ({ db }, { eventId }) => {
    const event = await db.get(eventId);
    return event?.price ?? 0; // Use "price" instead of "ticketPrice"
  },
});

export const getTicketById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;

    const event = await ctx.db.get(ticket.eventId);
    if (!event) return null;

    return {
      ...ticket,
      event
    };
  },
});

