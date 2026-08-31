import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("store_cart");
        return saved ? JSON.parse(saved) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("store_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart((prev) => {
            const index = prev.findIndex((item) => item.id === product.id);

            if (index > -1) {
                if (product.type === "digital" || prev[index].type === "digital") {
                    toast.error(`"${product.title}" is a digital file and is already in your cart!`);
                    return prev;
                }

                const updated = [...prev];
                const currentQty = updated[index].cartQuantity || 1;
                updated[index] = {
                    ...updated[index],
                    cartQuantity: currentQty + quantity
                };
                toast.success(`Updated quantity for "${product.title}"`);
                return updated;
            }

            toast.success(`Added "${product.title}" to cart!`);
            return [
                ...prev,
                { ...product, cartQuantity: product.type === "digital" ? 1 : quantity }
            ];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
        toast.success("Item removed from cart");
    };

    const updateQuantity = (productId, quantity) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    if (item.type === "digital") return { ...item, cartQuantity: 1 };
                    if (quantity <= 0) return null;
                    return { ...item, cartQuantity: quantity };
                }
                return item;
            }).filter(Boolean)
        );
    };

    const getItemQuantity = (productId) => {
        const item = cart.find((i) => i.id === productId);
        return item ? item.cartQuantity : 0;
    };

    const clearCart = () => setCart([]);

    const totalCount = cart.reduce((sum, item) => sum + (item.cartQuantity || 1), 0);
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.cartQuantity || 1), 0);
    const hasPhysicalProduct = cart.some((item) => item.type === "physical");
    const hasOnlyDigital = cart.length > 0 && cart.every((item) => item.type === "digital");
    const hasBothTypes = hasPhysicalProduct && cart.some((item) => item.type === "digital");
    const digitalSubtotal = cart
        .filter((item) => item.type === "digital")
        .reduce((sum, item) => sum + parseFloat(item.price), 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                getItemQuantity,
                clearCart,
                totalCount,
                subtotal,
                hasPhysicalProduct,
                hasOnlyDigital,
                hasBothTypes,        // NEW
                digitalSubtotal,      // NEW
                isCartOpen,
                openCart: () => setIsCartOpen(true),
                closeCart: () => setIsCartOpen(false),
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);