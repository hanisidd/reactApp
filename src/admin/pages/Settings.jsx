import { useEffect, useState } from "react";
import {
    BuildingStorefrontIcon,
    BanknotesIcon,
    TicketIcon,
    ShareIcon,
    EnvelopeIcon,
    InformationCircleIcon,
    TrashIcon,
    PencilSquareIcon,
    PlusIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Save } from "lucide-react";
import EmailTemplatesTab from "../components/EmailTemplatesTab";

const TEMPLATE_TYPES = [
    { value: "digital_delivery", label: "Digital Product Delivery Email", subjectKey: "digital_email_subject", bodyKey: "digital_email_body" },
    { value: "order_confirmation", label: "Order Confirmation Email", subjectKey: "order_confirmation_subject", bodyKey: "order_confirmation_body" },
    { value: "order_preparing", label: "Order Preparing Status Email", subjectKey: "order_preparing_subject", bodyKey: "order_preparing_body" },
    { value: "order_delivered", label: "Order Delivered Status Email", subjectKey: "order_delivered_subject", bodyKey: "order_delivered_body" },
];
const BASE_URL = "http://localhost:8000/api/admin";

function Settings() {

    const [selectedTemplateType, setSelectedTemplateType] = useState("digital_delivery");
    const [savingTemplate, setSavingTemplate] = useState(false);

    const activeTemplate = TEMPLATE_TYPES.find((t) => t.value === selectedTemplateType);

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            setSavingTemplate(true);
            const payload = {
                [activeTemplate.subjectKey]: form[activeTemplate.subjectKey] || "",
                [activeTemplate.bodyKey]: form[activeTemplate.bodyKey] || "",
            };
            const res = await fetch(`${BASE_URL}/settings`, {
                method: "POST",
                headers: { ...getHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save template");
            toast.success(`${activeTemplate.label} updated successfully!`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSavingTemplate(false);
        }
    };
    const [activeTab, setActiveTab] = useState("branding");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        brand_name: "",
        hero_heading: "",
        hero_text: "",
        tax_percentage: "5",
        delivery_fee: "250",
        footer_phone: "",
        footer_email: "",
        footer_address: "",
        footer_whatsapp: "",
        footer_instagram: "",
        footer_facebook: "",
        footer_about: "",
        // About Us Tab
        about_heading: "",
        about_description: "",
        about_f1_title: "",
        about_f1_desc: "",
        about_f2_title: "",
        about_f2_desc: "",
        about_f3_title: "",
        about_f3_desc: "",
        // Email Templates Tab
        digital_email_subject: "",
        digital_email_body: "",
        order_confirmation_subject: "",
        order_confirmation_body: "",
        order_preparing_subject: "",
        order_preparing_body: "",
        order_delivered_subject: "",
        order_delivered_body: "",
    });

    const [logoFile, setLogoFile] = useState(null);
    const [heroFile, setHeroFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);

    const [promos, setPromos] = useState([]);
    const [promoModalOpen, setPromoModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [promoForm, setPromoForm] = useState({ code: "", type: "percentage", value: "", expires_at: "", status: "active" });

    useEffect(() => {
        fetchSettingsAndPromos();
    }, []);

    const getHeaders = () => ({
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
        "Accept": "application/json",
    });

    const fetchSettingsAndPromos = async () => {
        try {
            setLoading(true);
            const [setRes, promoRes] = await Promise.all([
                fetch(`${BASE_URL}/settings`, { headers: getHeaders() }),
                fetch(`${BASE_URL}/promos`, { headers: getHeaders() }),
            ]);
            const setData = await setRes.json();
            const promoData = await promoRes.json();

            if (setData.settings) {
                setForm((prev) => ({ ...prev, ...setData.settings }));
                if (setData.settings.logo_url) setLogoPreview(setData.settings.logo_url);
                if (setData.settings.hero_image_url) setHeroPreview(setData.settings.hero_image_url);
            }
            if (promoData.promos) setPromos(promoData.promos);
        } catch (err) {
            toast.error("Failed to load settings data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();
            Object.keys(form).forEach((key) => formData.append(key, form[key]));
            if (logoFile) formData.append("logo", logoFile);
            if (heroFile) formData.append("hero_image", heroFile);

            const res = await fetch(`${BASE_URL}/settings`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to save settings");
            toast.success("Settings updated successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePromo = async (e) => {
        e.preventDefault();
        try {
            const url = editingPromo ? `${BASE_URL}/promos/${editingPromo.id}` : `${BASE_URL}/promos`;
            const method = editingPromo ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { ...getHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify(promoForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Operation failed");
            toast.success(editingPromo ? "Promo updated!" : "Promo added!");
            setPromoModalOpen(false);
            fetchSettingsAndPromos();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeletePromo = async (id) => {
        if (!window.confirm("Delete promo code?")) return;
        try {
            await fetch(`${BASE_URL}/promos/${id}`, { method: "DELETE", headers: getHeaders() });
            toast.success("Promo code deleted");
            setPromos((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Store Configuration</h1>

            <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("branding")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${activeTab === "branding" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <BuildingStorefrontIcon className="w-4 h-4" /> Branding & Hero
                </button>
                <button
                    onClick={() => setActiveTab("about")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${activeTab === "about" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <InformationCircleIcon className="w-4 h-4" /> About Us Content
                </button>
                <button
                    onClick={() => setActiveTab("emails")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${activeTab === "emails" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <EnvelopeIcon className="w-4 h-4" /> Email Templates
                </button>
                <button
                    onClick={() => setActiveTab("finance")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${activeTab === "finance" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <BanknotesIcon className="w-4 h-4" /> Delivery & Tax
                </button>
                <button
                    onClick={() => setActiveTab("promos")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${activeTab === "promos" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <TicketIcon className="w-4 h-4" /> Promo Codes
                </button>
                <button
                    onClick={() => setActiveTab("footer")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${activeTab === "footer" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <ShareIcon className="w-4 h-4" /> Footer & Social
                </button>
            </div>

            {/* Tab: Branding */}
            {activeTab === "branding" && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Brand Name</label>
                            <input
                                type="text"
                                value={form.brand_name}
                                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Store Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setLogoFile(e.target.files[0]);
                                    setLogoPreview(URL.createObjectURL(e.target.files[0]));
                                }}
                                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700"
                            />
                            {logoPreview && <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain mt-2 border rounded-md p-1" />}
                        </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hero Banner Configuration</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hero Heading</label>
                            <input
                                type="text"
                                value={form.hero_heading}
                                onChange={(e) => setForm({ ...form, hero_heading: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hero Subtitle</label>
                            <textarea
                                rows="2"
                                value={form.hero_text}
                                onChange={(e) => setForm({ ...form, hero_text: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Hero Banner Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setHeroFile(e.target.files[0]);
                                    setHeroPreview(URL.createObjectURL(e.target.files[0]));
                                }}
                                className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700"
                            />
                            {heroPreview && <img src={heroPreview} alt="Hero" className="w-32 h-20 object-cover mt-2 border rounded-md" />}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition">
                            {saving ? "Saving..." : "Save Branding Settings"}
                        </button>
                    </div>
                </form>
            )}

            {/* Tab: About Us Data */}
            {activeTab === "about" && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Us Page Customization</h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Main Heading</label>
                        <input
                            type="text"
                            value={form.about_heading}
                            onChange={(e) => setForm({ ...form, about_heading: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Page Description Paragraph</label>
                        <textarea
                            rows="3"
                            value={form.about_description}
                            onChange={(e) => setForm({ ...form, about_description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-blue-600">Feature Card 1 Title</label>
                            <input
                                type="text"
                                value={form.about_f1_title}
                                onChange={(e) => setForm({ ...form, about_f1_title: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs"
                            />
                            <textarea
                                rows="2"
                                value={form.about_f1_desc}
                                onChange={(e) => setForm({ ...form, about_f1_desc: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-purple-600">Feature Card 2 Title</label>
                            <input
                                type="text"
                                value={form.about_f2_title}
                                onChange={(e) => setForm({ ...form, about_f2_title: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs"
                            />
                            <textarea
                                rows="2"
                                value={form.about_f2_desc}
                                onChange={(e) => setForm({ ...form, about_f2_desc: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-emerald-600">Feature Card 3 Title</label>
                            <input
                                type="text"
                                value={form.about_f3_title}
                                onChange={(e) => setForm({ ...form, about_f3_title: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs"
                            />
                            <textarea
                                rows="2"
                                value={form.about_f3_desc}
                                onChange={(e) => setForm({ ...form, about_f3_desc: e.target.value })}
                                className="w-full border rounded-lg p-2 text-xs"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition">
                            {saving ? "Saving..." : "Save About Us Content"}
                        </button>
                    </div>
                </form>
            )}

            {/* Tab: Email Templates */}
            {activeTab === "emails" && (
                <EmailTemplatesTab form={form} setForm={setForm} getHeaders={getHeaders} />
            )}

            {/* Tab: Delivery & Tax */}
            {activeTab === "finance" && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Fee (PKR)</label>
                            <input
                                type="number"
                                step="1"
                                value={form.delivery_fee}
                                onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tax Percentage (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.tax_percentage}
                                onChange={(e) => setForm({ ...form, tax_percentage: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition">
                            {saving ? "Saving..." : "Save Delivery & Tax Settings"}
                        </button>
                    </div>
                </form>
            )}

            {/* Tab: Promo Codes */}
            {activeTab === "promos" && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-800">Active Coupons</h2>
                        <button
                            onClick={() => {
                                setEditingPromo(null);
                                setPromoForm({ code: "", type: "percentage", value: "", expires_at: "", status: "active" });
                                setPromoModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
                        >
                            <PlusIcon className="w-4 h-4" /> Add Promo Code
                        </button>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase border-b">
                            <tr>
                                <th className="p-3">Code</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Value</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {promos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-400">No promo codes found.</td>
                                </tr>
                            ) : (
                                promos.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono font-bold text-blue-600">{p.code}</td>
                                        <td className="p-3 uppercase text-xs font-semibold">{p.type}</td>
                                        <td className="p-3 font-bold">{p.type === "percentage" ? `${p.value}%` : `PKR ${p.value}`}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => {
                                                    setEditingPromo(p);
                                                    setPromoForm({ code: p.code, type: p.type, value: p.value, expires_at: p.expires_at || "", status: p.status });
                                                    setPromoModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                                <PencilSquareIcon className="w-5 h-5 inline" />
                                            </button>
                                            <button onClick={() => handleDeletePromo(p.id)} className="text-red-600 hover:text-red-800">
                                                <TrashIcon className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Footer Data */}
            {activeTab === "footer" && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Support Phone</label>
                            <input
                                type="text"
                                value={form.footer_phone}
                                onChange={(e) => setForm({ ...form, footer_phone: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Support Email</label>
                            <input
                                type="email"
                                value={form.footer_email}
                                onChange={(e) => setForm({ ...form, footer_email: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Store Address</label>
                            <input
                                type="text"
                                value={form.footer_address}
                                onChange={(e) => setForm({ ...form, footer_address: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number</label>
                            <input
                                type="text"
                                value={form.footer_whatsapp}
                                onChange={(e) => setForm({ ...form, footer_whatsapp: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Footer About Text</label>
                        <textarea
                            rows="2"
                            value={form.footer_about}
                            onChange={(e) => setForm({ ...form, footer_about: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                        ></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition">
                            {saving ? "Saving..." : "Save Footer Settings"}
                        </button>
                    </div>
                </form>
            )}

            {/* Promo Code Modal */}
            {promoModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editingPromo ? "Edit Promo Code" : "Add Promo Code"}</h3>
                        <form onSubmit={handleSavePromo} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                                <input
                                    type="text"
                                    required
                                    value={promoForm.code}
                                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                                    className="w-full border rounded-lg p-2 text-sm uppercase"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                                    <select
                                        value={promoForm.type}
                                        onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                                        className="w-full border rounded-lg p-2 text-sm bg-white"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (PKR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        value={promoForm.value}
                                        onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
                                        className="w-full border rounded-lg p-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setPromoModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;