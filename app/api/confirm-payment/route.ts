// import { getConvexClient } from "@/lib/convex";
// import { NextRequest, NextResponse } from "next/server";
// // import { api } from "@/convex/_generated/api";
// export async function POST(req: NextRequest) {
//   try {
//     const { eventId, userId, waitingListId } = await req.json();

//     const response = await fetch(`https://api.paystack.co/transaction/verify/${eventId}`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();

//     if (data.status === "success") {
//       // Update database with purchase details
//       const convex = getConvexClient();
//       await convex.mutation(api.events.purchaseTicket, {
//         eventId,
//         userId,
//         waitingListId,
//         paymentInfo: {
//           paymentIntentId: data.data.id,
//           amount: data.data.amount / 100, // Convert kobo to Naira
//         },
//       });

//       return NextResponse.json({ success: true, message: "Payment verified and ticket purchased." });
//     }

//     return NextResponse.json({ success: false, message: "Payment verification failed." }, { status: 400 });
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    const response = await fetch(`https://api.paystack.co/transaction/verify/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({
        success: true,
        message: "Transaction confirmed! You can now access your ticket.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Transaction verification failed. Please try again." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying the transaction. Please contact support." },
      { status: 500 }
    );
  }
}
