export const getUsersApi = async () => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("http://localhost:8000/api/admin/users", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
    }

    return data;
};
export const toggleUserStatusApi = async (id) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch(`http://localhost:8000/api/admin/users/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update user status");
    }

    return data;
};