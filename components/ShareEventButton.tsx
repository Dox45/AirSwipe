// "use client";

// import { useState } from "react";
// import { Id } from "@/convex/_generated/dataModel";
// import { Share2Icon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";

// interface ShareEventButtonProps {
//   eventName: string;
//   eventId: Id<"events">;
//   className?: string;
// }


// export default function ShareEventButton({
//   eventName,
//   eventId,
//   className = "",
// }: ShareEventButtonProps) {
//   const { toast } = useToast();
//   const [isSharing, setIsSharing] = useState(false);

//   const handleShare = async () => {
//     setIsSharing(true);
//     try {
//       const shareUrl = `${window.location.origin}/event/${eventId}`;
//       const shareData = {
//         title: eventName,
//         text: `Check out this event: ${eventName}`,
//         url: shareUrl,
//       };

//       if (navigator.share && navigator.canShare(shareData)) {
//         // Use native share if available
//         await navigator.share(shareData);
//       } else {
//         // Fallback to copying the URL
//         await navigator.clipboard.writeText(shareUrl);
//         toast({
//           title: "Link copied!",
//           description: "Event link has been copied to your clipboard.",
//           duration: 3000,
//         });
//       }
//     } catch (error) {
//       if (error instanceof Error && error.name !== "AbortError") {
//         toast({
//           variant: "destructive",
//           title: "Failed to share",
//           description: "Could not share the event. Please try again.",
//           duration: 3000,
//         });
//       }
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   return (
//     <Button
//       variant="outline"
//       size="sm"
//       className={`gap-2 ${className}`}
//       onClick={(e) => {
//         e.stopPropagation(); // Prevent event card click when sharing
//         handleShare();
//       }}
//       disabled={isSharing}
//     >
//       <Share2Icon className="w-4 h-4" />
//       Share
//     </Button>
//   );
// }


"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Share2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareEventButtonProps {
  eventName: string;
  eventId: Id<"events">;
  eventSlug: string; // Accept slug as a prop
  className?: string;
}

export default function ShareEventButton({
  eventName,
  eventId,
  eventSlug,
  className = "",
}: ShareEventButtonProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Use slug-based link instead of ID-based link
      const shareUrl = `${window.location.origin}/e/${eventSlug}`;
      const shareData = {
        title: eventName,
        text: `Check out this event: ${eventName}`,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData); // Native share
      } else {
        await navigator.clipboard.writeText(shareUrl); // Fallback: Copy to clipboard
        toast({
          title: "Link copied!",
          description: "Event link has been copied to your clipboard.",
          duration: 3000,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          variant: "destructive",
          title: "Failed to share",
          description: "Could not share the event. Please try again.",
          duration: 3000,
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      disabled={isSharing}
    >
      <Share2Icon className="w-4 h-4" />
      Share
    </Button>
  );
}
