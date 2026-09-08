import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import api from "../../api/axios";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMsg("");
    setMsgType("");

    try {
      const response = await api.post("/auth/login", form);
      const token = response?.data?.token;
      const resolvedUserId = response?.data?.userId || response?.data?.user?.userId || response?.data?.user?.userID;

      if (!token || !resolvedUserId) {
        setMsg("Login response is incomplete. Please try again.");
        setMsgType("error");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userId", resolvedUserId);
      if (response?.data?.user?.name) localStorage.setItem("name", response.data.user.name);
      setMsg(response?.data?.message || "Login successful");
      setMsgType("success");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      setMsg(error?.response?.data?.message || "Login failed");
      setMsgType("error");
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f5f1] px-4 py-8 sm:px-6 lg:py-14">
      <div className="mx-auto grid w-full max-w-[1080px] overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(103,76,58,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-[#cfe4e4] p-8 sm:p-12 lg:p-14">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f5c8b8]/70" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#efb6c3]/50" />
          <div className="relative flex h-full flex-col justify-between">
            <div><Link to="/" className="flex items-center gap-2 text-xl font-black text-[#342b27]"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e97855] text-white">P</span>Pandey Shop</Link><p className="mt-16 text-xs font-black uppercase tracking-[0.2em] text-[#5e8584]">Welcome back</p><h1 className="mt-3 max-w-sm text-4xl font-black leading-tight text-[#342b27] sm:text-5xl">Good things are waiting for you.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-[#5f7776]">Sign in to keep your cart, addresses, and orders close at hand.</p></div>
            <div className="mt-14 flex items-center gap-2 text-sm font-bold text-[#5f7776]"><ShieldCheck size={18} className="text-[#e97855]" /> A simple, secure shopping experience</div>
          </div>
        </section>

        <section className="p-7 sm:p-12 lg:p-14">
          <div className="mb-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#e97855]"><Sparkles size={14} /> Your account</p><h2 className="mt-3 text-3xl font-black text-[#342b27]">Sign in</h2><p className="mt-2 text-sm text-[#806e63]">Use your registered email and password.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-[#5f5048]">Email</span><span className="flex h-13 items-center rounded-2xl border border-[#eaded5] bg-[#fffaf7] px-4 focus-within:border-[#e97855] focus-within:ring-4 focus-within:ring-[#e97855]/10"><Mail size={17} className="text-[#aa968b]" /><input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-[#5f5048]">Password</span><span className="flex h-13 items-center rounded-2xl border border-[#eaded5] bg-[#fffaf7] px-4 focus-within:border-[#e97855] focus-within:ring-4 focus-within:ring-[#e97855]/10"><LockKeyhole size={17} className="text-[#aa968b]" /><input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /></span></label>
            <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#e97855] font-black text-white transition hover:bg-[#d86140]">Sign in <ArrowRight size={17} /></button>
            {msg && <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msgType === "success" ? "bg-[#e7f5ec] text-[#39815b]" : "bg-[#fff0eb] text-[#b9573b]"}`}>{msg}</p>}
          </form>
          <p className="mt-8 text-center text-sm text-[#806e63]">New to Pandey Shop? <button type="button" onClick={() => navigate("/signup")} className="font-black text-[#e97855] hover:text-[#c85d40]">Create an account</button></p>
          <Link to="/admin/login" className="mt-6 block text-center text-xs font-bold text-[#aa968b] hover:text-[#e97855]">Admin login</Link>
        </section>
      </div>
    </main>
  );
}

export default Login;
