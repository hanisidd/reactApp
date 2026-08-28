import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Admins from "./admin/pages/Admins";
import Users from "./admin/pages/Users";
import Categories from "./admin/pages/Categories";
import Profile from "./admin/pages/Profile";
import Products from "./admin/pages/Products";
import Settings from "./admin/pages/Settings";
import Orders from "./admin/pages/Orders";
import AdminLayout from "./admin/layouts/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import { CartProvider } from "./store/context/CartContext";
import { UserAuthProvider } from "./store/context/UserAuthContext";
import Storefront from "./store/pages/Storefront";

function App() {
    return (
        <UserAuthProvider>
            <CartProvider>
                <Routes>
                    {/* Public Storefront Route */}
                    <Route path="/" element={<Storefront />} />
                    {/* Admin Login Route */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="users" element={<Users />} />
                            <Route path="admins" element={<Admins />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                    </Route>
                </Routes>
            </CartProvider>
        </UserAuthProvider>
    );
}

export default App;