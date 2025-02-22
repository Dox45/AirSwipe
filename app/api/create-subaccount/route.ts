// import { NextRequest, NextResponse } from "next/server";
// import { getConvexClient } from "@/lib/convex";
// import { api } from "@/convex/_generated/api";
// import { auth } from "@clerk/nextjs/server"; 

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { business_name, settlement_bank, account_number, percentage_charge } = await req.json();

//     const response = await fetch("https://api.paystack.co/subaccount", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         business_name,
//         settlement_bank,
//         account_number,
//         percentage_charge,
//         primary_contact_email: user.emailAddresses[0]?.emailAddress,
//         primary_contact_name: user.fullName,
//       }),
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       return NextResponse.json({ error: data.message }, { status: response.status });
//     }

//     // Store subaccount in Convex
//     const convex = getConvexClient();
//     await convex.mutation(api.account.saveSubaccount, {
//       userId: user.id,
//       subaccountId: data.data.id,
//       subaccountCode: data.data.subaccount_code,
//       businessName: business_name,
//       settlementBank: settlement_bank,
//       accountNumber: account_number,
//       percentageCharge: percentage_charge,
//     });

//     return NextResponse.json({ success: true, subaccount: data.data });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user details using Clerk API
    if (!user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const userName = user.fullName || "";

    // Parse request body
    const { business_name, bank_code, account_number } = await req.json();
    console.log("Request Body:", { business_name, bank_code, account_number });

    // Make API request to Paystack
    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name,
        settlement_bank: bank_code,
        account_number,
        percentage_charge: 0.1, // Ensure this is the intended value
        primary_contact_email: userEmail,
        primary_contact_name: userName,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: response.status });
    }

    // Store subaccount in Convex
    const convex = getConvexClient();
    await convex.mutation(api.account.saveSubaccount, {
      userId,
      subaccountId: data.data.id,
      subaccountCode: data.data.subaccount_code,
      businessName: business_name,
      settlementBank: data.data.settlement_bank,
      accountNumber: account_number,
      percentageCharge: 0.1, // Ensure consistency with the Paystack request
    });

    return NextResponse.json({ success: true, subaccount: data.data });

  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
