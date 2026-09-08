import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router";

export default function AddProduct() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        images: [],
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await api.get("/products");
                const availableCategories = Array.isArray(response.data?.categories)
                    ? response.data.categories
                    : [];
                setCategories(availableCategories);
            } catch {
                setCategories([]);
            }
        };

        loadCategories();
    }, []);

   const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
        setForm((prev) => ({
            ...prev,
            images: Array.from(files),
        }));
    } else {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
};

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setErrorMessage("");

            if (form.images.length === 0) {
                setErrorMessage("Select at least one product image before submitting.");
                return;
            }

            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("price", Number(form.price));
            formData.append("category", form.category);
            formData.append("stock", form.stock === "" ? 0 : Number(form.stock));

            form.images.forEach((file) => {
                formData.append("images", file);
            });

            await api.post("/admin/add", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            });

            alert("Product added successfully!");
            navigate("/admin/products");

        } catch (err) {
            console.error(err);

            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Error adding product"
            );
        }
    };

    return (
        <div className="bg-slate-50 py-10">
            <div className="mx-auto w-full max-w-[900px] px-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h2 className="text-4xl font-black text-slate-900">
                        Add New Product
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Fill details and publish to catalog.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 grid gap-4 md:grid-cols-2"
                    >
                        <input
                            type="text"
                            name="title"
                            placeholder="Product Title"
                            value={form.title}
                            onChange={handleChange}
                            className="h-12 rounded-xl border border-slate-300 px-4"
                            required
                        />

                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={form.price}
                            onChange={handleChange}
                            className="h-12 rounded-xl border border-slate-300 px-4"
                            required
                        />

                        <div>
                            <label htmlFor="category" className="mb-2 block text-sm font-semibold text-slate-700">
                                Category
                            </label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                list="product-categories"
                                placeholder="Choose or type a category"
                                value={form.category}
                                onChange={handleChange}
                                className="h-12 w-full rounded-xl border border-slate-300 px-4"
                            />
                            <datalist id="product-categories">
                                {categories.map((category) => (
                                    <option key={category} value={category} />
                                ))}
                            </datalist>
                            <p className="mt-1 text-xs text-slate-500">
                                Existing categories are suggested; new names are saved automatically.
                            </p>
                        </div>

                        <input
                            type="number"
                            name="stock"
                            placeholder="Stock"
                            value={form.stock}
                            onChange={handleChange}
                            className="h-12 rounded-xl border border-slate-300 px-4"
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                            className="md:col-span-2 rounded-xl border border-slate-300 p-4"
                            rows="5"
                        />

                        <input
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleChange}
                        className="md:col-span-2 rounded-xl border border-slate-300 p-3"
                    />

                         {form.images.length > 0 && (
                                <div className="md:col-span-2">
                                    <p className="mb-2 font-medium">Image Preview</p>

                                    <div className="flex flex-wrap gap-4">
                                        {form.images.map((file, index) => (
                                            <img
                                                key={index}
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="h-32 w-32 rounded-lg border object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        <button
                            type="submit"
                            className="md:col-span-2 mt-2 h-12 rounded-xl bg-teal-700 text-base font-bold text-white hover:bg-teal-800"
                        >
                            Add Product
                        </button>

                        {errorMessage && (
                            <p className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}