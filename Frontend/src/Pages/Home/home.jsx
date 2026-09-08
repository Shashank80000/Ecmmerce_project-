import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, ShoppingBag, Sparkles, Star, Tag } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import api from "../../api/axios";
import { ProductCardSkeleton } from "../../Component/ProductCard/ProductCard.jsx";

const getImage = (product) => product?.images?.find(Boolean) || product?.image || "";

const getDiscount = (product) => {
  const directDiscount = Number(product?.discount ?? product?.discountPercentage);
  if (Number.isFinite(directDiscount) && directDiscount > 0) return directDiscount;

  const originalPrice = Number(product?.originalPrice ?? product?.mrp);
  const price = Number(product?.price);
  if (originalPrice > price && price >= 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return 0;
};

const getRating = (product) => Number(product?.rating ?? product?.averageRating ?? 0);

function DataProductCard({ product, onAddToCart, isWishlisted, onToggleWishlist }) {
  const navigate = useNavigate();
  const image = getImage(product);
  const discount = getDiscount(product);
  const rating = getRating(product);
  const originalPrice = Number(product?.originalPrice ?? product?.mrp ?? 0);
  const hasAvailableStock = Number(product?.stock) > 0;

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-[#eadfd6] bg-white shadow-[0_10px_30px_rgba(111,78,55,0.07)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(111,78,55,0.14)]">
      <div className="relative aspect-[1.05/1] overflow-hidden bg-[#f7eee7]">
        {image ? (
          <img src={image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#9b8172]">No image available</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {discount > 0 && <span className="rounded-full bg-[#ef7d57] px-3 py-1 text-xs font-bold text-white">-{discount}%</span>}
        </div>
        <button type="button" onClick={() => onToggleWishlist(product._id)} aria-label={`${isWishlisted ? "Remove" : "Save"} ${product.title}`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#c36f54] shadow-sm transition hover:bg-white">
          <Heart size={17} strokeWidth={2.2} className={isWishlisted ? "fill-[#e97855]" : ""} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d47a5c]">{product.category || "Collection"}</span>
          {rating > 0 && <span className="flex items-center gap-1 text-xs font-semibold text-[#8b7669]"><Star size={13} className="fill-[#f3ae62] text-[#f3ae62]" />{rating.toFixed(1)}</span>}
        </div>
        <Link to={`/product/${product._id}`} className="block min-h-12 text-lg font-bold leading-tight text-[#2f2926] hover:text-[#d46f4d]">{product.title}</Link>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-black text-[#2f2926]">₹{Number(product.price || 0).toFixed(2)}</p>
            {discount > 0 && originalPrice > 0 && <p className="text-xs text-[#aa968b] line-through">₹{originalPrice.toFixed(2)}</p>}
          </div>
          <button type="button" onClick={() => onAddToCart(product._id)} className="grid h-10 w-10 place-items-center rounded-full bg-[#e97855] text-white transition hover:bg-[#d86140]" aria-label={`Add ${product.title} to cart`}>
            <ShoppingBag size={17} />
          </button>
        </div>
        {hasAvailableStock && Number(product.stock) <= 5 && <p className="mt-3 text-xs font-semibold text-[#c36f54]">Only {product.stock} left</p>}
      </div>
    </article>
  );
}

function Section({ title, eyebrow, products, onAddToCart, isWishlisted, onToggleWishlist, emptyText }) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e37855]">{eyebrow}</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-[#2f2926]">{title}</h2>
        </div>
        {products.length > 0 && <span className="hidden text-sm font-semibold text-[#9b8172] sm:block">{products.length} products</span>}
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.slice(0, 8).map((product) => <DataProductCard key={product._id} product={product} onAddToCart={onAddToCart} isWishlisted={isWishlisted(product._id)} onToggleWishlist={onToggleWishlist} />)}</div>
      ) : <div className="rounded-2xl border border-dashed border-[#e4d4ca] bg-white/70 p-8 text-sm text-[#9b8172]">{emptyText}</div>}
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [wishlistIds, setWishlistIds] = useState(() => JSON.parse(localStorage.getItem("wishlistIds") || "[]"));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
        setProducts(Array.isArray(res.data) ? res.data : res.data?.products || []);
        setCategories(Array.isArray(res.data?.categories) ? res.data.categories : []);
        setLoadError("");
      } catch (error) {
        setProducts([]);
        setLoadError(error?.response?.data?.message || "Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, category]);

  const addToCart = async (productId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Please log in to add items to your cart.");

    try {
      const res = await api.post("/cart/add", { userId, productId });
      const itemCount = (res.data?.cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      localStorage.setItem("cartCount", String(itemCount));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to add item to cart");
    }
  };

  const toggleWishlist = (productId) => {
    setWishlistIds((current) => {
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      localStorage.setItem("wishlistIds", JSON.stringify(next));
      return next;
    });
  };

  const sortedProducts = useMemo(() => [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [products]);
  const heroProduct = sortedProducts[0];
  const discountedProducts = sortedProducts.filter((product) => getDiscount(product) > 0);
  const ratedProducts = [...sortedProducts].sort((a, b) => getRating(b) - getRating(a));
  const popularProducts = ratedProducts.some((product) => getRating(product) > 0) ? ratedProducts : sortedProducts;
  const categoryCards = categories.map((name) => ({ name, product: products.find((product) => product.category === name) })).filter((item) => item.product);

  return (
    <main className="min-h-screen bg-[#f9f5f1] pb-20 text-[#2f2926]">
      <div className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-4 shadow-[0_20px_70px_rgba(103,76,58,0.08)] sm:p-6 lg:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e7e1] pb-5">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e97855] text-xl font-black text-white">P</span><div><p className="text-xl font-black">Pandey Shop</p><p className="text-xs font-semibold text-[#a79083]">Everyday things, beautifully chosen</p></div></div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#8b7669]"><Sparkles size={16} className="text-[#e97855]" /> Real products from your catalog</div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
            <aside className="hidden rounded-2xl bg-[#f7efe8] p-5 lg:block">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-black">Categories</h2><Tag size={17} className="text-[#e97855]" /></div>
              <button type="button" onClick={() => setCategory("")} className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold ${!category ? "bg-white text-[#e97855] shadow-sm" : "text-[#7f6a5e] hover:bg-white/70"}`}>All products<ArrowRight size={15} /></button>
              {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold capitalize ${category === item ? "bg-white text-[#e97855] shadow-sm" : "text-[#7f6a5e] hover:bg-white/70"}`}>{item}<ArrowRight size={15} /></button>)}
            </aside>

            <div className="min-w-0">
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">{["", ...categories].map((item) => <button key={item || "all"} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold capitalize ${category === item ? "bg-[#e97855] text-white" : "bg-[#f7efe8] text-[#7f6a5e]"}`}>{item || "All"}</button>)}</div>
              {loadError && <div className="mb-5 rounded-xl bg-[#fff0eb] p-4 text-sm font-semibold text-[#b9573b]">{loadError}</div>}
              {loading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)}</div> : heroProduct ? (
                <section className="grid min-h-[340px] overflow-hidden rounded-[1.6rem] bg-[#f5d7c9] md:grid-cols-[1fr_0.8fr]">
                  <div className="flex flex-col justify-center p-7 sm:p-10"><p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ba6248]"><Sparkles size={15} /> From your collection</p><h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-[#3b2c26] sm:text-5xl">{heroProduct.title}</h1><p className="mt-4 max-w-md line-clamp-3 text-sm leading-6 text-[#765c4e]">{heroProduct.description || "A considered pick from the Pandey Shop catalog."}</p><div className="mt-6 flex flex-wrap items-center gap-4"><button type="button" onClick={() => navigate(`/product/${heroProduct._id}`)} className="inline-flex items-center gap-2 rounded-full bg-[#e97855] px-5 py-3 text-sm font-black text-white hover:bg-[#d86140]">Shop now <ArrowRight size={16} /></button><span className="text-xl font-black text-[#3b2c26]">₹{Number(heroProduct.price || 0).toFixed(2)}</span></div></div>
                  <div className="relative min-h-[260px] bg-[#b9d8d7]">{getImage(heroProduct) ? <img src={getImage(heroProduct)} alt={heroProduct.title} className="h-full w-full object-contain p-8 mix-blend-multiply" /> : <div className="grid h-full place-items-center text-[#557c7b]">No image available</div>}<span className="absolute right-5 top-5 rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#ba6248]">{heroProduct.category || "Featured"}</span></div>
                </section>
              ) : <div className="rounded-2xl bg-[#f7efe8] p-10 text-center text-[#8b7669]">No products found in this view.</div>}
            </div>
          </div>

          {!loading && products.length > 0 && <>
            <section className="mt-12"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#e37855]">Browse the collection</p><h2 className="mt-1 text-3xl font-black">Explore Popular Categories</h2></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{categoryCards.slice(0, 5).map(({ name, product }) => <button type="button" key={name} onClick={() => setCategory(name)} className="group relative min-h-32 overflow-hidden rounded-2xl bg-[#e8d8cc] text-left"><img src={getImage(product)} alt={name} className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#2f2926]/75 to-transparent" /><span className="absolute bottom-3 left-3 text-sm font-black capitalize text-white">{name}</span></button>)}</div></section>
            <Section title="Trending Products" eyebrow="Shop what is moving" products={popularProducts} onAddToCart={addToCart} isWishlisted={(id) => wishlistIds.includes(id)} onToggleWishlist={toggleWishlist} emptyText="Your product data will appear here." />
            <Section title="New Arrivals" eyebrow="Fresh from your catalog" products={sortedProducts} onAddToCart={addToCart} isWishlisted={(id) => wishlistIds.includes(id)} onToggleWishlist={toggleWishlist} emptyText="No new products yet." />
            <Section title="Best Sellers" eyebrow="Popular picks" products={popularProducts} onAddToCart={addToCart} isWishlisted={(id) => wishlistIds.includes(id)} onToggleWishlist={toggleWishlist} emptyText="No best sellers available yet." />
            <Section title="Flash Sale" eyebrow="Discounted products" products={discountedProducts} onAddToCart={addToCart} isWishlisted={(id) => wishlistIds.includes(id)} onToggleWishlist={toggleWishlist} emptyText="No discounted products are currently listed." />
          </>}
        </div>
      </div>
    </main>
  );
}

