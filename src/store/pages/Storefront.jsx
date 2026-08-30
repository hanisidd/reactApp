import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRightIcon,
    SparklesIcon,
    ShieldCheckIcon,
    TruckIcon
} from "@heroicons/react/24/outline";
import StoreNavbar from "../components/StoreNavbar";
import ProductCard from "../components/ProductCard";
import StoreFooter from "../components/StoreFooter";
import Loader from "../../admin/components/Loader";
// ...


function Storefront() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [publicSettings, setPublicSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const [settingsRes, featuredRes] = await Promise.all([
                    fetch("http://localhost:8000/api/public-settings").then((r) => r.json()),
                    fetch("http://localhost:8000/api/products/featured").then((r) => r.json()),
                ]);
                setPublicSettings(settingsRes);
                setFeaturedProducts(featuredRes.products || []);
            } catch (err) {
                console.error("Storefront load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadHomeData();
    }, []);

    if (loading) return <Loader />;


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />

            {/* Full Hero Banner with Dynamic Background */}
            <section
                className="relative bg-slate-900 text-white py-24 px-6 bg-cover bg-center bg-no-repeat overflow-hidden"
                style={{
                    backgroundImage: publicSettings?.hero_image_url
                        ? `url("${publicSettings.hero_image_url}")`
                        : undefined,
                }}
            >
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0" />
                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-400/30 uppercase tracking-widest inline-block mb-4">
                            {publicSettings?.brand_name || "Official Store"}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white leading-tight">
                            {publicSettings?.hero_heading || "Discover & Download Premium Products"}
                        </h1>
                        <p className="text-base md:text-lg text-gray-200 mb-8 font-light leading-relaxed">
                            {publicSettings?.hero_text || "Explore our top-tier digital products and physical merchandise."}
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition"
                        >
                            Browse All Products <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="bg-white border-b border-gray-100 py-8 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <SparklesIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Instant Delivery</h4>
                            <p className="text-xs text-gray-500">Digital downloads sent directly to your email.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <TruckIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Pakistan-Wide Shipping</h4>
                            <p className="text-xs text-gray-500">Fast delivery across all provinces and cities.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <ShieldCheckIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Verified Quality</h4>
                            <p className="text-xs text-gray-500">Authentic digital items and physical goods.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Showcase */}
            <section className="max-w-7xl mx-auto px-6 py-16 w-full">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">Handpicked Selection</span>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Featured Products</h2>
                    </div>
                    <Link to="/products" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        View Full Catalog <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading Featured Catalog...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* About Section */}
            <section id="about" className="bg-white py-16 px-6 border-t border-gray-100">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">About {publicSettings?.brand_name || "Sleek Sites"}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {publicSettings?.footer_about || "Your trusted store for instant digital downloads and physical products."}
                    </p>
                </div>
            </section>

            <StoreFooter />
        </div>
    );
}

export default Storefront;