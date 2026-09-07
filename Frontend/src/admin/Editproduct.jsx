import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate, useParams } from "react-router";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
    stock: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/products");
      const products = Array.isArray(res.data)
        ? res.data
        : res.data?.products || [];
      const product = products.find((item) => item._id === id);

      if (!product) {
        throw new Error("Product not found");
      }

      setForm({
        title: product.title || "",
        price: product.price ?? "",
        description: product.description || "",
        category: product.category || "",
        image: product.images?.[0] || "",
        stock: product.stock ?? "",
      });
      setImageFile(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Unable to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setForm((current) => ({ ...current, image: URL.createObjectURL(file) }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setForm((current) => ({ ...current, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock", form.stock);

      if (imageFile) {
        formData.append("images", imageFile);
      } else {
        formData.append("existingImage", form.image);
      }

      await api.put(`/admin/update/${id}`, formData);
      alert("Product updated!");
      navigate("/admin/products");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to update product");
    }
  };



  return (
    <div className="bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-[900px] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-4xl font-black text-slate-900">Edit Product</h2>
          <p className="mt-2 text-sm text-slate-500">Update content, pricing, and stock details.</p>

          {loading && <p className="mt-6 text-sm text-slate-500">Loading product...</p>}

          {errorMessage && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            {["title", "price", "description", "category", "stock"].map((key) => (
              <input
                key={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={key}
                className="h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600"
              />
            ))}

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Product image</p>
              {form.image ? (
                <div className="mb-4 flex items-center gap-4">
                  <img
                    src={form.image}
                    alt={form.title || "Product preview"}
                    className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <p className="mb-4 text-sm text-slate-500">No image selected.</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3"
              />
            </div>

            <button className="md:col-span-2 mt-2 h-12 rounded-xl bg-teal-700 text-base font-bold text-white transition hover:bg-teal-800">
              Update Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
