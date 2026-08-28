import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("store_cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("store_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].cartQuantity += quantity;
                return updated;
            }
            return [...prev, { ...product, cartQuantity: quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, cartQuantity: quantity } : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const totalCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.cartQuantity, 0);
    const hasPhysicalProduct = cart.some((item) => item.type === "physical");
    const hasOnlyDigital = cart.length > 0 && cart.every((item) => item.type === "digital");

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalCount,
                subtotal,
                hasPhysicalProduct,
                hasOnlyDigital,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);