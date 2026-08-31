import { Routes, Route } from "react-router-dom";
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Admins from "./admin/pages/Admins";
import Users from "./admin/pages/Users";
import Categories from "./admin/pages/Categories";
import Profile from "./admin/pages/Profile";
import Products from "./admin/pages/Products";
import Settings from "./admin/pages/Settings";
import Orders from "./admin/pages/Orders";
import ContactMessages from "./admin/pages/ContactMessages";
import AdminLayout from "./admin/layouts/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";

import { CartProvider } from "./store/context/CartContext";
import { UserAuthProvider } from "./store/context/UserAuthContext";
import Storefront from "./store/pages/Storefront";
import ProductsCatalog from "./store/pages/ProductsCatalog";
import ProductDetail from "./store/pages/ProductDetail";
import AboutUs from "./store/pages/AboutUs";
import ContactUs from "./store/pages/ContactUs";
import CheckoutPage from "./store/pages/CheckoutPage";
import LoginPage from "./store/pages/LoginPage";
import RegisterPage from "./store/pages/RegisterPage";
import ProfilePage from "./store/pages/ProfilePage";
import StoreGlobalModals from "./store/components/StoreGlobalModals";
import UserDashboard from "./store/pages/UserDashboard";
import PaymentReturn from "./store/pages/PaymentReturn";
// ...
function App() {
    return (
        <UserAuthProvider>
            <CartProvider>
                <StoreGlobalModals />
                <Routes>
                    {/* Public Storefront Routes */}
                    <Route path="/" element={<Storefront />} />
                    <Route path="/products" element={<ProductsCatalog />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/payment/return" element={<PaymentReturn />} />
                    {/* Customer Account Standalone Pages */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    {/* Admin Panel Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="contact-messages" element={<ContactMessages />} />
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