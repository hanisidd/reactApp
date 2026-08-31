const BASE_URL = "http://localhost:8000/api/admin";

/**
 * Every admin service file (products.js, categories.js, admins.js, users.js,
 * orders.js, settings.js) was independently re-implementing:
 *   - reading admin_token from localStorage
 *   - building the same Authorization/Accept/Content-Type headers
 *   - calling res.json() and throwing on !res.ok
 * This consolidates that into one place. Services now call apiFetch(path, options)
 * instead of duplicating the fetch/error-handling boilerplate.
 */
function getToken() {
    return localStorage.getItem("admin_token");
}

export async function apiFetch(path, options = {}) {
    const { isFormData, ...rest } = options;
    const token = getToken();

    const headers = {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...rest.headers,
    };

    // Remove undefined keys (e.g. missing token) so fetch doesn't send "Authorization: undefined"
    Object.keys(headers).forEach((key) => headers[key] === undefined && delete headers[key]);

    const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });

    // 204 No Content etc.
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json().catch(() => ({})) : null;

    if (!res.ok) {
        const error = new Error(data?.message || "Request failed");
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

export function buildQueryString(params = {}) {
    const usable = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    return Object.keys(usable).length ? `?${new URLSearchParams(usable).toString()}` : "";
}
