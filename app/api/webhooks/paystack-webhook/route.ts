import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  const signature = request.headers.get('x-paystack-signature');
  const rawBody = await request.text();

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');

  if (signature !== hash) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const event = JSON.parse(rawBody);

  // Log the complete webhook payload for inspection
  console.log('Complete Paystack webhook payload:', JSON.stringify(event, null, 2));
  console.log('Paystack metadata:', JSON.stringify(event?.data?.metadata, null, 2));
  console.log('Paystack customer info:', JSON.stringify(event?.data?.customer, null, 2));

  if (event && event.event === 'charge.success') {
    // Handle successful payment
    await handleSuccessfulPayment(event);
  }

  return NextResponse.json({ message: 'Callback received' }, { status: 200 });
}

async function handleSuccessfulPayment(event) {
  try {
    const { data } = event;
    const metadata = data.metadata || {};

    // Log the exact structure of the payment data
    console.log('Payment data structure:', {
      reference: data.reference,
      amount: data.amount,
      currency: data.currency,
      channel: data.channel,
      metadata: metadata,
      customer: data.customer,
      authorization: data.authorization
    });

    const eventId = metadata.eventId;
    const buyerUserId = metadata.buyerUserId; // Changed from userId to buyerUserId
    const waitingListId = metadata.waitingListId;
    const paymentIntentId = data.reference;
    const amount = data.amount;

    if (!eventId || !buyerUserId || !waitingListId) {
      console.error("Missing required metadata:", metadata);
      return;
    }

    console.log("Fetching waiting list entry to get recipient info...");
    const convex = getConvexClient();
    
    // First, get the waiting list entry to determine the recipient
    const waitingListEntry = await convex.query(api.waitingList.getEntry, {
      waitingListId
    });

    if (!waitingListEntry) {
      console.error("Waiting list entry not found:", waitingListId);
      return;
    }

    // Determine the actual recipient (either from recipientUserId or the original user)
    const recipientUserId = waitingListEntry.recipientUserId || waitingListEntry.userId;

    console.log("Processing purchase with recipient info:", {
      eventId,
      buyerUserId,
      recipientUserId,
      waitingListId
    });

    console.log("Processing purchase with recipient info:", {
      eventId,
      buyerUserId,
      recipientUserId,
      waitingListId,
      paymentInfo: { paymentIntentId, amount }
    });

    // Run Convex mutation to update purchase record with buyer and recipient info
    const result = await convex.mutation(api.events.purchaseTicket, {
      eventId,
      buyerUserId,
      recipientUserId,
      waitingListId,
      paymentInfo: { paymentIntentId, amount },
    });

    console.log("Purchase ticket mutation result:", result);
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
  }
}

