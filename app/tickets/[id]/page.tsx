"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { redirect, useParams } from "next/navigation";
import Ticket from "@/components/Ticket";
import Link from "next/link";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

export default function TicketPage() {
  const params = useParams();
  const { user } = useUser();
  const ticketRef = useRef<HTMLDivElement>(null);
  const handleDownload = async () => {
  if (!ticketRef.current) return;

  try {
    // Capture the ticket as an image
    const canvas = await html2canvas(ticketRef.current);
    const imgData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    
    // Download PDF
    pdf.save(`ticket-${ticket._id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

  const ticket = useQuery(api.tickets.getTicketWithDetails, {
    ticketId: params.id as Id<"tickets">,
  });

  useEffect(() => {
    console.log("Ticket Data:", ticket);

    if (!user) {
      redirect("/");
    }

    if (ticket && ticket.buyerUserId !== user.id) {
      redirect("/tickets");
    }

    if (ticket && !ticket.eventId) {
      console.log("The issue: Event ID missing");
      redirect("/tickets");
    }
  }, [user, ticket]);

  if (ticket === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!ticket) {
    return <p>Error: Ticket not found.</p>;
  }

  if (!ticket.event) {
    return <p>Error: Event details missing.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 space-y-8">
          <div className="flex items-center justify-between">
            <Link
              href="/tickets"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Tickets
            </Link>
            <div className="flex items-center gap-4">
             {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>*/}
            <button 
                  onClick={handleDownload} 
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                >
                <Download className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>

          <div
            className={`bg-white p-6 rounded-lg shadow-sm border ${
              ticket.event.is_cancelled ? "border-red-200" : "border-gray-100"
            }`}
          >
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.event.name}
            </h1>
            <p className="mt-1 text-gray-600">
              {new Date(ticket.event.eventDate).toLocaleDateString()} at{" "}
              {ticket.event.location}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.event.is_cancelled
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {ticket.event.is_cancelled ? "Cancelled" : "Valid Ticket"}
              </span>
              <span className="text-sm text-gray-500">
                Purchased on {new Date(ticket.purchasedAt).toLocaleDateString()}
              </span>
            </div>
            {ticket.event.is_cancelled && (
              <p className="mt-4 text-sm text-red-600">
                This event has been cancelled. A refund will be processed if it
                hasn&apos;t been already.
              </p>
            )}
          </div>
        </div>
        <div ref={ticketRef}>
            <Ticket ticketId={ticket._id} />
        </div>

        {/*<Ticket ticketId={ticket._id} />*/}
      </div>
    </div>
  );
}

