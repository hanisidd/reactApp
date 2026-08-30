import { useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import toast from "react-hot-toast";

export function LoginRegisterModal({ onClose }) {
    const { login, register } = useUserAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isRegister) {
                await register(form);
                toast.success("Account created successfully!");
            } else {
                await login({ email: form.email, password: form.password });
                toast.success("Welcome back!");
            }
            onClose();
        } catch (err) {
            toast.error(err?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900">
                        {isRegister ? "Create Customer Account" : "Sign In to Store"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
                    >
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 mt-2"
                    >
                        {loading ? "Please wait..." : isRegister ? "Register Account" : "Sign In"}
                    </button>
                </form>
                <div className="mt-6 text-center border-t border-gray-100 pt-4">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                        {isRegister ? "Already have an account? Sign In" : "Don't have an account? Create one"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CustomerProfileModal({ onClose }) {
    const { user, updateProfile } = useUserAuth();
    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        password: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("phone", form.phone || "");
            formData.append("address", form.address || "");
            if (form.password) formData.append("password", form.password);
            if (avatarFile) formData.append("avatar", avatarFile);

            await updateProfile(formData);
            toast.success("Profile updated successfully!");
            onClose();
        } catch (err) {
            toast.error(err?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900">Update Account Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                form.name?.charAt(0) || "U"
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Profile Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Default Shipping Address</label>
                        <textarea
                            rows="2"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-600"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">New Password (Optional)</label>
                        <input
                            type="password"
                            placeholder="Leave empty to keep unchanged"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-600"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}