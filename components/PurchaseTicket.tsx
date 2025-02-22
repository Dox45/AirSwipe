"use client"
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ReleaseTicket from "./ReleaseTicket";
import { Ticket } from "lucide-react";
import { toast } from 'react-toastify';

export default function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
  const router = useRouter();
  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });
  const event = useQuery(api.events.getById, {
    eventId: eventId,
  });

  const ticketPrice = useQuery(api.tickets.getTicketPrice, { eventId }) ?? 0;

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
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



const handlePurchase = async () => {
  if (!user || isExpired) return;

  try {
    setIsLoading(true);
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      throw new Error("No email address found for user");
    }

    console.log(`User Email: ${userEmail}`);

    if (ticketPrice <= 0) {
      // Free ticket logic - Redirect to download
      router.push(`/download-ticket?eventId=${eventId}&userId=${user.id}`);
      return;
    }
    const subaccountCode = event?.subaccountCode ? `&subaccountCode=${event.subaccountCode}` : "";

    // Redirect to the payment page with the necessary data
    router.push(`/payment?email=${userEmail}&amount=${ticketPrice}&eventId=${eventId}&userId=${user.id}&waitingListId=${queuePosition._id}${subaccountCode}`);
  } catch (error) {
    console.error("Error purchasing ticket:", error);
    toast?.error(error instanceof Error ? error.message : "Failed to process payment");
  } finally {
    setIsLoading(false); // Hide loading state
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
              A ticket has been reserved for you. Complete your purchase before
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
