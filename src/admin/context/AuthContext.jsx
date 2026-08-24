import { createContext, useContext, useState } from "react";
import { loginAdmin, logoutAdmin } from "../services/auth";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [admin, setAdmin] = useState(null);

    const login = async (credentials) => {
        try {
            const data = await loginAdmin(credentials);

            localStorage.setItem("admin_token", data.token);

            setAdmin(data.admin);

            toast.success("Login successful");

            return data;

        } catch (error) {
            toast.error(
                error?.data?.message || "Unable to login"
            );

            throw error;
        }
    };
    const logout = async () => {

        try {

            await logoutAdmin();

            localStorage.removeItem("admin_token");

            setAdmin(null);

            toast.success("Logged out successfully");

        } catch (error) {

            toast.error(
                error?.data?.message || "Logout failed"
            );

            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                admin,
                setAdmin,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}