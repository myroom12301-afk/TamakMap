import { useState, useEffect } from "react";
import { fetchBusinessBookings } from "../api/bookings";

export function useBusinessBookings(businessId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    fetchBusinessBookings(businessId)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [businessId]);

  return { bookings, setBookings, loading };
}
