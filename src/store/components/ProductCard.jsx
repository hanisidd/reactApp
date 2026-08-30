import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, getItemQuantity } = useCart();

    const inCartQty = getItemQuantity(product.id);
    const cover = product.images?.find((i) => i.is_cover) || product.images?.[0];

    const handleCardClick = () => {
        navigate(`/products/${product.id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, 1);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        if (product.type !== "digital" || inCartQty === 0) {
            addToCart(product, 1);
        }
        navigate("/checkout");
    };

    return (
        <div
            onClick={handleCardClick}
            className="group w-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
        >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden w-full">
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

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        {product.category?.name || "General"}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                        {product.title}
                    </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-gray-400 block">Price</span>
                        <span className="text-base font-black text-gray-900">
                            PKR {parseFloat(product.price).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddToCart}
                            className="relative p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center justify-center"
                            title="Add to Cart"
                        >
                            <ShoppingCartIcon className="w-4 h-4" />
                            {inCartQty > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                                    {inCartQty}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
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