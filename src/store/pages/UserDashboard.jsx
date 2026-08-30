import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import Loader from "../../admin/components/Loader";
import { 
    ShoppingBagIcon, 
    ArrowDownTrayIcon, 
} from "@heroicons/react/24/outline";

function UserDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useUserAuth();
    const [publicSettings, setPublicSettings] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        fetch("http://localhost:8000/api/public-settings")
            .then((r) => r.json())
            .then(setPublicSettings)
            .catch(() => {});

        const token = localStorage.getItem("user_token");
        fetch("http://localhost:8000/api/orders", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        })
            .then((r) => r.json())
            .then((data) => setOrders(data.orders || []))
            .catch((err) => console.error("Error fetching orders:", err))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />

            <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center text-2xl font-black border border-white/30">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || "U"
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Welcome back, {user?.name}!</h1>
                            <p className="text-xs text-blue-100 mt-1">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/profile"
                            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 transition"
                        >
                            Edit Profile
                        </Link>
                        <button
                            onClick={() => {
                                logout();
                                navigate("/");
                            }}
                            className="px-5 py-2.5 bg-red-500/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition shadow-md"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <ShoppingBagIcon className="w-6 h-6 text-blue-600" /> My Orders ({orders.length})
                        </h2>
                        <Link to="/products" className="text-xs font-bold text-blue-600 hover:underline">
                            Browse Store Catalog
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3 shadow-sm">
                            <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto stroke-1" />
                            <h3 className="text-base font-bold text-gray-900">No Orders Placed Yet</h3>
                            <p className="text-xs text-gray-500">Your order history and digital file download links will appear here.</p>
                            <Link to="/products" className="inline-block mt-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const product = order.product;
                                const cover = product?.images?.find((i) => i.is_cover) || product?.images?.[0];

                                return (
                                    <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                                        <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 gap-2">
                                            <div>
                                                <span className="text-xs font-black text-gray-900">Order #{order.order_number || order.id}</span>
                                                <span className="text-[11px] text-gray-400 block mt-0.5">
                                                    Placed on {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    order.payment_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                                }`}>
                                                    Payment: {order.payment_status}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    order.status === "delivered" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                    Status: {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border flex-shrink-0">
                                                {cover?.image_url ? (
                                                    <img src={cover.image_url} alt={product?.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{product?.title || "Store Item"}</h4>
                                                <p className="text-xs text-gray-500 capitalize">{product?.type || "Standard"} Item</p>
                                                <p className="text-sm font-black text-blue-600 mt-1">
                                                    PKR {parseFloat(order.total_amount).toLocaleString()}
                                                </p>
                                            </div>

                                            {product?.type === "digital" && product?.digital_file_url && (
                                                <a
                                                    href={product.digital_file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                                                >
                                                    <ArrowDownTrayIcon className="w-4 h-4" /> Download File
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}

export default UserDashboard;