// import { useEffect } from "react";
// import { useRouter } from "next/router";

// export default function RedirectEvent() {
//   const router = useRouter();
//   const { slug } = router.query;

//   useEffect(() => {
//     if (slug) {
//       fetch(`/api/redirect/${slug}`)
//         .then((res) => {
//           if (res.redirected) {
//             router.push(res.url);
//           } else {
//             router.push("/404"); // If event not found, show 404
//           }
//         });
//     }
//   }, [slug]);

//   return <p>Redirecting...</p>;
// }
"use client";
import { use } from "react";

// This is the server component that handles params
export default function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use
  const resolvedParams = use(params);
  
  return <ClientRedirect slug={resolvedParams.slug} />;
}

// This is the client component that handles redirection

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

function ClientRedirect({ slug }: { slug: string }) {
  const router = useRouter();
  const event = useQuery(api.events.getBySlug, { slug });

  useEffect(() => {
    if (event) {
      // Event found, redirect to ID-based URL
      router.replace(`/event/${event._id}`);
    } else if (event === null) {
      // Event not found (query returned null)
      router.replace("/404");
    }
    // When event is undefined, we're still loading
  }, [event, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting...</h2>
        <p className="text-gray-500">Please wait while we take you to the event.</p>
      </div>
    </div>
  );
}
