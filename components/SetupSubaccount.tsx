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
              className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Bank:</label>
            <select
              name="bank_code"
              value={form.bank_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 text-black py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
