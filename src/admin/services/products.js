import { apiFetch, buildQueryString } from "./apiClient";

export const getProductsApi = async ({ page, perPage, search, sortBy, sortDir, type, status } = {}) => {
    const qs = buildQueryString({
        page,
        per_page: perPage,
        search,
        sort_by: sortBy,
        sort_dir: sortDir,
        type,
        status,
    });
    return apiFetch(`/products${qs}`);
};

export const createProductApi = (formData) =>
    apiFetch("/products", { method: "POST", body: formData, isFormData: true });

export const updateProductApi = (id, formData) => {
    formData.append("_method", "PUT");
    return apiFetch(`/products/${id}`, { method: "POST", body: formData, isFormData: true });
};

export const toggleProductStatusApi = (id) =>
    apiFetch(`/products/${id}/toggle-status`, { method: "PATCH" });

export const deleteProductApi = (id) =>
    apiFetch(`/products/${id}`, { method: "DELETE" });
