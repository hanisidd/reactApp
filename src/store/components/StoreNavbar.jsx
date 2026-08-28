import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    ShoppingBagIcon, 
    UserIcon, 
    ChevronDownIcon, 
    Bars3Icon, 
    XMarkIcon 
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";

function StoreNavbar({ publicSettings, onOpenCart, onOpenAuth, onOpenProfile, categories, selectedCategory, onSelectCategory }) {
    const { totalCount } = useCart();
    const { user, logout } = useUserAuth();
    
    const [settings, setSettings] = useState(publicSettings || null);
    const [catDropdown, setCatDropdown] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch settings directly so Navbar stays synced independently
    useEffect(() => {
        if (publicSettings) {
            setSettings(publicSettings);
        } else {
            fetch("http://localhost:8000/api/admin/store/public-settings")
                .then((res) => res.json())
                .then((data) => setSettings(data))
                .catch((err) => console.error("Navbar settings fetch error:", err));
        }
    }, [publicSettings]);

    const brandName = settings?.brand_name || "Sleek Sites";
    const logoUrl = settings?.logo_url;

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand Logo & Name */}
                <Link to="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-gray-900">
                    {logoUrl ? (
                        <img src={logoUrl} alt={brandName} className="w-9 h-9 object-contain rounded-md" />
                    ) : (
                        <span className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            SS
                        </span>
                    )}
                    <span>{brandName}</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`transition hover:text-blue-600 ${selectedCategory === null ? "text-blue-600 font-bold" : ""}`}
                    >
                        Home
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setCatDropdown(!catDropdown)}
                            className="flex items-center gap-1 transition hover:text-blue-600"
                        >
                            Categories <ChevronDownIcon className="w-3.5 h-3.5" />
                        </button>
                        {catDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                <button
                                    onClick={() => { onSelectCategory(null); setCatDropdown(false); }}
                                    className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 text-gray-700"
                                >
                                    All Categories
                                </button>
                                {categories?.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { onSelectCategory(cat.id); setCatDropdown(false); }}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition ${
                                            selectedCategory === cat.id ? "text-blue-600 font-bold bg-blue-50/50" : "text-gray-600"
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <a href="#about" className="transition hover:text-blue-600">About Us</a>
                    <a href="#contact" className="transition hover:text-blue-600">Contact</a>
                </nav>

                {/* Right Heroicons Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenCart}
                        className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-700 flex items-center justify-center"
                        title="Shopping Cart"
                    >
                        <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
                        {totalCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                                {totalCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:block">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdown(!userDropdown)}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800">{user.name}</span>
                                </button>

                                {userDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-bold text-gray-900">{user.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { onOpenProfile(); setUserDropdown(false); }}
                                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                                        >
                                            <UserIcon className="w-4 h-4 text-gray-500" /> Edit Profile
                                        </button>
                                        <button
                                            onClick={() => { logout(); setUserDropdown(false); }}
                                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-full shadow-sm transition"
                            >
                                Sign In / Register
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                        {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3 shadow-lg">
                    <button
                        onClick={() => { onSelectCategory(null); setMobileMenuOpen(false); }}
                        className="block w-full text-left text-sm font-medium text-gray-700 py-1"
                    >
                        Home / All Products
                    </button>

                    <div className="border-t border-gray-100 pt-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Categories</p>
                        {categories?.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { onSelectCategory(cat.id); setMobileMenuOpen(false); }}
                                className={`block w-full text-left text-xs py-1.5 transition ${
                                    selectedCategory === cat.id ? "text-blue-600 font-bold" : "text-gray-600"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
                                    className="w-full py-2 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <UserIcon className="w-4 h-4" /> Edit Profile ({user.name})
                                </button>
                                <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="w-full py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                                className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                            >
                                Sign In / Register
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default StoreNavbar;