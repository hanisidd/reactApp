import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import toast from "react-hot-toast";

function RegisterPage() {
    const navigate = useNavigate();
    const { register, user } = useUserAuth();
    const [publicSettings, setPublicSettings] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
    const [loading, setLoading] = useState(false);

useEffect(() => {
    if (user) {
        navigate("/", { replace: true });
        return;
    }
    fetch("http://localhost:8000/api/public-settings")
        .then((res) => res.json())
        .then(setPublicSettings)
        .catch(() => {});
}, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await register(form);
            toast.success("Account created successfully!");
            navigate("/");
        } catch (err) {
            toast.error(err?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />
            <main className="flex-1 flex items-center justify-center p-6 py-12">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-gray-900">Create Customer Account</h1>
                        <p className="text-xs text-gray-500 mt-1">Join to track orders and download purchases anytime</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                required
                                placeholder="user@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                placeholder="03001234567"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-2"
                        >
                            {loading ? "Creating Account..." : "Register"}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-xs text-gray-500">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-blue-600 hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}

export default RegisterPage;