import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { fetchCheckoutSettingsApi, validatePromoCodeApi, submitCheckoutApi } from "../services/storeApi";
import { PAKISTAN_LOCATIONS } from "../data/pakistanLocations";
import toast from "react-hot-toast";

function CheckoutModal({ onClose, onSuccess }) {
    const { cart, subtotal, hasPhysicalProduct, hasOnlyDigital, clearCart } = useCart();
    const { user } = useUserAuth();

    const [form, setForm] = useState({
        customer_name: user?.name || "",
        customer_email: user?.email || "",
        customer_phone: user?.phone || "",
        country: "Pakistan",
        province: "",
        city: "",
        street_address: user?.address || "",
        payment_method: "advance",
    });

    const [availableCities, setAvailableCities] = useState([]);
    const [settings, setSettings] = useState({ tax_percentage: 5, delivery_fee: 250 }); // PKR Default Delivery
    const [promoInput, setPromoInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCheckoutSettingsApi()
            .then(setSettings)
            .catch(() => {});
    }, []);

    // When Province changes, update available cities list
    const handleProvinceChange = (e) => {
        const selectedProvince = e.target.value;
        setForm((prev) => ({ ...prev, province: selectedProvince, city: "" }));
        setAvailableCities(PAKISTAN_LOCATIONS[selectedProvince] || []);
    };

    // Price Calculations (in PKR)
    const deliveryFee = hasPhysicalProduct ? settings.delivery_fee : 0;
    
    let discountAmount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === "percentage") {
            discountAmount = (subtotal * appliedPromo.value) / 100;
        } else {
            discountAmount = parseFloat(appliedPromo.value);
        }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * settings.tax_percentage) / 100;
    const finalTotal = taxableAmount + taxAmount + deliveryFee;

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        try {
            const data = await validatePromoCodeApi(promoInput);
            setAppliedPromo(data.promo);
            toast.success("Promo code applied successfully!");
        } catch (err) {
            toast.error(err.message || "Invalid promo code");
            setAppliedPromo(null);
        }
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error("Your cart is empty!");
            return;
        }

        if (hasOnlyDigital && form.payment_method === "cod") {
            toast.error("Cash on Delivery is not permitted for digital downloads.");
            return;
        }

        // Build combined shipping address string for physical orders
        const fullShippingAddress = hasPhysicalProduct
            ? `${form.street_address}, ${form.city}, ${form.province}, Pakistan`
            : null;

        try {
            setSubmitting(true);
            const payload = {
                customer_name: form.customer_name,
                customer_email: form.customer_email,
                customer_phone: form.customer_phone,
                shipping_address: fullShippingAddress,
                product_id: cart[0].id,
                payment_method: form.payment_method,
                promo_code: appliedPromo?.code || null,
                has_physical: hasPhysicalProduct,
            };

            const response = await submitCheckoutApi(payload);
            toast.success(response.message || "Order placed successfully!");
            clearCart();
            onSuccess(response.order);
        } catch (err) {
            toast.error(err?.message || "Checkout failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-extrabold text-gray-900">Checkout</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-6">
                    {/* Customer Information */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                required
                                placeholder="Full Name *"
                                value={form.customer_name}
                                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                            <input
                                type="email"
                                required
                                placeholder="Email Address *"
                                value={form.customer_email}
                                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                            <input
                                type="text"
                                required
                                placeholder="Mobile Number (e.g. 03001234567) *"
                                value={form.customer_phone}
                                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                className="w-full sm:col-span-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {/* Pakistan Shipping Address Details */}
                    {hasPhysicalProduct && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping Location (Pakistan Only)</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Country Locked to Pakistan */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Country</label>
                                        <input
                                            type="text"
                                            value="Pakistan"
                                            disabled
                                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Province Dropdown */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Province *</label>
                                        <select
                                            required
                                            value={form.province}
                                            onChange={handleProvinceChange}
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 bg-white"
                                        >
                                            <option value="">Select Province</option>
                                            {Object.keys(PAKISTAN_LOCATIONS).map((prov) => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* City Cascading Dropdown */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">City *</label>
                                        <select
                                            required
                                            disabled={!form.province}
                                            value={form.city}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select City</option>
                                            {availableCities.map((city) => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Detailed Street Address */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Street Address / House No. / Area *</label>
                                    <textarea
                                        required
                                        rows="2"
                                        placeholder="House #, Street name, Sector/Block, Nearby landmark..."
                                        value={form.street_address}
                                        onChange={(e) => setForm({ ...form, street_address: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Method */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Method</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label
                                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                                    form.payment_method === "advance"
                                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="advance"
                                        checked={form.payment_method === "advance"}
                                        onChange={() => setForm({ ...form, payment_method: "advance" })}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Advance Payment</p>
                                        <p className="text-[11px] text-gray-500">Bank Transfer / JazzCash / EasyPaisa</p>
                                    </div>
                                </div>
                            </label>

                            <label
                                className={`p-4 rounded-xl border transition ${
                                    hasOnlyDigital
                                        ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                                        : form.payment_method === "cod"
                                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 cursor-pointer"
                                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="cod"
                                        disabled={hasOnlyDigital}
                                        checked={form.payment_method === "cod"}
                                        onChange={() => setForm({ ...form, payment_method: "cod" })}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Cash on Delivery</p>
                                        <p className="text-[11px] text-gray-500">
                                            {hasOnlyDigital ? "Not allowed for Digital items" : "Pay upon delivery"}
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Promo Code */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Promo Code</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter code (e.g. SAVE10)"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-600"
                            />
                            <button
                                type="button"
                                onClick={handleApplyPromo}
                                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Price Breakdown (PKR) */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>PKR {subtotal.toLocaleString()}</span>
                        </div>
                        {appliedPromo && (
                            <div className="flex justify-between text-green-600 font-semibold">
                                <span>Discount ({appliedPromo.code})</span>
                                <span>- PKR {discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                            <span>Tax ({settings.tax_percentage}%)</span>
                            <span>PKR {taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Charges</span>
                            <span>{deliveryFee > 0 ? `PKR ${deliveryFee.toLocaleString()}` : "FREE"}</span>
                        </div>
                        <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total Payable</span>
                            <span className="text-blue-600">PKR {finalTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                    >
                        {submitting ? "Processing Order..." : `Place Order (PKR ${finalTotal.toLocaleString()})`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CheckoutModal;