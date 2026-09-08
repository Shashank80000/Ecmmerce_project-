import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Store } from "lucide-react";
import { Link, useNavigate } from "react-router";
import api from "../api/axios.js";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const response = await api.post("/admin/login", form);
      localStorage.setItem("adminToken", response.data.token);
      navigate("/admin/products");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f5f1] px-4 py-8 sm:px-6 lg:py-14">
      <div className="mx-auto grid w-full max-w-[1080px] overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(103,76,58,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-[#f5d7c9] p-8 sm:p-12 lg:p-14">
          <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-[#cfe4e4]/80" /><div className="absolute -left-16 -top-14 h-44 w-44 rounded-full bg-[#efb6c3]/55" />
          <div className="relative flex h-full flex-col justify-between"><div><Link to="/" className="flex items-center gap-2 text-xl font-black text-[#342b27]"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e97855] text-white">P</span>Pandey Shop</Link><p className="mt-16 text-xs font-black uppercase tracking-[0.2em] text-[#ba6248]">Store control</p><h1 className="mt-3 max-w-sm text-4xl font-black leading-tight text-[#342b27] sm:text-5xl">Keep the shop moving.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-[#765c4e]">Manage products, orders, inventory, and the details that keep every customer experience smooth.</p></div><div className="mt-14 flex items-center gap-2 text-sm font-bold text-[#765c4e]"><ShieldCheck size={18} className="text-[#e97855]" /> Restricted admin access</div></div>
        </section>

        <section className="p-7 sm:p-12 lg:p-14"><div className="mb-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#e97855]"><Store size={14} /> Admin workspace</p><h2 className="mt-3 text-3xl font-black text-[#342b27]">Admin login</h2><p className="mt-2 text-sm text-[#806e63]">Use your admin credentials to continue.</p></div>
          {error && <p className="mb-5 rounded-xl bg-[#fff0eb] px-4 py-3 text-sm font-semibold text-[#b9573b]">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-[#5f5048]">Admin email</span><span className="flex h-13 items-center rounded-2xl border border-[#eaded5] bg-[#fffaf7] px-4 focus-within:border-[#e97855] focus-within:ring-4 focus-within:ring-[#e97855]/10"><Mail size={17} className="text-[#aa968b]" /><input type="email" name="email" placeholder="admin@example.com" value={form.email} onChange={handleChange} required className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-[#5f5048]">Password</span><span className="flex h-13 items-center rounded-2xl border border-[#eaded5] bg-[#fffaf7] px-4 focus-within:border-[#e97855] focus-within:ring-4 focus-within:ring-[#e97855]/10"><LockKeyhole size={17} className="text-[#aa968b]" /><input type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /></span></label>
            <button type="submit" disabled={loading} className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#e97855] font-black text-white transition hover:bg-[#d86140] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Logging in..." : "Open admin workspace"}<ArrowRight size={17} /></button>
          </form>
          <Link to="/" className="mt-8 block text-center text-sm font-bold text-[#aa968b] hover:text-[#e97855]">Return to shop</Link>
        </section>
      </div>
    </main>
  );
}
