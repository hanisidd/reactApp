import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import StoreNavbar from "../components/StoreNavbar";
import StoreFooter from "../components/StoreFooter";
import toast from "react-hot-toast";
import { UserIcon } from "@heroicons/react/24/outline";

function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateProfile, logout } = useUserAuth();
    const [publicSettings, setPublicSettings] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        setForm({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            password: "",
        });
        setPreviewUrl(user.avatar_url || null);

        fetch("http://localhost:8000/api/store/public-settings")
            .then((res) => res.json())
            .then(setPublicSettings)
            .catch(() => {});
    }, [user, navigate]);

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
        } catch (err) {
            toast.error(err?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar publicSettings={publicSettings} />
            <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
                        <p className="text-xs text-gray-500 mt-1">Manage your personal info and shipping address</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Photo Upload */}
                        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-md">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || <UserIcon className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Profile Avatar</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold"
                                />
                            </div>
                        </div>

                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">New Password (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep current password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Default Shipping Address</label>
                            <textarea
                                rows="3"
                                placeholder="House / Office details, Street address..."
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600"
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {loading ? "Saving Changes..." : "Save Profile"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}

export default ProfilePage;