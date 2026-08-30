import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    FunnelIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import StoreNavbar from "../components/StoreNavbar";
import ProductCard from "../components/ProductCard";
import StoreFooter from "../components/StoreFooter";

const BASE_URL = "http://localhost:8000/api/store";

function ProductsCatalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get("category_id") || "";

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publicSettings, setPublicSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [typeFilter, setTypeFilter] = useState("all");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        fetch(`${BASE_URL}/public-settings`).then((r) => r.json()).then(setPublicSettings);
        fetch(`${BASE_URL}/categories`).then((r) => r.json()).then((d) => setCategories(d.categories || []));
    }, []);

    useEffect(() => {
        setSelectedCategory(categoryParam);
    }, [categoryParam]);

    useEffect(() => {
        fetchCatalogProducts();
    }, [currentPage, selectedCategory, typeFilter, sortBy]);

    const fetchCatalogProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: 12,
                sort: sortBy,
                type: typeFilter,
                ...(selectedCategory && { category_id: selectedCategory }),
                ...(search && { search }),
                ...(minPrice && { min_price: minPrice }),
                ...(maxPrice && { max_price: maxPrice }),
            });
            const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
            const data = await res.json();
            setProducts(data.data || []);
            setTotalPages(data.last_page || 1);
            setTotalResults(data.total || 0);
        } catch (err) {
            console.error("Catalog fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        const catId = e.target.value;
        setSelectedCategory(catId);
        if (catId) {
            setSearchParams({ category_id: catId });
        } else {
            setSearchParams({});
        }
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCatalogProducts();
    };

    const handleClearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setTypeFilter("all");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("newest");
        setCurrentPage(1);
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <StoreNavbar
                publicSettings={publicSettings}
                onSelectCategory={(catId) => {
                    setSelectedCategory(catId || "");
                    if (catId) setSearchParams({ category_id: catId });
                    else setSearchParams({});
                }}
            />
            <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">All Products</h1>
                    <p className="text-xs text-gray-500 mt-1">Found {totalResults} matching items</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <FunnelIcon className="w-4 h-4 text-blue-600" /> Filters
                            </h3>
                            <button onClick={handleClearFilters} className="text-[11px] font-semibold text-blue-600 hover:underline">
                                Reset
                            </button>
                        </div>
                        <form onSubmit={handleApplyFilters} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Search Keywords</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search title..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full border rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-600"
                                    />
                                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    className="w-full border rounded-xl px-3 py-2 text-xs bg-white outline-none focus:border-blue-600"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Format</label>
                                <div className="space-y-1.5">
                                    {["all", "digital", "physical"].map((type) => (
                                        <label key={type} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer capitalize">
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type}
                                                checked={typeFilter === type}
                                                onChange={(e) => setTypeFilter(e.target.value)}
                                                className="text-blue-600"
                                            />
                                            {type === "all" ? "All Items" : `${type} Products`}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Price Range (PKR)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-1/2 border rounded-xl px-2.5 py-1.5 text-xs outline-none"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-1/2 border rounded-xl px-2.5 py-1.5 text-xs outline-none"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-black transition">
                                Apply Filter
                            </button>
                        </form>
                    </aside>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs font-semibold text-gray-600">
                                Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border rounded-xl px-3 py-1.5 text-xs bg-white outline-none focus:border-blue-600 font-semibold"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="name_asc">Alphabetical (A-Z)</option>
                                </select>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center py-20 text-gray-400">Loading catalog items...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
                                <p className="text-gray-500 font-medium text-sm">No products found matching your current selections.</p>
                                <button onClick={handleClearFilters} className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-6">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="p-2 border rounded-xl bg-white disabled:opacity-40 hover:bg-gray-50"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                                            currentPage === pageNum
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-white border text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="p-2 border rounded-xl bg-white disabled:opacity-40 hover:bg-gray-50"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <StoreFooter />
        </div>
    );
}

export default ProductsCatalog;