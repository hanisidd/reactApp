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
                    <Link to="/admin/dashboard" className="text-xl font-bold text-gray-900">
                        AdminPanel
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
                            Dashboard
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => {
                                    setProductsOpen(!productsOpen);
                                    setProfileOpen(false);
                                }}
                                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition text-sm font-medium"
                            >
                                Products
                            </button>
                            {productsOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                    <Link to="/admin/products" onClick={() => setProductsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        All Products
                                    </Link>
                                    <Link to="/admin/categories" onClick={() => setProductsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Categories
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link to="/admin/orders" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
                            Orders
                        </Link>
                        <Link to="/admin/contact-messages" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
                            Contact Messages
                        </Link>
                        <Link to="/admin/users" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
                            Users
                        </Link>
                        <Link to="/admin/admins" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
                            Admins
                        </Link>
                        <Link to="/admin/settings" className="text-gray-700 hover:text-blue-600 transition text-sm font-medium">
                            Web Settings
                        </Link>

                        <div className="relative">
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2">
                                {admin?.avatar_url ? (
                                    <img src={admin.avatar_url} alt={admin.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold uppercase">
                                        {admin?.name?.charAt(0)}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-700">{admin?.name}</span>
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                    <Link to="/admin/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Profile
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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