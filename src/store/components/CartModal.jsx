import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

function CartModal() {
    const navigate = useNavigate();
    const {
        cart,
        isCartOpen,
        closeCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        clearCart,
    } = useCart();

    if (!isCartOpen) return null;

    const handleProceedCheckout = () => {
        closeCart();
        navigate("/checkout");
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl p-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-black text-gray-900">Your Shopping Cart</h2>
                    </div>
                    <button onClick={closeCart} className="text-gray-400 hover:text-gray-600 text-2xl font-light">
                        &times;
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <ShoppingBagIcon className="w-12 h-12 mx-auto mb-2 stroke-1" />
                            <p className="text-sm font-semibold">Your cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const cover = item.images?.find((i) => i.is_cover) || item.images?.[0];
                            return (
                                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border flex-shrink-0">
                                        {cover?.image_url ? (
                                            <img src={cover.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                                        <p className="text-xs font-black text-blue-600 mt-0.5">
                                            PKR {parseFloat(item.price).toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {item.type === "digital" ? (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                                                    Digital (1x)
                                                </span>
                                            ) : (
                                                <div className="flex items-center border bg-white rounded-lg px-2 py-0.5 text-xs font-bold gap-2">
                                                    <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>-</button>
                                                    <span>{item.cartQuantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}>+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                        <div className="flex justify-between text-sm font-bold text-gray-900">
                            <span>Subtotal</span>
                            <span className="text-blue-600">PKR {subtotal.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleProceedCheckout}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
                        >
                            Proceed to Checkout
                        </button>
                        <button onClick={clearCart} className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600">
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartModal;