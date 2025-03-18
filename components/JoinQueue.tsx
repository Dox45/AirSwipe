"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import Spinner from "./Spinner";
import { Clock, OctagonXIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { useDebounce } from "use-debounce"; // Add debounce utility

export default function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string;
}) {
  const { toast } = useToast();
  const [buyForSomeoneElse, setBuyForSomeoneElse] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [debouncedEmail] = useDebounce(recipientEmail, 500);

  const joinWaitingList = useMutation(api.events.joinWaitingList);

  const queryParams = userId && eventId 
    ? { 
        eventId, 
        userId, 
        ...(buyForSomeoneElse && debouncedEmail ? { recipientUserId: debouncedEmail } : {}) 
      } 
    : "skip";

  console.log("📌 Calling getQueuePosition with:", queryParams);

  const queuePosition = useQuery(api.waitingList.getQueuePosition, queryParams);
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, { eventId, userId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const event = useQuery(api.events.getById, { eventId });

  const isEventOwner = userId === event?.userId;

  const handleJoinQueue = async () => {
    if (buyForSomeoneElse && !debouncedEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please confirm the recipient's email address.",
      });
      return;
    }

    try {
      // Check if already in queue
      if (queuePosition) {
        toast({
          variant: "destructive",
          title: "Already in Queue",
          description: "You are already in the waiting list for this event.",
        });
        return;
      }

      const result = await joinWaitingList({
        eventId,
        userId,
        recipientEmail: buyForSomeoneElse ? debouncedEmail : undefined,
      });
      if (result.success) {
        console.log("Successfully joined waiting list");
        toast({
          title: "Success!",
          description: "You've been added to the waiting list.",
          duration: 3000,
        });
        // Reset form state
        setRecipientEmail("");
        setBuyForSomeoneElse(false);
      }
    } catch (error) {
      if (error instanceof ConvexError) {
        // Handle rate limit error
        const isRateLimit = error.message.includes("joined the waiting list too many times");
        if (isRateLimit) {
          // Extract wait time from error message
          const waitMinutes = error.message.match(/\d+/)?.[0] || "a few";
          toast({
            variant: "destructive",
            title: "Rate limit reached",
            description: `Please wait ${waitMinutes} minutes before trying again.`,
            duration: 10000,
          });
          // Reset form state
          setRecipientEmail("");
          setBuyForSomeoneElse(false);
          return;
        }
        
        // Handle other Convex errors
        toast({
          variant: "destructive",
          title: "Unable to join queue",
          description: error.data || "Please try again later",
          duration: 5000,
        });
      } else {
        // Handle non-Convex errors
        const err = error as Error;
        console.error("Error joining waiting list:", err.message);
        toast({
          variant: "destructive",
          title: "Unable to join queue",
          description: "Please try again later",
          duration: 5000,
        });
      }
    }
  };

  console.log("🔹 queuePosition:", queuePosition);
  console.log("🔹 availability:", availability ?? "Undefined");
  console.log("🔹 event:", event ?? "Undefined");

  if (queuePosition === undefined || availability === undefined || event === undefined) {
    console.log("⏳ Data is still loading...");
    return <Spinner />;
  }

  if (queuePosition === null) {
    console.log("ℹ️ User is not in the queue yet.");
  }

  if (userTicket) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        queuePosition.status === WAITING_LIST_STATUS.WAITING ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt <= Date.now())) && (
        <>
          {isEventOwner ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
              <OctagonXIcon className="w-5 h-5" />
              <span>You cannot buy a ticket for your own event</span>
            </div>
          ) : isPastEvent ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
              <Clock className="w-5 h-5" />
              <span>Event has ended</span>
            </div>
          ) : availability.purchasedCount >= availability?.totalTickets ? (
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-red-600">
                Sorry, this event is sold out
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="buyForSomeoneElse"
                  checked={buyForSomeoneElse}
                  onChange={() => setBuyForSomeoneElse(!buyForSomeoneElse)}
                  className="mr-2"
                />
                <label className="text-black" htmlFor="buyForSomeoneElse">Buy for someone else</label>
              </div>
              {buyForSomeoneElse && (
                <input
                  type="email"
                  placeholder="Recipient's Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full text-black p-2 mb-4 border rounded-lg"
                />
              )}
              <button
                onClick={handleJoinQueue}
                disabled={isPastEvent || isEventOwner}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Buy Ticket
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}