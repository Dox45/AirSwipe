// "use client";

// import { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import SetupSubaccount from "@/components/SetupSubaccount";

// export default function AccountPage() {
//   const { user } = useUser();
//   const [showSetup, setShowSetup] = useState(false);
  
//   // Fetch account details from Convex
//   const account = useQuery(api.account.getSubaccount, user ? { userId: user.id } : "skip");

//   if (!user) return <div>Loading user...</div>;
//   if (account === undefined) return <div>Loading account...</div>;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
//       {account ? (
//        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-200">
//   <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Account Details</h2>
  
//   <div className="space-y-3 text-gray-700">
//     <p className="text-lg"><strong className="text-gray-900">Business Name:</strong> {account.businessName}</p>
//     <p className="text-lg"><strong className="text-gray-900">Bank:</strong> {account.settlementBank}</p>
//     <p className="text-lg"><strong className="text-gray-900">Account Number:</strong> {account.accountNumber}</p>
//     <p className="text-lg"><strong className="text-gray-900">Percentage Charge:</strong> {account.percentageCharge}%</p>
//   </div>

//   <button
//     onClick={() => setShowSetup(true)}
//     className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-xl transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//   >
//     Edit Account
//   </button>
// </div>

//       ) : (
//         !showSetup ? (
//           <button
//             onClick={() => setShowSetup(true)}
//             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//           >
//             Setup Account
//           </button>
//         ) : (
//           <SetupSubaccount />
//         )
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SetupSubaccount from "@/components/SetupSubaccount";

export default function AccountPage() {
  const { user } = useUser();
  const [showSetup, setShowSetup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    settlementBank: "",
    accountNumber: "",
  });

  const updateSubaccount = useMutation(api.account.updateSubaccount); // Convex mutation

  // Fetch account details from Convex
  const account = useQuery(api.account.getSubaccount, user ? { userId: user.id } : "skip");

  useEffect(() => {
    if (account) {
      setFormData({
        businessName: account.businessName,
        settlementBank: account.settlementBank,
        accountNumber: account.accountNumber,
      });
    }
  }, [account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!account) return;

    try {
      const response = await fetch(`https://api.paystack.co/subaccount/${account.subaccountCode}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_name: formData.businessName,
          settlement_bank: formData.settlementBank,
          account_number: formData.accountNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Update Convex database after successful Paystack update
      await updateSubaccount({
        userId: user!.id,
        businessName: formData.businessName,
        settlementBank: formData.settlementBank,
        accountNumber: formData.accountNumber,
      });

      setIsEditing(false); // Hide edit form
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update account details.");
    }
  };

  if (!user) return <div>Loading user...</div>;
  if (account === undefined) return <div>Loading account...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {account ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Account Details</h2>

          {!isEditing ? (
            <div className="space-y-3 text-gray-700">
              <p className="text-lg"><strong className="text-gray-900">Business Name:</strong> {account.businessName}</p>
              <p className="text-lg"><strong className="text-gray-900">Bank:</strong> {account.settlementBank}</p>
              <p className="text-lg"><strong className="text-gray-900">Account Number:</strong> {account.accountNumber}</p>
              <p className="text-lg"><strong className="text-gray-900">Percentage Charge:</strong> {account.percentageCharge}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Business Name"
              />
              <input
                type="text"
                name="settlementBank"
                value={formData.settlementBank}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Bank Code"
              />
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Account Number"
              />
              <button
                onClick={handleUpdate}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          )}

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-xl transition-all duration-300 hover:bg-blue-700"
            >
              Edit Account
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      ) : !showSetup ? (
        <button
          onClick={() => setShowSetup(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Setup Account
        </button>
      ) : (
        <SetupSubaccount />
      )}
    </div>
  );
}
