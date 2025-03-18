"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import ReleaseTicket from "./ReleaseTicket";
import { Ticket } from "lucide-react";
import { toast } from 'react-toastify';
import useDebounce from "@/hooks/useDebounce";

interface PurchaseTicketProps {
  eventId: Id<"events">;
  buyForSomeoneElse?: boolean;
  recipientEmail?: string;
}

export default function PurchaseTicket({ 
  eventId,
  buyForSomeoneElse = false,
  recipientEmail = ""
}: PurchaseTicketProps) {
  const router = useRouter();
  const { user } = useUser();
  const [debouncedEmail] = useDebounce(recipientEmail, 500);

  // Only fetch queue position if user is available
  const queuePosition = useQuery(
    api.waitingList.getQueuePosition,
    user?.id && eventId 
      ? { 
          eventId, 
          userId: user.id, 
          ...(buyForSomeoneElse && debouncedEmail ? { recipientUserId: debouncedEmail } : {}) 
        } 
      : "skip"
  );


  const event = useQuery(
    api.events.getById, 
    eventId ? { eventId } : "skip"
  );

  const ticketPrice = useQuery(
    api.tickets.getTicketPrice, 
    eventId ? { eventId } : "skip"
  ) ?? 0;
  console.log("Event ID:", eventId);
  console.log("User ID:", user?.id);
  console.log("Queue Position:", queuePosition);
  console.log("Queue Position Status:", queuePosition?.status);
  console.log("Queue Position Offer Expires At:", queuePosition?.offerExpiresAt);
  console.log("Recipient Email from Queue:", queuePosition?.recipientEmail);
  console.log("User's Primary Email:", user?.emailAddresses[0]?.emailAddress);

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    if (!offerExpiresAt) return;

    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expired");
        return;
      }

      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining(
        minutes > 0
          ? `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${seconds === 1 ? "" : "s"}`
          : `${seconds} second${seconds === 1 ? "" : "s"}`
      );
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

const userEmail = queuePosition?.recipientEmail || user.emailAddresses[0]?.emailAddress;

  const handlePurchase = async () => {
    if (!user || isExpired || !queuePosition) return;

    try {
      setIsLoading(true);

      // Ensure a valid email is available
      if (!userEmail) {
        throw new Error("No valid email address found for ticket purchase");
      }

      console.log(`Purchasing for: ${userEmail}`);

      if (ticketPrice <= 0) {
        // Create a ticket record for free tickets
        const createTicket = await fetch('/api/create-free-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId,
            buyerUserId: user.id,
            recipientEmail: userEmail,
            waitingListId: queuePosition._id
          })
        });

        if (!createTicket.ok) {
          throw new Error('Failed to create ticket record');
        }

        const { ticketId } = await createTicket.json();
        router.push(`/download-ticket?eventId=${eventId}&userId=${user.id}&ticketId=${ticketId}`);
        return;
      }

      const subaccountCode = event?.subaccountCode ? `&subaccountCode=${event.subaccountCode}` : "";

      router.push(`/payment?email=${userEmail}&amount=${ticketPrice}&eventId=${eventId}&userId=${user.id}&waitingListId=${queuePosition._id}${subaccountCode}`);
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !queuePosition || queuePosition.status !== "offered") {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Ticket Reserved
                </h3>
                <p className="text-sm text-gray-500">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 leading-relaxed">
              A ticket has been reserved for {userEmail}. Complete your purchase before
              the timer expires to secure your spot at this event.
            </div>
          </div>
        </div>

        {ticketPrice <= 0 ? (
          <button
            onClick={handlePurchase}
            disabled={isExpired || isLoading}
            className="w-full bg-green-500 text-white px-8 py-4 rounded-lg font-bold shadow-md hover:bg-green-600 transform hover:scale-[1.02] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
          >
            {isLoading ? "Processing..." : "Download Ticket"}
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={isExpired || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
          >
            {isLoading ? "Processing..." : "Proceed to Payment →"}
          </button>
        )}

        <div className="mt-4">
          <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
        </div>
      </div>
    </div>
  );
}
