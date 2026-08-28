import { useEffect, useState } from "react";
import { getUsersApi, toggleUserStatusApi } from "../services/users";
import { useDataTable } from "../hooks/useDataTable";
import Pagination from "../components/Pagination";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
    } = useDataTable(users, ["name", "email", "phone", "address", "status"], 5);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsersApi();
            setUsers(data.users);
        } catch (err) {
            toast.error(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const isBlocking = user.status === "active";
        const actionText = isBlocking ? "Block" : "Activate";

        const result = await Swal.fire({
            title: `${actionText} User?`,
            text: `Are you sure you want to ${actionText.toLowerCase()} ${user.name}?`,
            icon: isBlocking ? "warning" : "info",
            showCancelButton: true,
            confirmButtonColor: isBlocking ? "#ef4444" : "#10b981",
            confirmButtonText: `Yes, ${actionText.toLowerCase()}`,
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const data = await toggleUserStatusApi(user.id);
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === user.id ? data.user : u))
            );
            toast.success(data.message);
        } catch (err) {
            toast.error(err.message || "Could not update status");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Users</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage customer accounts and access status</p>
                </div>
                <div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
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
                            <th
                                onClick={() => handleSort("phone")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Phone {sortConfig.key === "phone" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("address")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Address {sortConfig.key === "address" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th
                                onClick={() => handleSort("status")}
                                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                            >
                                Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    No matching users found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.phone || "N/A"}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.address || "N/A"}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                user.status === "active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={`px-3 py-1 text-xs font-medium rounded transition ${
                                                user.status === "active"
                                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                            }`}
                                        >
                                            {user.status === "active" ? "Block" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))
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
        </div>
    );
}

export default Users;