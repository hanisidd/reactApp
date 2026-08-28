function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalItems === 0) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 text-sm">
            <div className="text-gray-500 text-xs">
                Showing <span className="font-semibold text-gray-800">{start}</span> to{" "}
                <span className="font-semibold text-gray-800">{end}</span> of{" "}
                <span className="font-semibold text-gray-800">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-xs text-gray-600 px-2">
                    Page <span className="font-semibold">{currentPage}</span> of {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Pagination;