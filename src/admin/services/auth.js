export async function loginAdmin(credentials) {
    const response = await fetch("http://127.0.0.1:8000/api/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            data,
        };
    }

    return data;
}
export async function getAdmin() {

    const token = localStorage.getItem("admin_token");

    const response = await fetch(
        "http://127.0.0.1:8000/api/admin/me",
        {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            data,
        };
    }

    return data;
}
export async function logoutAdmin() {

    const token = localStorage.getItem("admin_token");

    const response = await fetch(
        "http://127.0.0.1:8000/api/admin/logout",
        {
            method: "POST",

            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            data,
        };
    }

    return data;
}
export const updateProfileApi = async (formData) => {
    const token = localStorage.getItem("admin_token");
    const response = await fetch("http://localhost:8000/api/admin/profile", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            // Note: Do NOT set Content-Type header when sending FormData!
        },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data;
};