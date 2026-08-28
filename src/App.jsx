import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Admins from "./admin/pages/Admins";

import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";
import Users from "./admin/pages/Users";
import Categories from "./admin/pages/Categories";
import Profile from "./admin/pages/Profile";
import Products from "./admin/pages/Products";
import Settings from "./admin/pages/Settings";
import Orders from "./admin/pages/Orders";


function App() {
    return (
        <Routes>

            {/* Public */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Panel */}
            <Route element={<ProtectedRoute />}>

                <Route element={<AdminLayout />}>

                    <Route
                        path="/admin/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/admin/admins"
                        element={<Admins />}
                    />

                    <Route
                        path="/admin/users"
                        element={<Users />}
                    />

                    <Route path="/admin/categories" element={<Categories />} />

                    <Route path="/admin/profile" element={<Profile />} />

                    <Route path="/admin/products" element={<Products />} />

                    <Route path="/admin/settings" element={<Settings />} />

                    <Route path="/admin/orders" element={<Orders />} />

                </Route>

            </Route>

            {/* Unknown URL */}
            <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
            />

        </Routes>
    );
}

export default App;