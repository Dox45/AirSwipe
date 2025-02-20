import { getConvexClient } from "@/lib/convex";
export async function POST(req) {
  try {
    const { eventId, userId, waitingListId } = await req.json();

    const response = await fetch(`https://api.paystack.co/transaction/verify/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status === "success") {
      // Update database with purchase details
      const convex = getConvexClient();
      await convex.mutation(api.events.purchaseTicket, {
        eventId,
        userId,
        waitingListId,
        paymentInfo: {
          paymentIntentId: data.data.id,
          amount: data.data.amount / 100, // Convert kobo to Naira
        },
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Payment failed" }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
