const BASE_URL = "http://localhost:8000/api/admin/orders";

const getHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
    };
};

export const getOrdersApi = async () => {
    const response = await fetch(BASE_URL, {
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch orders");
    return data;
};

export const toggleOrderStatusApi = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/toggle-status`, {
        method: "PATCH",
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update order status");
    return data;
};

export const sendProductEmailApi = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/send-email`, {
        method: "POST",
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};