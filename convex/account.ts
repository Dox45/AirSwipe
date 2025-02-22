import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to save subaccount details
export const saveSubaccount = mutation({
  args: {
    userId: v.string(),
    subaccountId: v.number(),
    subaccountCode: v.string(),
    businessName: v.string(),
    settlementBank: v.string(),
    accountNumber: v.string(),
    percentageCharge: v.number(),
  },
  handler: async ({ db }, { userId, subaccountId, subaccountCode, businessName, settlementBank, accountNumber, percentageCharge }) => {
    await db.insert("subaccounts", {
      userId,
      subaccountId,
      subaccountCode,
      businessName,
      settlementBank,
      accountNumber,
      percentageCharge,
    });
  },
});

// Query to fetch the user's subaccount
export const getSubaccount = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("subaccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
  },
});


// export const updateSubaccount = mutation({
//   args: {
//     userId: v.string(),
//     businessName: v.string(),
//     settlementBank: v.string(),
//     accountNumber: v.string(),
//   },
//   handler: async (ctx, { userId, businessName, settlementBank, accountNumber }) => {
//     // Fetch the subaccount for this user
//     const subaccount = await ctx.db
//       .query("subaccounts")
//       .withIndex("by_userId", (q) => q.eq("userId", userId))
//       .unique();

//     if (!subaccount) {
//       throw new Error("Subaccount not found");
//     }

//     // Update subaccount details
//     await ctx.db.patch(subaccount._id, {
//       businessName,
//       settlementBank,
//       accountNumber,
//     });

//     return { success: true };
//   },
// });


export const updateSubaccount = mutation({
  args: {
    userId: v.string(),
    businessName: v.string(),
    settlementBank: v.string(),
    accountNumber: v.string(), // Change to v.number() if accountNumber should be a number
  },
  handler: async (ctx, { userId, businessName, settlementBank, accountNumber }) => {
    // Fetch the subaccount for this user
    const subaccount = await ctx.db
      .query("subaccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!subaccount) {
      throw new Error("Subaccount not found");
    }

    // Update subaccount details
    await ctx.db.patch(subaccount._id, {
      businessName,
      settlementBank,
      accountNumber,
    });

    return { success: true };
  },
});