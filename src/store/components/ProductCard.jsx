import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

function ProductCard({ product, onViewDetails, onQuickBuy }) {
    const { addToCart } = useCart();
    const cover = product.images?.find((i) => i.is_cover) || product.images?.[0];

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, 1);
        toast.success(`Added "${product.title}" to cart!`);
    };

    return (
        <div
            onClick={() => onViewDetails(product)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
        >
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                {cover?.image_url ? (
                    <img
                        src={cover.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Preview
                    </div>
                )}

                <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        product.type === "digital"
                            ? "bg-purple-600 text-white"
                            : "bg-blue-600 text-white"
                    }`}
                >
                    {product.type === "digital" ? "Digital File" : "Physical Item"}
                </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        {product.category?.name || "General"}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                        {product.title}
                    </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-400 block">Price</span>
                        <span className="text-lg font-extrabold text-gray-900">
                            PKR {parseFloat(product.price).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddToCart}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center justify-center"
                            title="Add to Cart"
                        >
                            <ShoppingCartIcon className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(e);
                                onQuickBuy();
                            }}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;