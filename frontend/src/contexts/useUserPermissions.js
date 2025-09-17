import { useContext, useMemo } from "react";
import AuthContext from "../contexts/AuthContext";

// Permissions reference
const permissionsMap = {
    user: {
        create: "user_create",
        login: "user_login",
        viewHotel: "user_view_hotel",
        updateSelf: "user_update_self",
        updateAny: "user_update_any",
        deleteSelf: "user_delete_self",
        deleteAny: "user_delete_any",
        viewAll: "user_view_all",
    },
    hotel: {
        create: "hotel_create",
        viewOwn: "hotel_view_own",
        viewAny: "hotel_view_any",
        updateOwn: "hotel_update_own",
        updateAny: "hotel_update_any",
        deleteOwn: "hotel_delete_own",
        deleteAny: "hotel_delete_any",
        dashboardView: "hotel_dashboard_view",
    },
    room: {
        create: "room_create",
        viewAny: "room_view_any",
        viewSelf: "room_view_self",
        update: "room_update",
        delete: "room_delete",
    },
};

export default function useUserPermissions() {
    const { user } = useContext(AuthContext);

    const userPerms = user?.permissions || [];

    // Generate boolean flags for each permission
    const perms = useMemo(() => {
        const result = {};

        for (const category in permissionsMap) {
            result[category] = {};
            for (const key in permissionsMap[category]) {
                const permName = permissionsMap[category][key];
                result[category][key] = userPerms.includes(permName);
            }
        }

        return result;
    }, [userPerms]);

    return perms;
}