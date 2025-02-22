// // "use client";

// // import { useState } from "react";
// // import { useUser } from "@clerk/nextjs";

// // export default function SetupSubaccount() {
// //   const { user } = useUser();
// //   const [formData, setFormData] = useState({
// //     businessName: "",
// //     bankCode: "",
// //     accountNumber: "",
// //     percentageCharge: "",
// //     primaryContactPhone: "",
// //     description: "",
// //   });

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     const requestData = {
// //       business_name: formData.businessName,
// //       settlement_bank: formData.bankCode,
// //       account_number: formData.accountNumber,
// //       percentage_charge: parseFloat(formData.percentageCharge),
// //       primary_contact_email: user?.emailAddresses[0]?.emailAddress,
// //       primary_contact_name: user?.fullName,
// //       primary_contact_phone: formData.primaryContactPhone,
// //       description: formData.description,
// //     };

// //     try {
// //       const response = await fetch("/api/create-subaccount", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(requestData),
// //       });

// //       const result = await response.json();
// //       if (response.ok) {
// //         alert("Subaccount created successfully!");
// //       } else {
// //         alert(`Error: ${result.error}`);
// //       }
// //     } catch (error) {
// //       console.error("Error creating subaccount:", error);
// //       alert("Failed to create subaccount.");
// //     }
// //   };

// //   return (
// //     <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
// //       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
// //         <h2 className="text-xl font-bold mb-4">Setup AirSwipe Account Connection</h2>

// //         <label className="block mb-2">
// //           Business Name
// //           <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full p-2 border rounded" required />
// //         </label>

// //         <label className="block mb-2">
// //           Bank Code
// //           <input type="text" name="bankCode" value={formData.bankCode} onChange={handleChange} className="w-full p-2 border rounded" required />
// //         </label>

// //         <label className="block mb-2">
// //           Account Number
// //           <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full p-2 border rounded" required />
// //         </label>

// //         <label className="block mb-2">
// //           Percentage Charge
// //           <input type="number" name="percentageCharge" value={formData.percentageCharge} onChange={handleChange} className="w-full p-2 border rounded" required />
// //         </label>

// //         <label className="block mb-2">
// //           Primary Contact Phone
// //           <input type="text" name="primaryContactPhone" value={formData.primaryContactPhone} onChange={handleChange} className="w-full p-2 border rounded" required />
// //         </label>

// //         <label className="block mb-2">
// //           Description
// //           <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />
// //         </label>

// //         <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
// //           Create Subaccount
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }


// "use client";

// import { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs";

// export default function SetupSubaccount() {
//   const { user } = useUser();
//   const [banks, setBanks] = useState([]);
//   const [form, setForm] = useState({
//     business_name: "",
//     bank_code: "",
//     account_number: "",
//     percentage_charge: "0.1",
//   });

//   useEffect(() => {
//     // Fetch banks from Paystack
//     fetch("/api/get-banks")
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.data) {
//           setBanks(data.data);
//         }
//       });
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const response = await fetch("/api/create-subaccount", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         ...form,
//         primary_contact_email: user?.emailAddresses[0]?.emailAddress,
//         primary_contact_name: user?.fullName,
//       }),
//     });

//     const data = await response.json();
//     if (data.status) {
//       alert("Settlement account created successfully!");
//     } else {
//       alert("Error creating settlement account");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
//       <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 w-full max-w-lg">
//         <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Setup Settlement Account</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-gray-700 font-medium">Business Name:</label>
//             <input
//               type="text"
//               name="business_name"
//               value={form.business_name}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 font-medium">Bank:</label>
//             <select
//               name="bank_code"
//               value={form.bank_code}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select a bank</option>
//               {banks.map((bank) => (
//                 <option key={bank.id} value={bank.code}>
//                   {bank.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-gray-700 font-medium">Account Number:</label>
//             <input
//               type="text"
//               name="account_number"
//               value={form.account_number}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 font-medium">Percentage Charge:</label>
//             <input
//               type="number"
//               name="percentage_charge"
//               value={form.percentage_charge}
//               onChange={handleChange}
//               readOnly
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
//           >
//             Create Account
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function SetupSubaccount() {
  const { user } = useUser();
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({
    business_name: "",
    bank_code: "",
    account_number: "",
    percentage_charge: "0.1",
  });

  useEffect(() => {
    // Fetch banks from Paystack
    fetch("/api/get-banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setBanks(data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching banks:", error);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log form data for debugging
    console.log("Form Data:", form);

    const response = await fetch("/api/create-subaccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        primary_contact_email: user?.emailAddresses[0]?.emailAddress,
        primary_contact_name: user?.fullName,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Settlement account created successfully!");
    } else {
      console.error("Error creating settlement account:", data);
      alert(`Error creating settlement account: ${data.error}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Setup Settlement Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Business Name:</label>
            <input
              type="text"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Bank:</label>
            <select
              name="bank_code"
              value={form.bank_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Account Number:</label>
            <input
              type="text"
              name="account_number"
              value={form.account_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Percentage Charge:</label>
            <input
              type="number"
              name="percentage_charge"
              value={form.percentage_charge}
              onChange={handleChange}
              readOnly
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
