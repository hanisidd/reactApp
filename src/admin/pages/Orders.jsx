import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
    getOrdersApi,
    toggleOrderStatusApi,
    sendProductEmailApi,
} from "../services/orders";
import { useDataTable } from "../hooks/useDataTable";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmailId, setSendingEmailId] = useState(null);

    // DataTable Hook
    const {
        search,
        setSearch,
        sortConfig,
        handleSort,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        paginatedData,
    } = useDataTable(orders, ["order_number", "customer_name", "customer_email", "total_amount", "status"], 5);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrdersApi();
            setOrders(data.orders);
        } catch (err) {
            toast.error(err.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (order) => {
        try {
            const data = await toggleOrderStatusApi(order.id);
            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? data.order : o))
            );
            toast.success(data.message);
        } catch (err) {
            toast.error(err.message || "Failed to update order status");
        }
    };

    const handleSendEmail = async (order) => {
        if (!order.product?.file_original_name) {
            toast.error("This product does not have a digital file attached!");
            return;
        }

        const result = await Swal.fire({
            title: "Send Digital Product Email?",
            text: `Send digital product file "${order.product.file_original_name}" to ${order.customer_email}?`,
            icon: "mail",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            confirmButtonText: "Yes, send email",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            setSendingEmailId(order.id);
            const data = await sendProductEmailApi(order.id);
            
            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? data.order : o))
            );
            
            toast.success(data.message);
        } catch (err) {
            toast.error(err?.message || "Failed to send product email");
        } finally {
            setSendingEmailId(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track customer purchases and manage digital product file deliveries
                    </p>
                </div>
                <div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th
                                onClick={() => handleSort("order_number")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Order ID {sortConfig.key === "order_number" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("customer_name")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Customer {sortConfig.key === "customer_name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                            <th
                                onClick={() => handleSort("total_amount")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Total {sortConfig.key === "total_amount" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("status")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email Dispatched</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-500">
                                    No matching orders found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((order) => {
                                const cover = order.product?.images?.find((img) => img.is_cover) || order.product?.images?.[0];
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">
                                            {order.order_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {cover?.image_url ? (
                                                    <img
                                                        src={cover.image_url}
                                                        alt={order.product?.title}
                                                        className="w-10 h-10 object-cover rounded border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                                                        No img
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-medium text-gray-800 block truncate max-w-[180px]">
                                                        {order.product?.title || "Deleted Product"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${parseFloat(order.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(order)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer transition ${
                                                    order.status === "success"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                        : "bg-red-100 text-red-800 hover:bg-red-200"
                                                }`}
                                            >
                                                {order.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {order.email_sent_at ? (
                                                <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded font-medium border border-green-200">
                                                    ✓ Sent ({new Date(order.email_sent_at).toLocaleDateString()})
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Not sent yet</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleSendEmail(order)}
                                                disabled={sendingEmailId === order.id}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-xs rounded transition disabled:opacity-50"
                                            >
                                                {sendingEmailId === order.id ? "Sending..." : "✉ Send Product Email"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={5}
                />
            </div>
        </div>
    );
}

export default Orders;