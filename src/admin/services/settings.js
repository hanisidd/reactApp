const BASE_URL = "http://localhost:8000/api/admin/settings/email-template";

const getHeaders = () => {
    const token = localStorage.getItem("admin_token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
    };
};

export const getEmailTemplateApi = async () => {
    const response = await fetch(BASE_URL, {
        headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load email template");
    return data;
};

export const updateEmailTemplateApi = async (templateData) => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(templateData),
    });
    const data = await response.json();
    if (!response.ok) throw data;
    return data;
};