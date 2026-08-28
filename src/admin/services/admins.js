export async function getAdmins() {
    const token = localStorage.getItem("admin_token");

    const response = await fetch(
        "http://127.0.0.1:8000/api/admin/admins",
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


export async function createAdmin(admin) {
    const token = localStorage.getItem("admin_token");

    const response = await fetch(
        "http://127.0.0.1:8000/api/admin/admins",
        {
            method: "POST",

            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(admin),
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
export async function updateAdmin(id, admin) {

    const token = localStorage.getItem("admin_token");

    const response = await fetch(
        `http://127.0.0.1:8000/api/admin/admins/${id}`,
        {
            method: "PUT",

            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(admin),
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
export async function deleteAdmin(id) {

    const token = localStorage.getItem("admin_token");

    const response = await fetch(
        `http://127.0.0.1:8000/api/admin/admins/${id}`,
        {
            method: "DELETE",

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