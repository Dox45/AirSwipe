"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DownloadTicket() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");
  const ticketId = searchParams.get("ticketId");

  // Hooks should be called unconditionally
  const event = useQuery(api.events.getEvent, eventId ? { eventId: eventId as Id<"events"> } : "skip");
  const ticket = useQuery(api.tickets.getTicketWithDetails, 
    ticketId ? { ticketId: ticketId as Id<"tickets"> } : "skip"
  );
  const updateTicketStatus = useMutation(api.tickets.updateTicketStatus);

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (event && ticket) {
      const ticketData = JSON.stringify({
        eventId: event._id,
        eventName: event.name,
        ticketId: ticket._id,
        buyerUserId: ticket.buyerUserId,
        recipientUserId: ticket.recipientUserId,
        timestamp: Date.now()
      });

      QRCode.toDataURL(ticketData, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => {
          console.error("QR Code Error:", err);
          toast.error("Failed to generate QR code");
        });
    }
  }, [event, userId]);

  const handleDownload = async () => {
    if (!ticketRef.current || !event) {
      toast.error("Unable to generate ticket");
      return;
    }

    try {
      setIsDownloading(true);

      // For free tickets, we still want to track downloads
      if (ticket) {
        if (ticket.status === "used") {
          toast.warning("This ticket has already been downloaded");
          return;
        }
      }

      // Create a clone of the ticket element for better rendering
      const ticketElement = ticketRef.current.cloneNode(true) as HTMLElement;
      document.body.appendChild(ticketElement);
      ticketElement.style.position = 'absolute';
      ticketElement.style.left = '-9999px';
      ticketElement.style.top = '-9999px';

      // Generate the image
      const canvas = await html2canvas(ticketElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Clean up the cloned element
      document.body.removeChild(ticketElement);

      // Convert and save
      const image = canvas.toDataURL("image/png");
      saveAs(image, `${event.name}_Ticket.png`);

      // Update ticket status after successful download
      if (ticket) {
        await updateTicketStatus({
          ticketId: ticket._id,
          status: "used"
        });
      }

      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to download ticket. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!eventId || !userId || !ticketId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg font-semibold">Error: Missing required parameters.</p>
      </div>
    );
  }

  if (!event || !ticket)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg font-semibold">Loading ticket details...</p>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-center" />
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center" ref={ticketRef}>
        <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
        <p className="text-gray-600 text-sm mt-1">
          {ticket?.status === "used" 
            ? "This ticket has already been downloaded"
            : "Your event ticket is ready!"}
        </p>

        {qrCodeUrl ? (
          <div className="mt-6 flex justify-center">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-48 h-48 shadow-lg rounded-md" 
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        ) : (
          <div className="mt-6 flex justify-center items-center h-48">
            <p className="text-gray-500">Generating QR code...</p>
          </div>
        )}

        <div className="mt-6">
          {ticket?.status === "used" ? (
            <div className="px-6 py-3 bg-gray-100 rounded-lg text-gray-600">
              Ticket already downloaded
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={!qrCodeUrl || isDownloading}
              className={`w-full px-6 py-3 rounded-lg font-bold shadow-md transform transition-all duration-200 ${
                qrCodeUrl && !isDownloading
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isDownloading ? 'Downloading...' : qrCodeUrl ? 'Download Ticket' : 'Preparing Download...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
