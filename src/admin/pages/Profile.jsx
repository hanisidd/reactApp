import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfileApi } from "../services/auth";
import toast from "react-hot-toast";

function Profile() {
    const { admin, setAdmin } = useAuth();

    const [form, setForm] = useState({
        name: admin?.name || "",
        email: admin?.email || "",
        password: "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(admin?.avatar_url || null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        if (form.password) {
            formData.append("password", form.password);
        }
        if (avatarFile) {
            formData.append("avatar", avatarFile);
        }

        try {
            setSaving(true);
            const data = await updateProfileApi(formData);
            
            // Sync AuthContext so Navbar updates avatar instantly
            setAdmin(data.admin);
            
            toast.success("Profile updated successfully!");
            setForm((prev) => ({ ...prev, password: "" }));
            setErrors({});
        } catch (error) {
            if (error?.errors) {
                setErrors(error.errors);
            } else {
                toast.error(error?.message || "Failed to update profile");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your personal account details and profile photo
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                        <div className="relative">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold uppercase">
                                    {form.name?.charAt(0) || "A"}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Photo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            {errors.avatar && (
                                <p className="text-red-500 text-xs mt-1">{errors.avatar[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password (Optional)
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm transition shadow-sm disabled:opacity-50"
                        >
                            {saving ? "Saving Changes..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;