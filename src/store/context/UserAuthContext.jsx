import { createContext, useContext, useState, useEffect } from "react";
import { loginUserApi, registerUserApi, updateUserProfileApi } from "../services/storeApi";

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("store_user");
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (credentials) => {
        const data = await loginUserApi(credentials);
        localStorage.setItem("user_token", data.token);
        localStorage.setItem("store_user", JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const register = async (payload) => {
        const data = await registerUserApi(payload);
        localStorage.setItem("user_token", data.token);
        localStorage.setItem("store_user", JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const updateProfile = async (payload) => {
        const data = await updateUserProfileApi(payload);
        localStorage.setItem("store_user", JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("user_token");
        localStorage.removeItem("store_user");
        setUser(null);
    };

    return (
        <UserAuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export const useUserAuth = () => useContext(UserAuthContext);