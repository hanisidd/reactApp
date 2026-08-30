import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:8000/api/admin";

const TEMPLATE_TYPES = [
    { value: "digital_delivery", label: "Digital Product Delivery Email", subjectKey: "digital_email_subject", bodyKey: "digital_email_body" },
    { value: "order_confirmation", label: "Order Confirmation Email", subjectKey: "order_confirmation_subject", bodyKey: "order_confirmation_body" },
    { value: "order_preparing", label: "Order Preparing Status Email", subjectKey: "order_preparing_subject", bodyKey: "order_preparing_body" },
    { value: "order_delivered", label: "Order Delivered Status Email", subjectKey: "order_delivered_subject", bodyKey: "order_delivered_body" },
    { value: "order_cancelled", label: "Order Cancelled Status Email", subjectKey: "order_cancelled_subject", bodyKey: "order_cancelled_body" },
];

const PLACEHOLDERS = [
    { token: "{customer_name}", label: "Customer Name" },
    { token: "{order_id}", label: "Order ID" },
    { token: "{product_name}", label: "Product Name" },
];

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

function EmailTemplatesTab({ form, setForm, getHeaders }) {
    const [selectedTemplateType, setSelectedTemplateType] = useState("digital_delivery");
    const [savingTemplate, setSavingTemplate] = useState(false);

    const subjectInputRef = useRef(null);
    const quillRef = useRef(null);

    const activeTemplate = TEMPLATE_TYPES.find((t) => t.value === selectedTemplateType);

    const insertIntoSubject = (token) => {
        const input = subjectInputRef.current;
        const currentValue = form[activeTemplate.subjectKey] || "";

        if (!input) {
            setForm((prev) => ({ ...prev, [activeTemplate.subjectKey]: currentValue + token }));
            return;
        }

        const start = input.selectionStart ?? currentValue.length;
        const end = input.selectionEnd ?? currentValue.length;
        const newValue = currentValue.slice(0, start) + token + currentValue.slice(end);

        setForm((prev) => ({ ...prev, [activeTemplate.subjectKey]: newValue }));

        requestAnimationFrame(() => {
            input.focus();
            const cursor = start + token.length;
            input.setSelectionRange(cursor, cursor);
        });
    };

    const insertIntoBody = (token) => {
        const editor = quillRef.current ? quillRef.current.getEditor() : null;

        if (!editor) {
            setForm((prev) => ({
                ...prev,
                [activeTemplate.bodyKey]: (prev[activeTemplate.bodyKey] || "") + token,
            }));
            return;
        }

        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();

        editor.insertText(index, token, "user");
        editor.setSelection(index + token.length, 0, "user");

        setForm((prev) => ({ ...prev, [activeTemplate.bodyKey]: editor.root.innerHTML }));
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            setSavingTemplate(true);
            const payload = {
                [activeTemplate.subjectKey]: form[activeTemplate.subjectKey] || "",
                [activeTemplate.bodyKey]: form[activeTemplate.bodyKey] || "",
            };
            const res = await fetch(`${BASE_URL}/settings`, {
                method: "POST",
                headers: { ...getHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save template");
            toast.success(`${activeTemplate.label} updated successfully!`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSavingTemplate(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-900 space-y-2">
                <p className="font-bold">Dynamic Placeholders — click to insert at your cursor:</p>
                <div className="flex flex-wrap gap-2">
                    {PLACEHOLDERS.map((p) => (
                        <button
                            key={p.token}
                            type="button"
                            onClick={() => insertIntoBody(p.token)}
                            className="px-2.5 py-1 bg-white border border-blue-200 rounded-md font-mono text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                            title={`Insert ${p.label} into body`}
                        >
                            {p.token}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Template Type</label>
                <select
                    value={selectedTemplateType}
                    onChange={(e) => setSelectedTemplateType(e.target.value)}
                    className="w-full md:w-96 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-blue-500"
                >
                    {TEMPLATE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    {activeTemplate.label}
                </h3>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">Subject</label>
                        <div className="flex gap-1.5">
                            {PLACEHOLDERS.map((p) => (
                                <button
                                    key={p.token}
                                    type="button"
                                    onClick={() => insertIntoSubject(p.token)}
                                    className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded font-mono text-[10px] text-gray-600 hover:bg-gray-100 transition"
                                >
                                    {p.token}
                                </button>
                            ))}
                        </div>
                    </div>
                    <input
                        ref={subjectInputRef}
                        type="text"
                        value={form[activeTemplate.subjectKey] || ""}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, [activeTemplate.subjectKey]: e.target.value }))
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Body</label>
                    <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            modules={QUILL_MODULES}
                            value={form[activeTemplate.bodyKey] || ""}
                            onChange={(content) =>
                                setForm((prev) => ({ ...prev, [activeTemplate.bodyKey]: content }))
                            }
                            placeholder="Compose the email body. Use the placeholder buttons above to insert dynamic fields..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                    <button
                        type="submit"
                        disabled={savingTemplate}
                        className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {savingTemplate ? "Saving..." : "Save Template"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EmailTemplatesTab;