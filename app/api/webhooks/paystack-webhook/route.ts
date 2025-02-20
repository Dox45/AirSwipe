import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request) {
  const signature = request.headers.get('x-paystack-signature');
  const rawBody = await request.text();

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');

  if (signature !== hash) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const event = JSON.parse(rawBody);


  if (event && event.event === 'charge.success') {
    const email = event.data.customer.email;
    // Handle successful payment
    await handleSuccessfulPayment(event);
  }

  return NextResponse.json({ message: 'Callback received' }, { status: 200 });
}

async function handleSuccessfulPayment(event) {
  try {
    const { data } = event;
    const metadata = data.metadata || {};

    const eventId = metadata.eventId;
    const userId = metadata.userId;
    const waitingListId = metadata.waitingListId; 
    const paymentIntentId = data.reference;
    const amount = data.amount;
    const email = data.customer.email;

    if (!eventId || !userId || !waitingListId) {
      console.error("Missing required metadata:", metadata);
      return;
    }

    console.log("Running Convex mutation to save ticket purchase...");
    const convex = getConvexClient();
    console.log("gotten convex client")
    
    // Run Convex mutation to update purchase record
    const result = await convex.mutation(api.events.purchaseTicket, {
      eventId,
      userId,
      waitingListId, 
      paymentInfo: { paymentIntentId, amount },
    });

    console.log("Purchase ticket mutation result:", result);
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
  }
}

