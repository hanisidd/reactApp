const BASE_URL = "http://localhost:8000/api/admin/products";

const getHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
    };
};

export const getProductsApi = async () => {
    const response = await fetch(BASE_URL, {
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch products");
    return data;
};

export const createProductApi = async (formData) => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getHeaders(),
        body: formData, // FormData automatically handles multipart/form-data
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

export const updateProductApi = async (id, formData) => {
    // Note: We use POST with _method=PUT for Laravel file uploads on update
    formData.append("_method", "PUT");
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "POST",
        headers: getHeaders(),
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};

export const toggleProductStatusApi = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}/toggle-status`, {
        method: "PATCH",
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update status");
    return data;
};

export const deleteProductApi = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete product");
    return data;
};