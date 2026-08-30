import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import { useDataTable } from "../hooks/useDataTable";
import { sendProductEmailApi } from "../services/orders";
import toast from "react-hot-toast";
import {
    EyeIcon,
    EnvelopeIcon,
    XMarkIcon,
    ArrowPathIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Mail, Search, ArrowUpDown, CheckCircle, Clock } from "lucide-react";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [sendingEmailId, setSendingEmailId] = useState(null);

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
    } = useDataTable(orders, ["order_number", "customer_name", "customer_email", "status"], 8);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("admin_token");
            const res = await fetch("http://localhost:8000/api/admin/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders || data || []);
            } else {
                toast.error(data.message || "Failed to fetch orders");
            }
        } catch (err) {
            toast.error("Network error fetching orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(true);
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Order #${orderId} set to "${newStatus}" & email sent!`);
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
                );
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
                }
            } else {
                toast.error(data.message || "Failed to update order status");
            }
        } catch (err) {
            toast.error("Error updating order status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const isDigitalOrder = (order) => {
        if (order.product && order.product.type === "digital") return true;
        const items = order.items || [];
        return items.some((item) => item.product && item.product.type === "digital");
    };

    const handleSendProductEmail = async (orderId) => {
        try {
            setSendingEmailId(orderId);
            const data = await sendProductEmailApi(orderId);
            toast.success(data.message || "Digital product email sent.");
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o)));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder((prev) => ({ ...prev, ...data.order }));
            }
        } catch (err) {
            toast.error(err.message || "Failed to send product email");
        } finally {
            setSendingEmailId(null);
        }
    };

    const calculatePaymentBreakdown = (order) => {
        const items = order.items || (order.product ? [order.product] : []);
        let digitalSubtotal = 0;
        let physicalSubtotal = 0;

        items.forEach((item) => {
            const price = parseFloat(item.price || item.unit_price || 0);
            const qty = item.quantity || item.cartQuantity || 1;
            const itemType = item.type || (item.product ? item.product.type : null);
            if (itemType === "digital") {
                digitalSubtotal += price * qty;
            } else {
                physicalSubtotal += price * qty;
            }
        });

        const total = parseFloat(order.total_amount || digitalSubtotal + physicalSubtotal);
        const isCOD = order.payment_method === "cod";

        if (isCOD && physicalSubtotal > 0 && digitalSubtotal > 0) {
            return {
                mode: "Mixed COD",
                paidAmount: digitalSubtotal,
                remainingAmount: physicalSubtotal,
                isMixed: true,
            };
        }

        return {
            mode: order.payment_method ? order.payment_method.toUpperCase() : "COD",
            paidAmount: order.payment_status === "paid" ? total : 0,
            remainingAmount: order.payment_status === "paid" ? 0 : total,
            isMixed: false,
        };
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Track sales, manage status transitions, and dispatch customer emails
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search orders..."
                            className="border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-56"
                        />
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-2 transition"
                    >
                        <ArrowPathIcon className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th
                                    onClick={() => handleSort("order_number")}
                                    className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 select-none"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        Order ID <ArrowUpDown className="w-3 h-3" />
                                        {sortConfig.key === "order_number" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                                    </span>
                                </th>
                                <th className="px-6 py-3.5">Customer Details</th>
                                <th className="px-6 py-3.5">Total & Payment</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5">Digital Email</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-400">
                                        No matching orders found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((order) => {
                                    const payment = calculatePaymentBreakdown(order);
                                    const digital = isDigitalOrder(order);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-mono font-bold text-blue-600">
                                                #{order.order_number || order.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">
                                                    {order.customer_name || (order.user ? order.user.name : "Guest Customer")}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {order.customer_email || (order.user ? order.user.email : "No email")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-gray-900">
                                                    PKR {parseFloat(order.total_amount).toLocaleString()}
                                                </div>
                                                {payment.isMixed ? (
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">
                                                        Paid: PKR {payment.paidAmount} | COD Due: PKR {payment.remainingAmount}
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={
                                                            order.payment_status === "paid"
                                                                ? "inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800"
                                                                : "inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800"
                                                        }
                                                    >
                                                        {order.payment_status ? order.payment_status.toUpperCase() : "UNPAID"} ({payment.mode})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status || "pending"}
                                                    disabled={updatingStatus}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs rounded-xl focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                {digital ? (
                                                    order.email_sent_at ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Sent on {new Date(order.email_sent_at).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                                            <Clock className="w-3 h-3" /> Not Sent
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-medium">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                {digital && (
                                                    <button
                                                        onClick={() => handleSendProductEmail(order.id)}
                                                        disabled={sendingEmailId === order.id}
                                                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition inline-flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                        {sendingEmailId === order.id ? "Sending..." : "Send Product Email"}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition inline-flex items-center gap-1"
                                                >
                                                    <EyeIcon className="w-4 h-4" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={8}
                />
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-lg font-black text-gray-900">
                                    Order #{selectedOrder.order_number || selectedOrder.id}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Placed on {new Date(selectedOrder.created_at || Date.now()).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</h4>
                                    <p className="text-xs font-bold text-gray-900 mt-1">
                                        {selectedOrder.customer_name || (selectedOrder.user ? selectedOrder.user.name : "N/A")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedOrder.customer_email || (selectedOrder.user ? selectedOrder.user.email : "N/A")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedOrder.customer_phone || "No Phone Provided"}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shipping Address</h4>
                                    <p className="text-xs font-medium text-gray-700 mt-1">
                                        {selectedOrder.shipping_address || "No Physical Address Required (Digital Order)"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Purchased Products</h3>
                                <div className="space-y-3">
                                    {(selectedOrder.items || (selectedOrder.product ? [selectedOrder.product] : [])).map((item, idx) => {
                                        const prod = item.product || item;
                                        const isDigitalItem = prod.type === "digital";
                                        const fileUrl = prod.digital_file_url || selectedOrder.digital_file_url;

                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={
                                                            isDigitalItem
                                                                ? "px-2 py-1 text-[9px] font-black uppercase rounded-lg bg-purple-100 text-purple-700"
                                                                : "px-2 py-1 text-[9px] font-black uppercase rounded-lg bg-blue-100 text-blue-700"
                                                        }
                                                    >
                                                        {isDigitalItem ? "Digital" : "Physical"}
                                                    </span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-900">
                                                            {prod.title || "Product"}
                                                        </h4>
                                                        <span className="text-[11px] text-gray-400">
                                                            Qty: {item.quantity || item.cartQuantity || 1} x PKR {parseFloat(item.price || prod.price).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isDigitalItem && fileUrl && (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-xl transition flex items-center gap-1"
                                                    >
                                                        <DocumentTextIcon className="w-3.5 h-3.5" /> File Link
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {(() => {
                                const p = calculatePaymentBreakdown(selectedOrder);
                                return (
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 rounded-2xl space-y-3">
                                        <div className="flex justify-between items-center text-xs border-b border-gray-700 pb-2">
                                            <span className="text-gray-400">Payment Mode</span>
                                            <span className="font-bold">{p.mode}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400">Digital / Prepaid Amount (Paid)</span>
                                            <span className="font-bold text-emerald-400">
                                                PKR {p.paidAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400">Physical Balance Due on Delivery (COD)</span>
                                            <span className="font-bold text-amber-400">
                                                PKR {p.remainingAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-black border-t border-gray-700 pt-2 text-white">
                                            <span>Total Order Value</span>
                                            <span>PKR {parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {isDigitalOrder(selectedOrder) && (
                                <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl p-4">
                                    <div className="text-xs">
                                        {selectedOrder.email_sent_at ? (
                                            <span className="inline-flex items-center gap-1 font-bold text-green-700">
                                                <CheckCircle className="w-4 h-4" />
                                                Digital file sent on {new Date(selectedOrder.email_sent_at).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                                                <Clock className="w-4 h-4" /> Digital file not sent yet
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleSendProductEmail(selectedOrder.id)}
                                        disabled={sendingEmailId === selectedOrder.id}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Mail className="w-4 h-4" />
                                        {sendingEmailId === selectedOrder.id ? "Sending..." : "Send Product Email"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                                Updating triggers direct customer status emails
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "cancelled")}
                                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition"
                                >
                                    Cancel Order
                                </button>
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "preparing")}
                                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl transition"
                                >
                                    Set Preparing
                                </button>
                                <button
                                    disabled={updatingStatus}
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "delivered")}
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                                >
                                    Mark Delivered
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;