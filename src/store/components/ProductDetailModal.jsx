import { useState } from "react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

function ProductDetailModal({ product, onClose, onCheckoutNow }) {
    const { addToCart } = useCart();
    const images = product.images || [];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const isDigital = product.type === "digital";

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleAddToCart = () => {
        addToCart(product, isDigital ? 1 : quantity);
        toast.success(`Added ${isDigital ? 1 : quantity}x "${product.title}" to cart!`);
    };

    const handleBuyNow = () => {
        addToCart(product, isDigital ? 1 : quantity);
        onCheckoutNow();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
                {/* Image Viewer with Prev / Next Navigation Arrows */}
                <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 relative">
                    <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-inner border border-gray-200/60 mb-4 group">
                        {images.length > 0 ? (
                            <img
                                src={images[currentImageIndex]?.image_url}
                                alt={product.title}
                                className="w-full h-full object-cover transition duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No Preview
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition font-bold text-lg"
                                    title="Previous Image"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition font-bold text-lg"
                                    title="Next Image"
                                >
                                    ›
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Selector */}
                    {images.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                                        currentImageIndex === idx ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"
                                    }`}
                                >
                                    <img src={img.image_url} alt="thumb" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info & Quantity Controls */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {product.category?.name || "General"}
                            </span>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">
                                &times;
                            </button>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-2">{product.title}</h2>
                        <div className="text-2xl font-black text-blue-600 mb-4">
                            PKR {parseFloat(product.price).toFixed(2)}
                        </div>

                        <div className="flex gap-2 mb-4">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-semibold">
                                {isDigital ? "💾 Digital File (Instant Access)" : "📦 Physical Goods"}
                            </span>
                        </div>

                        {/* Quantity Selector Rule */}
                        <div className="border-t border-b border-gray-100 py-4 my-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Quantity
                            </label>
                            {isDigital ? (
                                <div className="text-xs text-gray-500 italic bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                                    ℹ Digital items grant unlimited access. Quantity is locked to 1.
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-700"
                                    >
                                        -
                                    </button>
                                    <span className="text-base font-bold text-gray-900 w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-700"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                            <div
                                className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }}
                            />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-xl transition"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailModal;