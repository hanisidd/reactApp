import { createContext, useContext, useEffect, useState } from "react";
import { loginAdmin, getAdmin } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("admin_token");

        if (!token) {
            setLoading(false);
            return;
        }

        const restoreAdmin = async () => {
            try {

                const data = await getAdmin();

                setAdmin(data.admin);

            } catch (error) {

                localStorage.removeItem("admin_token");
                setAdmin(null);

            } finally {

                setLoading(false);

            }
        };

        restoreAdmin();

    }, []);


    const login = async (credentials) => {

        const data = await loginAdmin(credentials);

        localStorage.setItem("admin_token", data.token);

        setAdmin(data.admin);

        return data;
    };


    const logout = () => {

        localStorage.removeItem("admin_token");

        setAdmin(null);

    };


    return (
        <AuthContext.Provider
            value={{
                admin,
                setAdmin,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}