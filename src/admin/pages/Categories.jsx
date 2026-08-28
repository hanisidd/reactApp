import { useEffect, useState } from "react";
import {
    getCategoriesApi,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
} from "../services/categories";
import { useDataTable } from "../hooks/useDataTable";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Initialize DataTable Hook (Searchable keys: 'name', 'description', 5 items per page)
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
    } = useDataTable(categories, ["name", "description"], 5);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategoriesApi();
            setCategories(data.categories);
        } catch (err) {
            toast.error(err.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = "Category name is required";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSaving(true);
            if (editingCategory) {
                const data = await updateCategoryApi(editingCategory.id, formData);
                setCategories((prev) =>
                    prev.map((c) => (c.id === editingCategory.id ? data.category : c))
                );
                toast.success("Category updated successfully");
            } else {
                const data = await createCategoryApi(formData);
                setCategories((prev) => [data.category, ...prev]);
                toast.success("Category created successfully");
            }
            closeModal();
        } catch (err) {
            toast.error(err.message || "Operation failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const result = await Swal.fire({
            title: "Delete Category?",
            text: `Are you sure you want to delete "${category.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteCategoryApi(category.id);
            setCategories((prev) => prev.filter((c) => c.id !== category.id));
            toast.success("Category deleted successfully");
        } catch (err) {
            toast.error(err.message || "Could not delete category");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Input Box */}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
                    />

                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                    >
                        + Add Category
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {/* Sortable Header: Name */}
                            <th
                                onClick={() => handleSort("name")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Name {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            {/* Sortable Header: Description */}
                            <th
                                onClick={() => handleSort("description")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Description {sortConfig.key === "description" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-6 text-gray-500">
                                    No matching categories found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {category.description || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEditModal(category)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category)}
                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={5}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingCategory ? "Edit Category" : "Add Category"}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="e.g. Electronics"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Optional details..."
                                ></textarea>
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
                                    {saving
                                        ? "Saving..."
                                        : editingCategory
                                        ? "Update Category"
                                        : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Categories;