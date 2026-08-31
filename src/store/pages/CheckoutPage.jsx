import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { fetchCheckoutSettingsApi, validatePromoCodeApi, submitCheckoutApi, initiatePaymentApi } from "../services/storeApi";
import { PAKISTAN_LOCATIONS } from "../data/pakistanLocations";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import toast from "react-hot-toast";
import { ArrowLeftIcon, ShoppingBagIcon, TrashIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import Loader from "../../admin/components/Loader";
// ...

function CheckoutPage() {
    const navigate = useNavigate();
    const {
        cart,
        subtotal,
        hasPhysicalProduct,
        hasOnlyDigital,
        hasBothTypes,
        digitalSubtotal,
        clearCart,
        updateQuantity,
        removeFromCart,
    } = useCart();
    const { user } = useUserAuth();

    const [publicSettings, setPublicSettings] = useState(null);
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
    const [settings, setSettings] = useState({ tax_percentage: 5, delivery_fee: 250 });
    const [promoInput, setPromoInput] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const [settingsData, publicSettingsRes] = await Promise.all([
                    fetchCheckoutSettingsApi(),
                    fetch("http://localhost:8000/api/public-settings").then((r) => r.json()),
                ]);
                setSettings(settingsData);
                setPublicSettings(publicSettingsRes);
            } catch (err) {
                console.error("Checkout load error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCheckoutData();
    }, []);


    const handleProvinceChange = (e) => {
        const selectedProvince = e.target.value;
        setForm((prev) => ({ ...prev, province: selectedProvince, city: "" }));
        setAvailableCities(PAKISTAN_LOCATIONS[selectedProvince] || []);
    };

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
            toast.success("Promo code applied!");
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
            toast.error("Cash on Delivery is not allowed for Digital downloads.");
            return;
        }

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
                payment_method: form.payment_method,
                promo_code: appliedPromo?.code || null,
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.cartQuantity || 1
                }))
            };

            const response = await submitCheckoutApi(payload);
            const order = response.order;

            // If this order needs a real payment (either "advance" was chosen,
            // or it's a mixed cart where the digital portion must be prepaid
            // even though COD was picked for the physical portion), send the
            // browser to Safepay instead of finishing here.
            if (response.requires_payment) {
                toast.success(`Order #${order.order_number} created — redirecting to payment...`);
                const paymentInit = await initiatePaymentApi(order.id);
                clearCart();
                window.location.href = paymentInit.redirect_url;
                return;
            }

            toast.success(`Order #${order.order_number} placed successfully!`);
            clearCart();
            navigate("/products");
        } catch (err) {
            toast.error(err?.message || "Checkout failed");
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) return <Loader />;
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <StoreNavbar publicSettings={publicSettings} />
                <div className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
                    <ShoppingBagIcon className="w-16 h-16 text-gray-300 mb-4 stroke-1" />
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Cart is Empty</h2>
                    <p className="text-sm text-gray-500 mb-6">Add products to your cart before proceeding to checkout.</p>
                    <Link to="/products" className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                        Browse Products Catalog
                    </Link>
                </div>
                <StoreFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />
            <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => navigate(-1)} className="text-xs font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        <ArrowLeftIcon className="w-4 h-4" /> Back
                    </button>
                    <span className="text-gray-300">/</span>
                    <h1 className="text-xl font-black text-gray-900">Checkout & Order Review</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-7 space-y-6">
                        <form id="checkout-form" onSubmit={handleSubmitOrder} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">1. Customer Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name *"
                                        value={form.customer_name}
                                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address *"
                                        value={form.customer_email}
                                        onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                    />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Mobile Phone (03001234567) *"
                                        value={form.customer_phone}
                                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                                        className="w-full sm:col-span-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            {hasPhysicalProduct && (
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">2. Shipping Location (Pakistan Only)</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    value="Pakistan"
                                                    disabled
                                                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-700"
                                                />
                                            </div>
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
                                            <div>
                                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">City *</label>
                                                <select
                                                    required
                                                    disabled={!form.province}
                                                    value={form.city}
                                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 bg-white disabled:bg-gray-100"
                                                >
                                                    <option value="">Select City</option>
                                                    {availableCities.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Street Address / House No. *</label>
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

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">3. Payment Option</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label
                                        className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${form.payment_method === "advance"
                                            ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
                                            : "border-gray-200"
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
                                                <p className="text-[11px] text-gray-500">Pay securely via Safepay (cards & wallets)</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label
                                        className={`p-4 rounded-xl border transition ${hasOnlyDigital
                                            ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                                            : form.payment_method === "cod"
                                                ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 cursor-pointer"
                                                : "border-gray-200 cursor-pointer"
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
                                                    {hasOnlyDigital ? "Not available for digital files" : "Pay upon receipt"}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Mixed cart + COD: digital items still need to be prepaid.
                                    Surfaces the same rule the admin panel already shows
                                    (see "Mixed COD" in Orders.jsx) at the point of selection. */}
                                {hasBothTypes && form.payment_method === "cod" && (
                                    <div className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs">
                                        <InformationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p>
                                            Your cart has both digital and physical items. The digital portion
                                            (<strong>PKR {digitalSubtotal.toLocaleString()}</strong>) requires advance
                                            payment and will be processed via Safepay before your order is confirmed —
                                            only the physical items remain payable on delivery.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Ordered Items & Price Summary */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-gray-900 pb-3 border-b border-gray-100">Order Items ({cart.length})</h3>

                            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                                {cart.map((item) => {
                                    const cover = item.images?.find((i) => i.is_cover) || item.images?.[0];
                                    return (
                                        <div key={item.id} className="flex gap-3 items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border flex-shrink-0">
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
                                                <div className="flex items-center gap-2 mt-1">
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
                                })}
                            </div>

                            {/* Promo Code Input */}
                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Apply Promo Discount Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Code (e.g. SAVE10)"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-600"
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

                            {/* Calculation Breakdown */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>PKR {subtotal.toLocaleString()}</span>
                                </div>
                                {appliedPromo && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Discount ({appliedPromo.code})</span>
                                        <span>- PKR {discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax ({settings.tax_percentage}%)</span>
                                    <span>PKR {taxAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee > 0 ? `PKR ${deliveryFee.toLocaleString()}` : "FREE"}</span>
                                </div>
                                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total Amount</span>
                                    <span className="text-blue-600">PKR {finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={submitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
                            >
                                {submitting ? "Processing..." : `Confirm & Place Order (PKR ${finalTotal.toLocaleString()})`}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}

export default CheckoutPage;
