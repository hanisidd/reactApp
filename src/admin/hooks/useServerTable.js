import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "use-debounce";

/**
 * Manages page/search/sort state for a server-paginated list and re-fetches
 * whenever any of them change. `fetchPage` receives the current params and
 * must return { data, currentPage, totalPages, totalItems }.
 *
 * This mirrors the shape useDataTable already returns (search, setSearch,
 * sortConfig, handleSort, currentPage, setCurrentPage, totalPages, totalItems,
 * paginatedData) so pages can swap between the two hooks with minimal
 * template changes.
 */
export function useServerTable(fetchPage, { perPage = 10, initialSortKey = null } = {}) {
    const [search, setSearchRaw] = useState("");
    const [debouncedSearch] = useDebounce(search, 400);
    const [sortConfig, setSortConfig] = useState({ key: initialSortKey, direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    const setSearch = (value) => {
        setSearchRaw(value);
        setCurrentPage(1); // reset to page 1 on new search, matching useDataTable's behavior
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
        setCurrentPage(1);
    };

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const result = await fetchPage({
                page: currentPage,
                perPage,
                search: debouncedSearch,
                sortBy: sortConfig.key,
                sortDir: sortConfig.direction,
            });
            setData(result.data || []);
            setTotalPages(result.totalPages || 1);
            setTotalItems(result.totalItems || 0);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, perPage, debouncedSearch, sortConfig.key, sortConfig.direction]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        search,
        setSearch,
        sortConfig,
        handleSort,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
        paginatedData: data,
        loading,
        refetch: load,
    };
}
