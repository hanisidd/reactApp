import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
    ShoppingBagIcon, 
    ChevronDownIcon, 
    UserIcon,
    Squares2X2Icon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";

function StoreNavbar({ publicSettings, categories: propCategories, onSelectCategory }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalCount, openCart } = useCart();
    const { user, logout } = useUserAuth();

    const [settings, setSettings] = useState(publicSettings || null);
    const [categories, setCategories] = useState(propCategories || []);
    const [catDropdown, setCatDropdown] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);

    useEffect(() => {
        if (!publicSettings) {
            fetch("http://localhost:8000/api/public-settings")
                .then((r) => r.json())
                .then(setSettings)
                .catch(() => {});
        }
        if (!propCategories || propCategories.length === 0) {
            fetch("http://localhost:8000/api/categories")
                .then((r) => r.json())
                .then((data) => setCategories(data.categories || []))
                .catch(() => {});
        }
    }, [publicSettings, propCategories]);

    const handleCategoryClick = (catId) => {
        if (onSelectCategory) {
            onSelectCategory(catId);
        } else {
            navigate(catId ? `/products?category_id=${catId}` : "/products");
        }
        setCatDropdown(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 text-xl font-black text-gray-900">
                    {settings?.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-md" />
                    ) : (
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                            {settings?.brand_name?.charAt(0) || "D"}
                        </span>
                    )}
                    <span>{settings?.brand_name || "DigitalStore"}</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <Link to="/" className={`hover:text-blue-600 transition ${isActive("/") ? "text-blue-600 font-bold" : ""}`}>
                        Home
                    </Link>
                    <Link to="/products" className={`hover:text-blue-600 transition ${isActive("/products") ? "text-blue-600 font-bold" : ""}`}>
                        All Products
                    </Link>
                    <div className="relative">
                        <button onClick={() => setCatDropdown(!catDropdown)} className="flex items-center gap-1 hover:text-blue-600 font-medium">
                            Categories <ChevronDownIcon className="w-3.5 h-3.5" />
                        </button>
                        {catDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                <button onClick={() => handleCategoryClick(null)} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 border-b border-gray-100 mb-1">
                                    All Categories
                                </button>
                                <div className="max-h-64 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50">
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link to="/about" className={`hover:text-blue-600 transition ${isActive("/about") ? "text-blue-600 font-bold" : ""}`}>
                        About Us
                    </Link>
                    <Link to="/contact" className={`hover:text-blue-600 transition ${isActive("/contact") ? "text-blue-600 font-bold" : ""}`}>
                        Contact Us
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <button onClick={openCart} className="relative p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition flex items-center justify-center">
                        <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
                        {totalCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                {totalCount}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="relative">
                            <button onClick={() => setUserDropdown(!userDropdown)} className="flex items-center gap-2 p-1 border rounded-full hover:bg-gray-50">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </button>
                            {userDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setUserDropdown(false)}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                                    >
                                        <Squares2X2Icon className="w-4 h-4 text-blue-600" /> My Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={() => setUserDropdown(false)}
                                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                                    >
                                        <UserIcon className="w-4 h-4 text-gray-500" /> Edit Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setUserDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium border-t border-gray-100"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-500" /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:text-blue-600 transition">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default StoreNavbar;