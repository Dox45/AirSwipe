import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { WAITING_LIST_STATUS, TICKET_STATUS } from "@/convex/constants";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { eventId, buyerUserId, recipientEmail, waitingListId } = await request.json();

    // Create ticket record
    const ticketId = await client.mutation(api.tickets.createTicket, {
      eventId,
      buyerUserId,
      recipientUserId: recipientEmail,
      status: TICKET_STATUS.VALID,
      amount: 0,
    });

    // Update waiting list status
    await client.mutation(api.waitingList.updateStatus, {
      waitingListId,
      status: WAITING_LIST_STATUS.PURCHASED,
    });

    // Process queue for next person
    await client.mutation(api.waitingList.processQueue, {
      eventId,
    });

    return NextResponse.json({ ticketId });
  } catch (error) {
    console.error("Error creating free ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
