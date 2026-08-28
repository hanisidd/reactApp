const BASE_URL = "http://localhost:8000/api/admin/categories";

const getAuthHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
    };
};

export const getCategoriesApi = async () => {
    const response = await fetch(BASE_URL, {
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch categories");
    return data;
};

export const createCategoryApi = async (categoryData) => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create category");
    return data;
};

export const updateCategoryApi = async (id, categoryData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update category");
    return data;
};

export const deleteCategoryApi = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete category");
    return data;
};