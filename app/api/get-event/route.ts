import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });

  const event = await api.events.getEvent({ eventId });
  return NextResponse.json(event);
}
