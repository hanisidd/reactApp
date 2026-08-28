import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";

import { getEmailTemplateApi, updateEmailTemplateApi } from "../services/settings";
import Loader from "../components/Loader";

function Settings() {
    const [activeTab, setActiveTab] = useState("email"); // Future-proof tab system
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        subject: "",
        body: "",
    });
    const [errors, setErrors] = useState({});

    // Available dynamic variables for insertion
    const templateVariables = [
        { tag: "{customer_name}", description: "Customer's full name" },
        { tag: "{product_name}", description: "Purchased product title" },
        { tag: "{order_id}", description: "Order ID number" },
    ];

    useEffect(() => {
        fetchEmailTemplate();
    }, []);

    const fetchEmailTemplate = async () => {
        try {
            setLoading(true);
            const data = await getEmailTemplateApi();
            setForm({
                subject: data.subject || "",
                body: data.body || "",
            });
        } catch (err) {
            toast.error(err.message || "Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleTagClick = (tag) => {
        // Appends selected tag into the email body
        setForm((prev) => ({
            ...prev,
            body: prev.body + " " + tag,
        }));
        toast.success(`Inserted ${tag}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!form.subject.trim()) {
            setErrors({ subject: "Email subject is required" });
            return;
        }

        try {
            setSaving(true);
            const data = await updateEmailTemplateApi(form);
            toast.success(data.message || "Email template saved successfully");
        } catch (err) {
            if (err?.errors) {
                setErrors(err.errors);
            } else {
                toast.error(err?.message || "Failed to save settings");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure store preferences and automated email notifications
                </p>
            </div>

            {/* Tab Navigation Bar */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
                <button
                    onClick={() => setActiveTab("email")}
                    className={`py-3 px-5 font-medium text-sm border-b-2 transition ${
                        activeTab === "email"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Email Format
                </button>
            </div>

            {/* Email Format Tab Content */}
            {activeTab === "email" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">
                            Digital Product Delivery Email
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            This email is automatically dispatched to customers upon successful purchase of a digital product.
                        </p>
                    </div>

                    {/* Template Tags Info Panel */}
                    <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 mb-6">
                        <p className="text-xs font-semibold text-blue-900 mb-2">
                            Available Dynamic Variables (Click to append):
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {templateVariables.map((item) => (
                                <button
                                    key={item.tag}
                                    type="button"
                                    onClick={() => handleTagClick(item.tag)}
                                    className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded text-xs font-mono font-medium transition shadow-sm flex items-center gap-1.5"
                                    title={item.description}
                                >
                                    <span>{item.tag}</span>
                                    <span className="text-[10px] text-gray-400 font-sans">({item.description})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Subject Line
                            </label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                placeholder="e.g. Your Digital Product Purchase - {product_name}"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            {errors.subject && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.subject[0] || errors.subject}
                                </p>
                            )}
                        </div>

                        {/* Email Body Rich Text Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Body Content
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={form.body}
                                    onChange={(content) => setForm({ ...form, body: content })}
                                    placeholder="Write your email body HTML template..."
                                />
                            </div>
                            {errors.body && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.body[0] || errors.body}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition shadow-sm disabled:opacity-50"
                            >
                                {saving ? "Saving Template..." : "Save Email Template"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Settings;