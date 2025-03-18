
export const POST = async (req: Request) => {
  try {
    const body = await req.json(); // Extract JSON body
    const { email, amount, eventId, userId: buyerUserId, waitingListId, subaccountCode } = body;
    
    console.log("Initializing payment with metadata:", {
      email,
      amount,
      eventId,
      buyerUserId,
      waitingListId,
    });

    if (!email || !amount || !eventId || !buyerUserId || !waitingListId || !subaccountCode) {
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
      body: JSON.stringify({
        email,
        amount: Number(amount) * 100,
        subaccount: subaccountCode,
        bearer: "subaccount" ,
        metadata: {
          eventId,
          buyerUserId,
          waitingListId,
          purchaseEmail: email,
        },
      }),
    });

    const data = await response.json();
    console.log("Paystack Response:", data);

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
