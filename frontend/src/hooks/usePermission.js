// usePermission.js
import { AuthContext } from "../contexts/AuthContext";

export function usePermission() {
    const { user } = AuthContext();

    const hasPermission = (permission) => {
        if (!user?.permissions) return false;

        // block any-permissions if not super admin
        if (permission.endsWith("_any") && user.role !== "SuperAdmin") {
            return false;
        }

        return user.permissions.includes(permission);
    };

    return { hasPermission };
}
