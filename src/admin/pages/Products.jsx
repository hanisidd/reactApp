import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

import {
    getProductsApi,
    createProductApi,
    updateProductApi,
    toggleProductStatusApi,
    deleteProductApi,
} from "../services/products";
import { getCategoriesApi } from "../services/categories";
import { useDataTable } from "../hooks/useDataTable";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        type: "digital", // Default to digital
        category_id: "",
        title: "",
        description: "",
        price: "",
        quantity: "",
        status: "active",
    });

    const [digitalFile, setDigitalFile] = useState(null);
    const [imageItems, setImageItems] = useState([]);
    const [errors, setErrors] = useState({});

    const dragItem = useRef(null);

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
    } = useDataTable(products, ["title", "type", "price", "status", "file_original_name"], 5);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [productRes, categoryRes] = await Promise.all([
                getProductsApi(),
                getCategoriesApi(),
            ]);
            setProducts(productRes.products);
            setCategories(categoryRes.categories);
        } catch (err) {
            toast.error(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }));

    const openAddModal = () => {
        setEditingProduct(null);
        setForm({
            type: "digital",
            category_id: "",
            title: "",
            description: "",
            price: "",
            quantity: "",
            status: "active",
        });
        setDigitalFile(null);
        setImageItems([]);
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            type: product.type || "digital",
            category_id: product.category_id,
            title: product.title,
            description: product.description || "",
            price: product.price,
            quantity: product.quantity,
            status: product.status,
        });

        setDigitalFile(null);

        const sortedImages = [...(product.images || [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );

        const existingImages = sortedImages.map((img) => ({
            id: img.id,
            url: img.image_url,
            file: null,
            isCover: img.is_cover,
        }));

        setImageItems(existingImages);
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDigitalFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSizeBytes = 50 * 1024 * 1024;
        const allowedExtensions = ["zip", "pdf", "txt", "epub", "doc", "docx", "rar"];
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            toast.error(`Invalid file type. Allowed: .${allowedExtensions.join(", .")}`);
            e.target.value = "";
            return;
        }

        if (file.size > maxSizeBytes) {
            toast.error("File size exceeds maximum limit of 50MB.");
            e.target.value = "";
            return;
        }

        setDigitalFile(file);
        setErrors((prev) => ({ ...prev, digital_file: "" }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (imageItems.length + files.length > 15) {
            toast.error("Maximum 15 images allowed.");
            return;
        }

        const newItems = files.map((file, idx) => ({
            id: `new-${Date.now()}-${idx}`,
            url: URL.createObjectURL(file),
            file: file,
            isCover: imageItems.length === 0 && idx === 0,
        }));

        setImageItems((prev) => [...prev, ...newItems]);
    };

    const handleSetCover = (targetId) => {
        setImageItems((prev) =>
            prev.map((item) => ({
                ...item,
                isCover: item.id === targetId,
            }))
        );
    };

    const handleRemoveImage = (targetId) => {
        setImageItems((prev) => {
            const filtered = prev.filter((item) => item.id !== targetId);
            if (filtered.length > 0 && !filtered.some((i) => i.isCover)) {
                filtered[0].isCover = true;
            }
            return filtered;
        });
    };

    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const dragIndex = dragItem.current;
        if (dragIndex === null || dragIndex === targetIndex) return;

        const updatedList = [...imageItems];
        const [movedItem] = updatedList.splice(dragIndex, 1);
        updatedList.splice(targetIndex, 0, movedItem);

        dragItem.current = null;
        setImageItems(updatedList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("type", form.type);
        formData.append("category_id", form.category_id);
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("price", form.price);
        formData.append("quantity", form.quantity);
        formData.append("status", form.status);

        if (form.type === "digital" && digitalFile) {
            formData.append("digital_file", digitalFile);
        }

        const coverIdx = imageItems.findIndex((item) => item.isCover);
        formData.append("cover_index", coverIdx >= 0 ? coverIdx : 0);

        imageItems.forEach((item) => {
            if (item.file) {
                formData.append("images[]", item.file);
            } else {
                formData.append("retained_image_ids[]", item.id);
            }
        });

        const coverItem = imageItems.find((item) => item.isCover);
        if (coverItem && !coverItem.file) {
            formData.append("cover_image_id", coverItem.id);
        }

        try {
            setSaving(true);
            let data;
            if (editingProduct) {
                data = await updateProductApi(editingProduct.id, formData);
                setProducts((prev) =>
                    prev.map((p) => (p.id === editingProduct.id ? data.product : p))
                );
                toast.success("Product updated successfully");
            } else {
                data = await createProductApi(formData);
                setProducts((prev) => [data.product, ...prev]);
                toast.success("Product created successfully");
            }
            closeModal();
        } catch (err) {
            if (err?.errors) {
                setErrors(err.errors);
            } else {
                toast.error(err?.message || "Operation failed");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            const data = await toggleProductStatusApi(product.id);
            setProducts((prev) =>
                prev.map((p) => (p.id === product.id ? data.product : p))
            );
            toast.success(data.message);
        } catch (err) {
            toast.error(err.message || "Failed to update status");
        }
    };

    const handleDelete = async (product) => {
        const result = await Swal.fire({
            title: "Delete Product?",
            text: `Are you sure you want to delete "${product.title}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteProductApi(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            toast.success("Product deleted successfully");
        } catch (err) {
            toast.error(err.message || "Could not delete product");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage physical & digital inventory, images, and files</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
                    />
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cover</th>
                            <th
                                onClick={() => handleSort("title")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Title {sortConfig.key === "title" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("type")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Type {sortConfig.key === "type" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                            <th
                                onClick={() => handleSort("price")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Price {sortConfig.key === "price" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("status")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Digital File</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-6 text-gray-500">
                                    No matching products found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((product) => {
                                const cover = product.images?.find((img) => img.is_cover) || product.images?.[0];
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {cover?.image_url ? (
                                                <img
                                                    src={cover.image_url}
                                                    alt={product.title}
                                                    className="w-12 h-12 object-cover rounded-md border border-gray-200 cursor-pointer"
                                                    onClick={() => setViewingProduct(product)}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                                    No image
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <button
                                                onClick={() => setViewingProduct(product)}
                                                className="hover:text-blue-600 text-left font-semibold transition"
                                            >
                                                {product.title}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                                                    product.type === "digital"
                                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                                }`}
                                            >
                                                {product.type || "digital"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{product.category?.name || "N/A"}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${parseFloat(product.price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(product)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize cursor-pointer transition ${
                                                    product.status === "active"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                        : "bg-red-100 text-red-800 hover:bg-red-200"
                                                }`}
                                            >
                                                {product.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs">
                                            {product.type === "physical" ? (
                                                <span className="text-gray-400 font-medium">N/A (Physical)</span>
                                            ) : product.file_original_name ? (
                                                <div>
                                                    <span className="font-semibold text-gray-800 block truncate max-w-[180px]">
                                                        {product.file_original_name}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        ({product.formatted_file_size})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-red-500 font-medium">No File</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setViewingProduct(product)}
                                                className="text-gray-600 hover:text-gray-900 font-medium text-sm mr-3"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                                            >
                                                Delete
                                            </button>
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

            {/* Read-Only Details Modal */}
            {viewingProduct && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {viewingProduct.category?.name || "Uncategorized"}
                                    </span>
                                    <span
                                        className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                                            viewingProduct.type === "digital"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-blue-100 text-blue-800"
                                        }`}
                                    >
                                        {viewingProduct.type || "digital"}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mt-1">{viewingProduct.title}</h2>
                            </div>
                            <button
                                onClick={() => setViewingProduct(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">Price</p>
                                <p className="text-lg font-bold text-gray-900">${parseFloat(viewingProduct.price).toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">Available Stock</p>
                                <p className="text-lg font-bold text-gray-900">{viewingProduct.quantity}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 font-medium">Status</p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize mt-1 ${
                                        viewingProduct.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {viewingProduct.status}
                                </span>
                            </div>
                        </div>

                        {/* Digital Product Download Box - Only if Digital */}
                        {viewingProduct.type === "digital" && (
                            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-lg mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-blue-900">Digital Product Attachment</p>
                                    {viewingProduct.file_original_name ? (
                                        <p className="text-sm font-medium text-gray-800 mt-0.5">
                                            {viewingProduct.file_original_name}{" "}
                                            <span className="text-xs text-gray-500">({viewingProduct.formatted_file_size})</span>
                                        </p>
                                    ) : (
                                        <p className="text-xs text-red-500 mt-0.5">No file attached</p>
                                    )}
                                </div>
                                {viewingProduct.file_url && (
                                    <a
                                        href={viewingProduct.file_url}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition shadow-sm"
                                    >
                                        Download File
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                            <div
                                className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: viewingProduct.description || "<em>No description provided.</em>",
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                Preview Gallery ({viewingProduct.images?.length || 0})
                            </h3>
                            {viewingProduct.images?.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {viewingProduct.images.map((img) => (
                                        <div key={img.id} className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                            <img src={img.image_url} alt="Product" className="w-full h-24 object-cover" />
                                            {img.is_cover && (
                                                <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                                    COVER
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No images uploaded.</p>
                            )}
                        </div>
                        <div className="flex justify-end pt-5 border-t border-gray-100 mt-6">
                            <button
                                onClick={() => setViewingProduct(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-md transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingProduct ? "Edit Product" : "Add Product"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Product Type Switcher */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Product Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, type: "digital" }))}
                                        className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${
                                            form.type === "digital"
                                                ? "bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-100 font-semibold"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span>💾 Digital Product</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, type: "physical" }))}
                                        className={`p-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition ${
                                            form.type === "physical"
                                                ? "bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100 font-semibold"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span>📦 Physical Product</span>
                                    </button>
                                </div>
                            </div>

                            {/* Digital File Selection - Only when Type is Digital */}
                            {form.type === "digital" && (
                                <div className="bg-purple-50/50 p-4 border border-purple-100 rounded-lg">
                                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                                        Digital Product File
                                    </label>

                                    {editingProduct && editingProduct.file_original_name && (
                                        <p className="text-xs text-gray-600 mb-2">
                                            Current file: <span className="font-semibold text-purple-700">{editingProduct.file_original_name}</span> ({editingProduct.formatted_file_size})
                                        </p>
                                    )}

                                    <input
                                        type="file"
                                        accept=".zip,.pdf,.txt,.epub,.doc,.docx,.rar"
                                        onChange={handleDigitalFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                                    />

                                    <span className="text-xs text-gray-500 block mt-1">
                                        Allowed formats: .zip, .pdf, .txt, .epub, .doc, .docx, .rar | Max size: 50MB
                                    </span>

                                    {errors.digital_file && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.digital_file[0] || errors.digital_file}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <Select
                                    options={categoryOptions}
                                    value={categoryOptions.find((opt) => String(opt.value) === String(form.category_id)) || null}
                                    onChange={(selected) => {
                                        setForm((prev) => ({ ...prev, category_id: selected ? selected.value : "" }));
                                        setErrors((prev) => ({ ...prev, category_id: "" }));
                                    }}
                                    placeholder="Search and select a category..."
                                    isSearchable
                                    className="text-sm"
                                />
                                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0] || errors.category_id}</p>}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="e.g. Wireless Headphones or Master React E-Book"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0] || errors.title}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                                    <ReactQuill
                                        theme="snow"
                                        value={form.description}
                                        onChange={(content) => setForm((prev) => ({ ...prev, description: content }))}
                                        placeholder="Add product highlights and details..."
                                    />
                                </div>
                            </div>

                            {/* Price & Quantity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0] || errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {form.type === "digital" ? "Available Downloads / Stock" : "Inventory Stock Quantity"}
                                    </label>
                                    <input
                                        type="number"
                                        value={form.quantity}
                                        onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="100"
                                    />
                                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity[0] || errors.quantity}</p>}
                                </div>
                            </div>

                            {/* Product Preview Images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Product Preview Images (Up to 15)</label>
                                    <span className="text-xs text-gray-500">Drag cards to reorder | Click image to set as Cover</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    disabled={imageItems.length >= 15}
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                                />
                                {imageItems.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                        {imageItems.map((item, index) => (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onClick={() => handleSetCover(item.id)}
                                                className={`relative group cursor-grab rounded-lg border-2 overflow-hidden bg-gray-50 p-1 transition select-none ${
                                                    item.isCover ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"
                                                }`}
                                            >
                                                <img src={item.url} alt="Preview" className="w-full h-24 object-cover rounded pointer-events-none" />
                                                {item.isCover && (
                                                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                                        COVER
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(item.id);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white py-2">
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
                                    {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;