import { useState, useMemo } from "react";

export function useDataTable(data = [], searchKeys = [], itemsPerPage = 5) {
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);

    // 1. Filter items based on search query
    const filteredData = useMemo(() => {
        if (!search.trim()) return data;
        const query = search.toLowerCase();

        return data.filter((item) => {
            if (searchKeys.length > 0) {
                return searchKeys.some((key) =>
                    String(item[key] || "").toLowerCase().includes(query)
                );
            }
            return Object.values(item).some((val) =>
                String(val || "").toLowerCase().includes(query)
            );
        });
    }, [data, search, searchKeys]);

    // 2. Sort items by clicked column key
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key] ?? "";
            const bVal = b[sortConfig.key] ?? "";

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // 3. Slice array for pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    // Handle column sort toggle (Ascending -> Descending -> Reset)
    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    return {
        search,
        setSearch: (val) => {
            setSearch(val);
            setCurrentPage(1); // Reset to page 1 on new search
        },
        sortConfig,
        handleSort,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems: filteredData.length,
        paginatedData,
    };
}