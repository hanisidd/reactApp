import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../components/Loader";

const BASE_URL = "http://localhost:8000/api/admin/contact-messages";

function ContactMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const getHeaders = () => ({
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
        "Accept": "application/json",
    });

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await fetch(BASE_URL, { headers: getHeaders() });
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (err) {
            toast.error("Failed to load contact messages");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRead = async (msg) => {
        try {
            const res = await fetch(`${BASE_URL}/${msg.id}/toggle-read`, {
                method: "PATCH",
                headers: getHeaders(),
            });
            const data = await res.json();
            setMessages((prev) => prev.map((m) => (m.id === msg.id ? data.contact_message : m)));
            toast.success(data.message);
        } catch (err) {
            toast.error("Could not update status");
        }
    };

    const handleDelete = async (msg) => {
        const result = await Swal.fire({
            title: "Delete Message?",
            text: `Delete message from "${msg.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return;

        try {
            await fetch(`${BASE_URL}/${msg.id}`, { method: "DELETE", headers: getHeaders() });
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            toast.success("Message deleted");
        } catch (err) {
            toast.error("Could not delete message");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Contact Us Submissions</h1>
                <p className="text-sm text-gray-500 mt-1">Review customer inquiries and messages submitted via the Contact page.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                        <tr>
                            <th className="p-4">Sender</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {messages.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-400">No contact messages received yet.</td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr key={msg.id} className={`hover:bg-gray-50 ${msg.status === "unread" ? "bg-blue-50/30 font-semibold" : ""}`}>
                                    <td className="p-4">
                                        <div className="text-gray-900">{msg.name}</div>
                                        <div className="text-xs text-gray-400 font-normal">{msg.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-800 max-w-xs truncate">{msg.subject}</td>
                                    <td className="p-4 text-xs text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleRead(msg)}
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                msg.status === "unread" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {msg.status}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right space-x-3">
                                        <button onClick={() => setSelectedMsg(msg)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                            View
                                        </button>
                                        <button onClick={() => handleDelete(msg)} className="text-red-600 hover:text-red-800 font-medium text-xs">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Read Message View Modal */}
            {selectedMsg && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
                        <div className="flex justify-between items-start border-b pb-3">
                            <div>
                                <h3 className="font-bold text-gray-900">{selectedMsg.subject}</h3>
                                <p className="text-xs text-gray-500">From: {selectedMsg.name} ({selectedMsg.email})</p>
                            </div>
                            <button onClick={() => setSelectedMsg(null)} className="text-gray-400 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedMsg.message}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button onClick={() => setSelectedMsg(null)} className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactMessages;