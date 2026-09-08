import { useEffect, useState } from "react";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import api from "../../api/axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedSearch = searchValue.trim();
    navigate(trimmedSearch ? `/search/${encodeURIComponent(trimmedSearch)}` : "/");
    setMenuOpen(false);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!userId) {
          setCartCount(0);
          return;
        }
        const response = await api.get(`/cart/${userId}`);
        const items = response.data?.cart?.items ?? [];
        setCartCount(items.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
      } catch {
        setCartCount(0);
      }
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [userId]);

  const logout = () => {
    localStorage.clear();
    localStorage.setItem("theme", theme);
    setCartCount(0);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#eee3dc] bg-[#fffdfb]/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <nav className="mx-auto flex w-full max-w-[1380px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-[#302925] dark:text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e97855] text-lg font-black text-white shadow-[0_6px_16px_rgba(233,120,85,0.25)]">P</span>
          <span className="hidden text-xl font-black tracking-tight sm:block">Pandey Shop</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="order-3 flex w-full items-center lg:order-none lg:mx-auto lg:max-w-[580px]">
          <div className="flex h-11 w-full items-center rounded-full border border-[#eaded5] bg-[#f8f3ef] px-4 shadow-sm transition focus-within:border-[#e97855] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#e97855]/10 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:bg-slate-950">
            <Search size={18} className="shrink-0 text-[#a38d80]" aria-hidden="true" />
            <input type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search your next favorite thing" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#302925] outline-none placeholder:text-[#aa968b] dark:text-slate-100" aria-label="Search products" />
            <button type="submit" className="hidden rounded-full bg-[#e97855] px-4 py-1.5 text-xs font-black text-white transition hover:bg-[#d86140] sm:block">Search</button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full border border-[#eaded5] bg-white text-[#806e63] shadow-sm transition hover:border-[#e97855] hover:text-[#e97855] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" aria-label="Open cart" title="Cart">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#e97855] px-1 text-[10px] font-black text-white">{cartCount}</span>}
          </Link>
          <button type="button" className="hidden h-10 w-10 place-items-center rounded-full border border-[#eaded5] bg-white text-[#806e63] shadow-sm transition hover:border-[#e97855] hover:text-[#e97855] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:grid" aria-label="Wishlist" title="Wishlist is not available in this backend yet"><Heart size={18} /></button>
          <button type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} className="hidden h-10 w-10 place-items-center rounded-full border border-[#eaded5] bg-white text-[#806e63] shadow-sm transition hover:border-[#e97855] hover:text-[#e97855] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:grid" aria-label="Toggle theme" title="Toggle theme">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          <div className="hidden items-center gap-2 sm:flex">
            {userId ? <button type="button" onClick={logout} className="flex items-center gap-2 rounded-full border border-[#eaded5] bg-white px-3 py-2 text-sm font-bold text-[#806e63] transition hover:border-[#e97855] hover:text-[#e97855] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><User size={16} />{userName || "Account"}</button> : <Link to="/login" className="flex items-center gap-2 rounded-full border border-[#eaded5] bg-white px-3 py-2 text-sm font-bold text-[#806e63] transition hover:border-[#e97855] hover:text-[#e97855] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><User size={16} />Login</Link>}
            {!userId && <Link to="/signup" className="rounded-full bg-[#e97855] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d86140]">Sign up</Link>}
          </div>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-full border border-[#eaded5] bg-white text-[#806e63] sm:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" aria-label="Open menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>

        {menuOpen && <div className="order-4 flex w-full flex-col gap-2 border-t border-[#eee3dc] pt-3 sm:hidden dark:border-slate-800">
          <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-[#806e63] hover:bg-[#f8f3ef]">Shop</Link>
          <Link to={userId ? "/" : "/login"} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-[#806e63] hover:bg-[#f8f3ef]">{userId ? `Hi, ${userName || "Account"}` : "Login / Account"}</Link>
          {userId ? <button type="button" onClick={logout} className="rounded-xl px-3 py-2 text-left text-sm font-bold text-[#c45e43] hover:bg-[#fff0eb]">Logout</button> : <Link to="/signup" onClick={() => setMenuOpen(false)} className="rounded-xl bg-[#e97855] px-3 py-2 text-sm font-black text-white">Create account</Link>}
        </div>}
      </nav>
    </header>
  );
}
