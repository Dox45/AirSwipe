// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const eventId = searchParams.get("eventId");

//   if (!eventId) return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });

//   const event = await api.events.getEvent({ eventId });
//   return NextResponse.json(event);
// }

// import { NextResponse } from "next/server";
// import { getConvexClient } from "@/lib/convex"; // Import Convex client
// import { api } from "@/convex/_generated/api";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const eventId = searchParams.get("eventId");

//     if (!eventId) {
//       return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
//     }

//     const convex = getConvexClient(); // Initialize Convex client
//     const event = await convex.query(api.events.getEvent, { eventId });

//     return NextResponse.json(event);
//   } catch (error) {
//     console.error("Error fetching event:", error);
//     return NextResponse.json({ error: "Failed to retrieve event details" }, { status: 500 });
//   }
// }

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
