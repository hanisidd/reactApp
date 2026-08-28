import { useEffect, useState } from "react";
import StoreNavbar from "../components/StoreNavbar";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import CheckoutModal from "../components/CheckoutModal";
import { LoginRegisterModal, CustomerProfileModal } from "../components/AuthModals";
import StoreFooter from "../components/StoreFooter";
import { fetchStoreProductsApi, fetchStoreCategoriesApi } from "../services/storeApi";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

function Storefront() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publicSettings, setPublicSettings] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [typeFilter, setTypeFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const [activeDetailProduct, setActiveDetailProduct] = useState(null);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

    useEffect(() => {
        loadPublicSettings();
        loadStoreData();
    }, [selectedCategory]);

    const loadPublicSettings = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/admin/store/public-settings");
            const data = await res.json();
            setPublicSettings(data);
        } catch (err) {
            console.error("Failed to fetch public settings", err);
        }
    };

    const loadStoreData = async () => {
        try {
            setLoading(true);
            const [prodData, catData] = await Promise.all([
                fetchStoreProductsApi(selectedCategory),
                fetchStoreCategoriesApi(),
            ]);
            setProducts(prodData);
            setCategories(catData);
        } catch (err) {
            toast.error(err.message || "Failed to load store catalog");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter((p) => {
        if (typeFilter === "digital") return p.type === "digital";
        if (typeFilter === "physical") return p.type === "physical";
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <StoreNavbar
                publicSettings={publicSettings}
                onOpenCart={() => setIsCartDrawerOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

        {/* Dynamic Full Background Hero Banner */}
<section
    className="relative bg-slate-900 text-white py-20 md:py-28 px-6 bg-cover bg-center bg-no-repeat overflow-hidden transition-all duration-300"
    style={{
        backgroundImage: publicSettings?.hero_image_url
            ? `url("${publicSettings.hero_image_url}")`
            : undefined,
    }}
>
    {/* Dark Overlay for Text Contrast */}
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] z-0" />

    <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-2xl">
            <span className="bg-white/10 text-blue-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20 uppercase tracking-widest inline-block mb-4 backdrop-blur-md">
                {publicSettings?.brand_name || "Official Store"}
            </span>

            {/* Dynamic Main Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white leading-tight drop-shadow-md">
                {publicSettings?.hero_heading || "Discover & Download Premium Products"}
            </h1>

            {/* Dynamic Subtitle Text */}
            <p className="text-sm md:text-lg text-gray-200 max-w-xl mb-8 font-light leading-relaxed drop-shadow">
                {publicSettings?.hero_text || "Explore our curated collection of digital software, e-books, and high-quality physical merchandise."}
            </p>

            <a
                href="#catalog"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
                Explore Products
            </a>
        </div>
    </div>
</section>

            {/* Main Catalog */}
            <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
                {/* Type Filter Tabs */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <button
                        onClick={() => setTypeFilter("all")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            typeFilter === "all"
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        All Items ({products.length})
                    </button>
                    <button
                        onClick={() => setTypeFilter("digital")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            typeFilter === "digital"
                                ? "bg-purple-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        Digital Files ({products.filter((p) => p.type === "digital").length})
                    </button>
                    <button
                        onClick={() => setTypeFilter("physical")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            typeFilter === "physical"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        Physical Goods ({products.filter((p) => p.type === "physical").length})
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading Products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 font-medium">No products match the selected criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((prod) => (
                            <ProductCard
                                key={prod.id}
                                product={prod}
                                onViewDetails={(p) => setActiveDetailProduct(p)}
                                onQuickBuy={() => setIsCheckoutOpen(true)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Drawer */}
            {isCartDrawerOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                                <h2 className="text-lg font-extrabold text-gray-900">Your Shopping Cart</h2>
                                <button onClick={() => setIsCartDrawerOpen(false)} className="text-gray-400 text-2xl font-light">&times;</button>
                            </div>

                            {cart.length === 0 ? (
                                <p className="text-center py-10 text-gray-400 text-sm">Your cart is empty.</p>
                            ) : (
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img src={item.images?.[0]?.image_url} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 truncate">{item.title}</p>
                                                <p className="text-xs text-blue-600 font-bold">PKR {parseFloat(item.price).toLocaleString()}</p>
                                                
                                                {item.type === "digital" ? (
                                                    <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded">Digital (1x)</span>
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)} className="w-5 h-5 bg-gray-200 rounded text-xs font-bold">-</button>
                                                        <span className="text-xs font-bold">{item.cartQuantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} className="w-5 h-5 bg-gray-200 rounded text-xs font-bold">+</button>
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs font-bold p-1">✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between font-extrabold text-gray-900 mb-4">
                                    <span>Subtotal</span>
                                    <span className="text-blue-600">PKR {subtotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => { setIsCartDrawerOpen(false); setIsCheckoutOpen(true); }}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeDetailProduct && (
                <ProductDetailModal
                    product={activeDetailProduct}
                    onClose={() => setActiveDetailProduct(null)}
                    onCheckoutNow={() => { setActiveDetailProduct(null); setIsCheckoutOpen(true); }}
                />
            )}

            {isCheckoutOpen && (
                <CheckoutModal
                    onClose={() => setIsCheckoutOpen(false)}
                    onSuccess={() => setIsCheckoutOpen(false)}
                />
            )}

            {isAuthOpen && <LoginRegisterModal onClose={() => setIsAuthOpen(false)} />}
            {isProfileOpen && <CustomerProfileModal onClose={() => setIsProfileOpen(false)} />}

            <StoreFooter />
        </div>
    );
}

export default Storefront;