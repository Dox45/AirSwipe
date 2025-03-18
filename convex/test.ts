import { query } from "./_generated/server";

export const testRecipientEmails = query({
  args: {},
  handler: async (ctx) => {
    const testEntry = await ctx.db
      .query("waitingList")
      .filter((q) => q.neq(q.field("recipientEmail"), null))
      .collect();

    console.log("Waiting List Entries with recipientEmail:", testEntry);

    return testEntry; // Return results to check in frontend
  },
});
