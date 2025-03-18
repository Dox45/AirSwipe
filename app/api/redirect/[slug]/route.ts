// import { NextApiRequest, NextApiResponse } from "next";
// import { db } from "@/convex/_generated/server"; // Import your Convex DB

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { slug } = req.query;
  
//   // Fetch event where slug matches
//   const event = await db.query("events").filter((q) => q.eq(q.field("slug"), slug)).first();

//   if (!event) {
//     return res.status(404).json({ error: "Event not found" });
//   }

//   // Redirect to the ID-based event route
//   return res.redirect(307, `/event/${event._id}`);
// }

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Initialize the Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    // Use the getBySlug query to find the event
    const event = await convex.query(api.events.getBySlug, { slug });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Redirect to the ID-based event route
    return NextResponse.redirect(new URL(`/event/${event._id}`, req.url), 307);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}
