// src/hooks/useAdminHotelCheck.js
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

export default function useAdminHotelCheck(token) {
    const [loading, setLoading] = useState(true);
    const [hasHotel, setHasHotel] = useState(false);
    const { updateHotelName } = useContext(AuthContext);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setHasHotel(false);
            if (updateHotelName) updateHotelName(null);
            return;
        }

        const check = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/hotels/check", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setHasHotel(res.data.hasHotel || false);
                if (updateHotelName) {
                    updateHotelName(res.data.hotelName || null);
                }
            } catch (err) {
                console.error("Error checking hotel:", err);
                setHasHotel(false);
                if (updateHotelName) updateHotelName(null);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, [token, updateHotelName]);

    return { loading, hasHotel };
}
