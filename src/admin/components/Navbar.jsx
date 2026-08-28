import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const [productsOpen, setProductsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/admin/login");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200">

            <div className="max-w-7xl mx-auto px-6">

                <div className="h-16 flex items-center justify-between">

                    {/* Logo */}
                    <Link
                        to="/admin/dashboard"
                        className="text-xl font-bold text-gray-900"
                    >
                        AdminPanel
                    </Link>


                    {/* Navigation */}
                    <div className="flex items-center gap-6">

                        {/* Dashboard */}
                        <Link
                            to="/admin/dashboard"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Dashboard
                        </Link>


                        {/* Products Dropdown */}
                        <div className="relative">

                            <button
                                onClick={() => setProductsOpen(!productsOpen)}
                                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
                            >
                                Products

                                <span className="text-xs">
                                    {productsOpen ? "▲" : "▼"}
                                </span>
                            </button>


                            {productsOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">

                                    <Link
                                        to="/admin/products"
                                        onClick={() => setProductsOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        All Products
                                    </Link>

                                    <Link
                                        to="/admin/products/add"
                                        onClick={() => setProductsOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Add Product
                                    </Link>

                                    <Link
                                        to="/admin/products/categories"
                                        onClick={() => setProductsOpen(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Categories
                                    </Link>

                                </div>
                            )}

                        </div>


                        {/* Orders */}
                        <Link
                            to="/admin/orders"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Orders
                        </Link>


                        {/* Users */}
                        <Link
                            to="/admin/users"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Users
                        </Link>
                        <Link
                            to="/admin/admins"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Admins
                        </Link>

                        {/* Profile */}
                        <div className="relative">

                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2"
                            >

                                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    {admin?.name?.charAt(0).toUpperCase()}
                                </div>

                                <span className="text-gray-700">
                                    {admin?.name}
                                </span>

                                <span className="text-xs">
                                    ▼
                                </span>

                            </button>


                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">

                                    <Link
                                        to="/admin/profile"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Profile
                                    </Link>

                                    <Link
                                        to="/admin/settings"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        Settings
                                    </Link>

                                    <div className="border-t my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;