// "use client";
// import { useSearchParams } from "next/navigation";
// import { useEffect, useState, useRef } from "react";
// import QRCode from "qrcode";
// import { saveAs } from "file-saver";
// import html2canvas from "html2canvas";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";

// export default function DownloadTicket() {
//   const searchParams = useSearchParams();
//   const eventId = searchParams.get("eventId");
//   const userId = searchParams.get("userId");

//   // Ensure eventId and userId are valid
//   if (!eventId || !userId) {
//     return <p className="text-red-500">Error: Event ID or User ID is missing.</p>;
//   }

//   // Fetch event details
//   const event = useQuery(api.events.getEvent, { eventId });

//   // Generate QR code data
//   const [qrCodeUrl, setQrCodeUrl] = useState("");
//   const ticketRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (event && userId) {
//       const ticketData = JSON.stringify({
//         eventName: event.name,
//         userId: userId,
//       });

//       QRCode.toDataURL(ticketData)
//         .then((url) => setQrCodeUrl(url))
//         .catch((err) => console.error("QR Code Error:", err));
//     }
//   }, [event, userId]);

//   // Function to download ticket as an image
//   const handleDownload = async () => {
//     if (!ticketRef.current) return;

//     try {
//       const canvas = await html2canvas(ticketRef.current);
//       const image = canvas.toDataURL("image/png");
//       saveAs(image, `${event?.name}_Ticket.png`);
//     } catch (error) {
//       console.error("Error generating ticket image:", error);
//     }
//   };

//   if (!event) return <p>Loading event details...</p>;

//   return (
//     <div className="flex flex-col items-center">
//       <div ref={ticketRef} className="p-4 border rounded-lg shadow-md bg-white">
//         <h2 className="text-lg font-bold">{event.name}</h2>
//         {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="mt-4 w-32 h-32" />}
//       </div>

//       <button
//         onClick={handleDownload}
//         className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
//       >
//         Download Ticket
//       </button>
//     </div>
//   );
// }

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DownloadTicket() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");

  if (!eventId || !userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg font-semibold">Error: Event ID or User ID is missing.</p>
      </div>
    );
  }

  // Fetch event details
  const event = useQuery(api.events.getEvent, { eventId });

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (event && userId) {
      const ticketData = JSON.stringify({ eventName: event.name, userId });

      QRCode.toDataURL(ticketData)
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [event, userId]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current);
      const image = canvas.toDataURL("image/png");
      saveAs(image, `${event?.name}_Ticket.png`);
    } catch (error) {
      console.error("Error generating ticket image:", error);
    }
  };

  if (!event)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg font-semibold">Loading event details...</p>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center" ref={ticketRef}>
        <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
        <p className="text-gray-600 text-sm mt-1">Your event ticket is ready!</p>

        {qrCodeUrl && (
          <div className="mt-6 flex justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 shadow-lg rounded-md" />
          </div>
        )}

        <button
          onClick={handleDownload}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200"
        >
          Download Ticket
        </button>
      </div>
    </div>
  );
}
