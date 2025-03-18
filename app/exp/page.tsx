"use client"
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";


export default function WaitingListEntries() {
  const waitingListEntries = useQuery(api.test.testRecipientEmails);

  if (waitingListEntries === undefined) {
    return <p>Loading...</p>; // Query is still loading
  }

  return (
    <div>
      <h2>Waiting List Entries with Recipient Emails</h2>
      {waitingListEntries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <ul>
          {waitingListEntries.map((entry) => (
            <li key={entry._id}>
              {entry.recipientEmail} (User ID: {entry.userId})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

