import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, openCheckout } = useCart();

    const [product, setProduct] = useState(null);
    const [publicSettings, setPublicSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetch("http://localhost:8000/api/store/public-settings")
            .then((r) => r.json())
            .then(setPublicSettings)
            .catch(() => {});

        fetch(`http://localhost:8000/api/store/products/${id}`)
            .then((r) => r.json())
            .then((data) => setProduct(data.product))
            .catch(() => toast.error("Failed to load product details"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-20 text-center text-gray-500">Loading Product...</div>;
    if (!product) return <div className="p-20 text-center text-red-500">Product Not Found.</div>;

    const images = product.images || [];
    const isDigital = product.type === "digital";

    const handleAddToCart = () => {
        addToCart(product, isDigital ? 1 : quantity);
        toast.success(`Added "${product.title}" to cart!`);
    };

    const handleBuyNow = () => {
        addToCart(product, isDigital ? 1 : quantity);
        openCheckout();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />

            <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-blue-600 mb-6 transition"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Products
                </button>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
                    {/* Left Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                            {images.length > 0 ? (
                                <img
                                    src={images[currentImageIndex]?.image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((p) => (p === 0 ? images.length - 1 : p - 1))}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md font-bold"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((p) => (p === images.length - 1 ? 0 : p + 1))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md font-bold"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                                            currentImageIndex === idx ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"
                                        }`}
                                    >
                                        <img src={img.image_url} alt="thumb" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Specs & Actions */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {product.category?.name || "General"}
                            </span>
                            <h1 className="text-3xl font-black text-gray-900 mt-3 mb-2">{product.title}</h1>
                            <div className="text-2xl font-black text-blue-600 mb-6">
                                PKR {parseFloat(product.price).toLocaleString()}
                            </div>

                            <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-md font-bold inline-block mb-6">
                                {isDigital ? "Digital File (Instant Download)" : "Physical Item"}
                            </span>

                            {/* Quantity Controls */}
                            <div className="border-t border-b border-gray-100 py-4 mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                                {isDigital ? (
                                    <p className="text-xs text-gray-500 italic bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                                        Digital items grant unlimited downloads. Quantity is set to 1.
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700"
                                        >
                                            -
                                        </button>
                                        <span className="text-base font-bold text-gray-900 w-8 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity((q) => q + 1)}
                                            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700"
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                                <div
                                    className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-6">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-xl transition"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}

export default ProductDetail;