import { useState, useEffect } from "react";
import { fetchUserBookings } from "../api/bookings";

export function useUserBookings(userId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchUserBookings(userId)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return { bookings, loading };
}
