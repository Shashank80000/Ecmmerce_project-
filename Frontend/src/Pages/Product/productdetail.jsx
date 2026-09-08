import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Share2, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../../api/axios";
import ProductCard from "../../Component/ProductCard/ProductCard.jsx";

const getImage = (product) => product?.images?.find(Boolean) || product?.image || "";

const getDiscount = (product) => {
  const discount = Number(product?.discount ?? product?.discountPercentage);
  if (Number.isFinite(discount) && discount > 0) return discount;

  const originalPrice = Number(product?.originalPrice ?? product?.mrp);
  const price = Number(product?.price);
  return originalPrice > price && price >= 0
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
};

const getRating = (product) => Number(product?.rating ?? product?.averageRating ?? 0);

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[1220px] animate-pulse rounded-[2rem] bg-white p-5 shadow-sm sm:p-8 lg:p-10">
      <div className="grid gap-10 lg:grid-cols-2"><div className="h-[520px] rounded-[1.5rem] bg-[#eee5df]" /><div className="space-y-5"><div className="h-4 w-32 rounded bg-[#eee5df]" /><div className="h-14 w-4/5 rounded bg-[#eee5df]" /><div className="h-24 rounded bg-[#eee5df]" /><div className="h-16 rounded bg-[#eee5df]" /><div className="h-14 rounded bg-[#eee5df]" /></div></div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#eee3dc] last:border-b-0">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between py-5 text-left text-base font-black text-[#342b27]">
        {title}<ChevronDown size={18} className={`text-[#e97855] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-5 text-sm leading-7 text-[#806e63]">{children}</div>}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await api.get("/products/");
        const products = Array.isArray(response.data) ? response.data : response.data?.products || [];
        setAllProducts(products);
        const currentProduct = products.find((item) => item._id === id);
        setProduct(currentProduct || null);
        setCurrentIndex(0);
        setQuantity(1);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "Unable to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const imageList = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images)) return product.images.filter(Boolean);
    return product.image ? [product.image] : [];
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((item) => item._id !== product._id && item.category && item.category === product.category)
      .slice(0, 4);
  }, [allProducts, product]);

  const stock = Math.max(0, Number(product?.stock || 0));
  const discount = getDiscount(product);
  const rating = getRating(product);
  const originalPrice = Number(product?.originalPrice ?? product?.mrp ?? 0);
  const inStock = stock > 0;

  const changeQuantity = (amount) => {
    setQuantity((current) => Math.min(stock || 1, Math.max(1, current + amount)));
  };

  const addToCart = async () => {
    if (!product || !inStock) return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      setAdding(true);
      const existingCart = await api.get(`/cart/${userId}`);
      const existingItem = (existingCart.data?.cart?.items || []).find((item) => {
        const productId = item.productId?._id || item.productId;
        return productId?.toString() === product._id.toString();
      });
      const nextQuantity = Math.min(Number(existingItem?.quantity || 0) + quantity, stock);

      if (existingItem) {
        await api.post("/cart/update", { userId, productId: product._id, quantity: nextQuantity });
      } else {
        await api.post("/cart/add", { userId, productId: product._id });
        if (quantity > 1) {
          await api.post("/cart/update", { userId, productId: product._id, quantity });
        }
      }

      const updatedCart = await api.get(`/cart/${userId}`);
      const itemCount = (updatedCart.data?.cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      localStorage.setItem("cartCount", String(itemCount));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  const shareProduct = async () => {
    const shareData = { title: product.title, text: product.description || product.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      setCopied(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#f9f5f1] px-4 py-8"><ProductSkeleton /></main>;
  if (errorMessage) return <main className="min-h-screen bg-[#f9f5f1] px-6 py-20 text-center"><p className="text-[#b9573b]">{errorMessage}</p><Link to="/" className="mt-5 inline-flex rounded-full bg-[#e97855] px-5 py-3 text-sm font-black text-white">Continue Shopping</Link></main>;
  if (!product) return <main className="min-h-screen bg-[#f9f5f1] px-6 py-20 text-center"><h1 className="text-3xl font-black text-[#342b27]">Product not found</h1><Link to="/" className="mt-5 inline-flex rounded-full bg-[#e97855] px-5 py-3 text-sm font-black text-white">Continue Shopping</Link></main>;

  return (
    <main className="min-h-screen bg-[#f9f5f1] pb-20 text-[#342b27]">
      <div className="mx-auto max-w-[1220px] px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#8b7669] hover:text-[#e97855]"><ArrowLeft size={16} /> Back to shop</Link>
        <div className="rounded-[2rem] bg-white p-5 shadow-[0_20px_70px_rgba(103,76,58,0.08)] sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <section>
              <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#b9d8d7] p-8 sm:min-h-[520px]">
                {imageList.length > 0 ? <img src={imageList[currentIndex]} alt={product.title} className="max-h-[470px] w-full object-contain mix-blend-multiply" /> : <p className="text-sm text-[#557c7b]">No image available</p>}
                {discount > 0 && <span className="absolute left-5 top-5 rounded-full bg-[#e97855] px-4 py-2 text-xs font-black text-white">-{discount}%</span>}
                {imageList.length > 1 && <><button type="button" onClick={() => setCurrentIndex((currentIndex - 1 + imageList.length) % imageList.length)} className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#806e63] shadow" aria-label="Previous image"><ArrowLeft size={17} /></button><button type="button" onClick={() => setCurrentIndex((currentIndex + 1) % imageList.length)} className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#806e63] shadow" aria-label="Next image"><ArrowRight size={17} /></button></>}
              </div>
              {imageList.length > 0 && <div className="mt-4 flex gap-3 overflow-x-auto pb-1">{imageList.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setCurrentIndex(index)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f7eee7] p-1 ${currentIndex === index ? "border-[#e97855]" : "border-transparent"}`} aria-label={`View image ${index + 1}`}><img src={image} alt="" className="h-full w-full object-contain" /></button>)}</div>}
            </section>

            <section className="flex flex-col justify-center">
              <div className="flex items-center justify-between gap-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#e97855]">{product.category || "Product"}</p><button type="button" onClick={shareProduct} className="flex items-center gap-2 rounded-full border border-[#eaded5] px-3 py-2 text-xs font-bold text-[#806e63] hover:border-[#e97855] hover:text-[#e97855]"><Share2 size={14} />{copied ? "Copied" : "Share"}</button></div>
              <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-tight text-[#342b27] sm:text-5xl">{product.title}</h1>
              {rating > 0 && <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#806e63]"><span className="flex gap-0.5 text-[#f0a65c]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} className={index < Math.round(rating) ? "fill-current" : ""} />)}</span>{rating.toFixed(1)}{product.reviewCount ? ` (${product.reviewCount} reviews)` : ""}</div>}
              <p className="mt-5 text-base leading-7 text-[#806e63]">{product.description || "No description available for this product."}</p>
              <div className="mt-7 flex items-end gap-3"><span className="text-4xl font-black text-[#342b27]">₹{Number(product.price || 0).toFixed(2)}</span>{discount > 0 && originalPrice > 0 && <span className="pb-1 text-base text-[#aa968b] line-through">₹{originalPrice.toFixed(2)}</span>}</div>
              <div className="mt-3 flex items-center gap-2 text-sm font-bold">{inStock ? <><Check size={17} className="text-[#55a36c]" /> In stock{stock <= 5 && <span className="text-[#c36f54]">· Only {stock} left</span>}</> : <span className="text-[#b9573b]">Out of stock</span>}</div>
              <div className="mt-7 flex flex-wrap items-center gap-4"><div className="flex h-12 items-center rounded-full border border-[#eaded5] bg-[#f8f3ef]"><button type="button" onClick={() => changeQuantity(-1)} disabled={!inStock || quantity <= 1} className="grid h-12 w-12 place-items-center text-lg font-bold text-[#806e63] disabled:opacity-40" aria-label="Decrease quantity">−</button><span className="w-8 text-center text-sm font-black">{quantity}</span><button type="button" onClick={() => changeQuantity(1)} disabled={!inStock || quantity >= stock} className="grid h-12 w-12 place-items-center text-lg font-bold text-[#806e63] disabled:opacity-40" aria-label="Increase quantity">+</button></div><button type="button" onClick={addToCart} disabled={!inStock || adding} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#e97855] px-6 text-sm font-black text-white transition hover:bg-[#d86140] disabled:cursor-not-allowed disabled:bg-[#d7c7bf] sm:flex-none"><ShoppingBag size={17} />{adding ? "Adding..." : "Add to cart"}</button></div>
              <button type="button" disabled className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#aa968b]" title="Wishlist is not available in this backend yet"><Heart size={17} /> Wishlist unavailable</button>
            </section>
          </div>

          <div className="mt-12 grid gap-8 border-t border-[#eee3dc] pt-3 lg:grid-cols-[1fr_0.8fr]">
            <div><Accordion title="Product Details" defaultOpen><dl className="grid gap-3 sm:grid-cols-2"><div><dt className="font-bold text-[#342b27]">Category</dt><dd>{product.category || "Not specified"}</dd></div><div><dt className="font-bold text-[#342b27]">Stock</dt><dd>{stock} available</dd></div><div><dt className="font-bold text-[#342b27]">Product ID</dt><dd className="break-all">{product._id}</dd></div></dl></Accordion><Accordion title="Additional Information">{product.description ? <p>{product.description}</p> : <p>No additional product information is available.</p>}</Accordion></div>
            <div><Accordion title="Shipping & Returns" defaultOpen><p>Shipping and return information is not provided by the current product data. Please refer to the existing Shipping Policy and Return Policy in the site footer.</p></Accordion></div>
          </div>
        </div>

        {relatedProducts.length > 0 && <section className="mt-14"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#e97855]">You may also like</p><h2 className="mt-1 text-3xl font-black">Related Products</h2></div><Link to={`/?category=${encodeURIComponent(product.category || "")}`} className="hidden items-center gap-2 text-sm font-bold text-[#e97855] sm:flex">View collection <ArrowRight size={16} /></Link></div><div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{relatedProducts.map((item) => <ProductCard key={item._id} product={item} onAddToCart={async (productId) => { const userId = localStorage.getItem("userId"); if (!userId) return alert("Please login first"); await api.post("/cart/add", { userId, productId }); window.dispatchEvent(new Event("cartUpdated")); }} />)}</div></section>}
      </div>
    </main>
  );
}
