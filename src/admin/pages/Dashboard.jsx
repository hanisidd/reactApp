import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardDataApi } from "../services/dashboard";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const result = await getDashboardDataApi();
            setData(result);
        } catch (err) {
            toast.error(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    const { stats, recent_orders } = data || {};

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Welcome back! Here is what's happening across your store today.
                </p>
            </div>

            {/* Metric KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Revenue */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Total Revenue
                        </p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                            {stats?.total_earnings?.toFixed(2) || "0.00"}
                        </h3>
                        <span className="text-[11px] text-green-600 font-medium mt-1 inline-block">
                            ★ Successful completed orders
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl font-bold">
                        PKR
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Total Orders
                        </p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                            {stats?.total_orders || 0}
                        </h3>
                        <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">
                            📦 All purchase requests
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
                        🛍
                    </div>
                </div>

                {/* Registered Users */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Customers
                        </p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                            {stats?.total_users || 0}
                        </h3>
                        <span className="text-[11px] text-purple-600 font-medium mt-1 inline-block">
                            👤 Registered accounts
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
                        👥
                    </div>
                </div>

                {/* Digital Products */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Active Products
                        </p>
                        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                            {stats?.total_products || 0}
                        </h3>
                        <span className="text-[11px] text-amber-600 font-medium mt-1 inline-block">
                            📁 Across {stats?.total_categories || 0} categories
                        </span>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl font-bold">
                        💾
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Latest purchases submitted by store visitors
                        </p>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                    >
                        View All Orders &rarr;
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {!recent_orders || recent_orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                recent_orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">
                                            {order.order_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {order.customer_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.customer_email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {order.product?.title || "Deleted Product"}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {parseFloat(order.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                    order.status === "success"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;