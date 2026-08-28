import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "../services/admins";
import { useDataTable } from "../hooks/useDataTable";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

function Admins() {
    const { admin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

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
    } = useDataTable(admins, ["name", "email"], 5);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getAdmins();
            setAdmins(data.admins);
        } catch (error) {
            toast.error(error.message || "Failed to load admins");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const openAddModal = () => {
        setEditingAdmin(null);
        setForm({ name: "", email: "", password: "" });
        setErrors({});
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingAdmin(item);
        setForm({ name: item.name, email: item.email, password: "" });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAdmin(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};
        if (!form.name) validationErrors.name = "Name is required";
        if (!form.email) validationErrors.email = "Email is required";
        if (!editingAdmin && !form.password) validationErrors.password = "Password is required";
        if (form.password && form.password.length < 6) {
            validationErrors.password = "Password must have at least 6 characters";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSaving(true);
            let data;
            if (editingAdmin) {
                data = await updateAdmin(editingAdmin.id, form);
                setAdmins((prev) =>
                    prev.map((item) => (item.id === editingAdmin.id ? data.admin : item))
                );
            } else {
                data = await createAdmin(form);
                setAdmins((prev) => [data.admin, ...prev]);
            }
            toast.success(data.message);
            closeModal();
        } catch (error) {
            if (error.data?.errors) {
                setErrors(error.data.errors);
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (targetAdmin) => {
        const result = await Swal.fire({
            title: "Delete admin?",
            text: `Are you sure you want to delete ${targetAdmin.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const data = await deleteAdmin(targetAdmin.id);
            setAdmins((prev) => prev.filter((item) => item.id !== targetAdmin.id));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.data?.message || "Something went wrong");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admins</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage administrator accounts</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search admins..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
                    />
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                    >
                        + Add Admin
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                            <th
                                onClick={() => handleSort("name")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Name {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("email")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Email {sortConfig.key === "email" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-6 text-gray-500">
                                    No matching admins found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, index) => {
                                const isCurrentAdmin = item.id === admin?.id;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">
                                            {(currentPage - 1) * 5 + index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            {isCurrentAdmin ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Logged in
                                                </span>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingAdmin ? "Edit Admin" : "Add Admin"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Full name"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="admin@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder={editingAdmin ? "Leave blank to keep current" : "Minimum 6 characters"}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : editingAdmin ? "Update Admin" : "Add Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admins;