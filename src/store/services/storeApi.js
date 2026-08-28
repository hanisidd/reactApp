const BASE_URL = "http://localhost:8000/api";

const getHeaders = () => {
    const token = localStorage.getItem("user_token");
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
};

// Store Products & Categories
export const fetchStoreProductsApi = async (categoryId = null) => {
    const url = categoryId ? `${BASE_URL}/store/products?category_id=${categoryId}` : `${BASE_URL}/store/products`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch products");
    return data.products;
};

export const fetchStoreCategoriesApi = async () => {
    const res = await fetch(`${BASE_URL}/store/categories`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch categories");
    return data.categories;
};

export const fetchCheckoutSettingsApi = async () => {
    const res = await fetch(`${BASE_URL}/store/checkout-settings`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch settings");
    return data;
};

export const validatePromoCodeApi = async (code) => {
    const res = await fetch(`${BASE_URL}/store/promo/validate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
};

export const submitCheckoutApi = async (payload) => {
    const res = await fetch(`${BASE_URL}/store/checkout`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
};

// Customer Auth
export const registerUserApi = async (payload) => {
    const res = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
};

export const loginUserApi = async (payload) => {
    const res = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
};

export const updateUserProfileApi = async (payload) => {
    const res = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
};