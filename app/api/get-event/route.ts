import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Commenting out Convex logic
    // const convex = getConvexClient();
    // const event = await convex.query(api.events.getEvent, { eventId: eventId as Id<"events"> });

    return NextResponse.json({ message: `Received event ID: ${eventId}` });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
