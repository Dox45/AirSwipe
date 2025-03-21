const [selectedTier, setSelectedTier] = useState(null);

const handlePurchase = async () => {
  await purchaseTicket({
    eventId,
    buyerUserId: user.id,
    ticketTierId: selectedTier?._id,
    price: selectedTier ? undefined : fixedPrice,
    status: 'valid',
    paymentIntentId: paymentIntent.id,
  });
};
Step 4: Display Ticket Information
Open the user profile component (e.g., UserProfile.tsx).
Query the tickets table and display ticket information:
typescript
CopyInsert
const tickets = useQuery(api.tickets.getUserTickets, { userId: user.id });

return (
  <div>
    {tickets?.map(ticket => (
      <div key={ticket._id}>
        <p>Event: {ticket.eventId}</p>
        {ticket.ticketTierId ? (
          <p>Ticket Tier: {ticket.ticketTierId}</p>
        ) : (
          <p>Price: {ticket.price}</p>
        )}
      </div>
    ))}
  </div>
);