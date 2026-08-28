const BASE_URL = "http://localhost:8000/api/admin/dashboard";

export const getDashboardDataApi = async () => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch(BASE_URL, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load dashboard stats");
    return data;
};