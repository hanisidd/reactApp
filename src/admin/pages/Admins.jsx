import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "../services/admins";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

function Admins() {
    const { admin } = useAuth();

    const [admins, setAdmins] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);


    useEffect(() => {

        const fetchAdmins = async () => {

            try {

                const data = await getAdmins();

                setAdmins(data.admins);

            } catch (error) {

                console.log(error);

            }

        };

        fetchAdmins();

    }, []);


    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: "",
        }));
    };
    const handleSubmit = async (event) => {

        event.preventDefault();

        const validationErrors = {};

        if (!form.name) {
            validationErrors.name = "Name is required";
        }

        if (!form.email) {
            validationErrors.email = "Email is required";
        }

        if (!editingAdmin && !form.password) {
            validationErrors.password = "Password is required";
        }

        if (form.password && form.password.length < 6) {
            validationErrors.password =
                "Password must have at least 6 characters";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {

            setSaving(true);

            let data;

            if (editingAdmin) {

                data = await updateAdmin(
                    editingAdmin.id,
                    form
                );

                setAdmins(prevAdmins =>
                    prevAdmins.map(item =>
                        item.id === editingAdmin.id
                            ? data.admin
                            : item
                    )
                );

            } else {

                data = await createAdmin(form);

                setAdmins(prevAdmins => [
                    data.admin,
                    ...prevAdmins,
                ]);
            }

            toast.success(data.message);

            setShowModal(false);
            setEditingAdmin(null);

            setForm({
                name: "",
                email: "",
                password: "",
            });

            setErrors({});

        } catch (error) {

            if (error.data?.errors) {
                setErrors(error.data.errors);
            } else {
                toast.error("Something went wrong");
            }

        } finally {

            setSaving(false);

        }
    };

    const handleEdit = (item) => {

        setEditingAdmin(item);

        setForm({
            name: item.name,
            email: item.email,
            password: "",
        });

        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (admin) => {

        const result = await Swal.fire({
            title: "Delete admin?",
            text: `Are you sure you want to delete ${admin.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            const data = await deleteAdmin(admin.id);

            setAdmins(prevAdmins =>
                prevAdmins.filter(item => item.id !== admin.id)
            );

            toast.success(data.message);

        } catch (error) {

            toast.error(
                error.data?.message || "Something went wrong"
            );

        }
    };
    return (
        <div className="p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

                <div>
                    <h1 className="text-2xl font-bold">
                        Admins
                    </h1>

                    <p className="text-gray-500">
                        Manage admin accounts
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    + Add Admin
                </button>

            </div>


            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-50 border-b">

                        <tr>
                            <th className="text-left px-6 py-3">
                                #
                            </th>

                            <th className="text-left px-6 py-3">
                                Name
                            </th>

                            <th className="text-left px-6 py-3">
                                Email
                            </th>

                            <th className="text-right px-6 py-3">
                                Actions
                            </th>
                        </tr>

                    </thead>


                    <tbody>

                        {admins.map((item, index) => {

                            const isCurrentAdmin =
                                item.id === admin?.id;

                            return (
                                <tr
                                    key={item.id}
                                    className="border-b last:border-0 hover:bg-gray-50"
                                >

                                    <td className="px-6 py-4">
                                        {index + 1}
                                    </td>

                                    <td className="px-6 py-4 font-medium">
                                        {item.name}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {item.email}
                                    </td>

                                    <td className="px-6 py-4 text-right">

                                        {isCurrentAdmin ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                                Logged in
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-800 mr-4"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}

                                    </td>

                                </tr>
                            );

                        })}

                    </tbody>

                </table>

            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">

                        <div className="flex items-center justify-between mb-6">

                            <h2 className="text-xl font-bold">
                                {editingAdmin ? "Edit Admin" : "Add Admin"}
                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-800 text-xl"
                            >
                                ✕
                            </button>

                        </div>


                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block mb-1">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500"
                                />

                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="block mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500"
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>


                            <div>
                                <label className="block mb-1">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2 outline-none focus:border-blue-500"
                                />

                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>


                            <div className="flex justify-end gap-3 pt-4">

                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingAdmin
                                            ? "Update Admin"
                                            : "Add Admin"
                                    }                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </div>
    );
}

export default Admins;