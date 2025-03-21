import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get all codes for an event
export const getCodes = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('codes')
      .filter(q => q.eq(q.field('eventId'), args.eventId))
      .collect();
  },
});

// Update check-in status
export const updateCheckInStatus = mutation({
  args: {
    codeId: v.id('codes'),
    checkedIn: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.codeId, { checkedIn: args.checkedIn });
  },
});