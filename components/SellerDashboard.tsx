"use client";

// import { useUser } from "@clerk/nextjs";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useRouter } from "next/navigation";
import React from "react";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";

export default function SellerDashboard() {
  // const [registering, setRegistering] = useState(false);
  // const { user } = useUser();
  // const router = useRouter();
  // const registerAsSeller = useMutation(api.users.registerAsSeller);

  // const handleRegister = async () => {
  //   setRegistering(true);
  //   try {
  //     await registerAsSeller({ userId: user?.id });
  //   } catch (error) {
  //     console.error("Error registering as seller:", error);
  //   }
  //   setRegistering(false);
  // };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold">Seller Dashboard</h2>
          <p className="text-blue-100 mt-2">Manage your seller profile</p>
        </div>

        {/* Main Content */}
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sell tickets for your events
          </h2>
          <p className="text-gray-600 mb-8">
            List your tickets for sale and manage your listings
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex justify-center gap-4">
              <Link
                href="/seller/new-event"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Link>
              <Link
                href="/seller/events"
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CalendarDays className="w-5 h-5" />
                View My Events
              </Link>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        </div>
      </div>
  );
}
