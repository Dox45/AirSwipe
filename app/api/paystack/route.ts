// pages/api/paystack.js
export const POST = async (req) => {
  try {
    const body = await req.json(); // Extract JSON body
    const { email, amount, eventId, userId, waitingListId  } = body;

    if (!email || !amount || !eventId || !userId || !waitingListId) {
      return new Response(JSON.stringify({ error: "Invalid payment details" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
      { 
      email, 
      amount: Number(amount) * 100,
      metadata: {
        eventId,
        userId,
        waitingListId
      }
    }
      ), // Convert amount to kobo
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
