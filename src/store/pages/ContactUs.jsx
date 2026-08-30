import { useEffect, useState } from "react";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import toast from "react-hot-toast";

function ContactUs() {
    const [publicSettings, setPublicSettings] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8000/api/store/public-settings")
            .then((res) => res.json())
            .then(setPublicSettings)
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await fetch("http://localhost:8000/api/store/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to send message");

            toast.success(data.message);
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />
            <main className="max-w-6xl mx-auto px-6 py-16 flex-1 w-full space-y-12">
                <div className="text-center space-y-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Get In Touch
                    </span>
                    <h1 className="text-4xl font-black text-gray-900">Contact Us</h1>
                    <p className="text-gray-500 text-sm">Have a question or feedback? Send us a message directly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Your Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50"
                            >
                                {submitting ? "Sending..." : "Submit Message"}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6 flex flex-col justify-between">
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <p><strong>Address:</strong> {publicSettings?.footer_address || "Lahore, Punjab, Pakistan"}</p>
                                <p><strong>Email:</strong> {publicSettings?.footer_email || "support@store.pk"}</p>
                                <p><strong>Phone:</strong> {publicSettings?.footer_phone || "+92 300 0000000"}</p>
                                {publicSettings?.footer_whatsapp && (
                                    <p><strong>WhatsApp:</strong> +{publicSettings.footer_whatsapp}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}

export default ContactUs;