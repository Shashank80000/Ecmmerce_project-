import { Link, useNavigate } from "react-router";

export function ProductCardSkeleton() {
  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" aria-hidden="true">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="aspect-3/2 w-full animate-pulse bg-slate-200" />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-slate-200" />
        </div>
      </div>
    </article>
  );
}

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

  const productImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image || "";

  return (
    <article
      onClick={() => navigate(`/product/${product._id}`)}
      className="mx-auto w-full max-w-sm cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
    >
      {/* PRODUCT TITLE */}
      <div className="flex flex-wrap justify-between gap-4 px-4 py-3 sm:px-6">

        <Link
          to={`/product/${product._id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {product.title}
          </h3>
        </Link>

        {/* WISHLIST */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex cursor-pointer items-center gap-1"
          aria-label="Save product"
          title="Save this product"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-18px overflow-visible fill-slate-900 hover:fill-blue-600 dark:fill-slate-50"
            viewBox="0 0 67.949 67.949"
          >
            <path d="M62.49 11.239c-7.39-7.388-19.412-7.388-26.8 0l-1.716 1.715-1.715-1.715c-7.388-7.389-19.411-7.389-26.799 0-7.238 7.238-7.285 18.711-.109 26.688 6.545 7.273 25.848 22.986 26.667 23.651a3 3 0 0 0 1.89.672l.065-.001c.688.032 1.381-.204 1.955-.671.819-.665 20.124-16.378 26.671-23.652 7.175-7.976 7.128-19.449-.109-26.687m-4.351 22.674c-5.103 5.669-19.13 17.361-24.166 21.51-5.036-4.148-19.06-15.839-24.162-21.509-5.006-5.564-5.053-13.488-.109-18.432 2.525-2.524 5.841-3.787 9.157-3.787s6.632 1.262 9.157 3.787l3.772 3.772a2.9 2.9 0 0 0 1.609.811 3 3 0 0 0 2.76-.81l3.774-3.773c5.051-5.049 13.267-5.048 18.315 0 4.944 4.944 4.897 12.868-.107 18.431" />
          </svg>
        </button>

      </div>

      {/* PRODUCT IMAGE */}
      <Link
        to={`/product/${product._id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-3/2 w-full overflow-hidden bg-gray-50 dark:bg-neutral-700">
                 

          {productImage ? (
            <img
              src={productImage}
              alt={product.title}
              className="w-full  object-cover transition duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}

        </div>
      </Link>

      {/* PRODUCT DETAILS */}
      <div className="p-4 sm:p-6">

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {product.description ||
            "No description available for this product."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

          {/* PRICE */}
          <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
            ₹{Number(product.price || 0).toFixed(2)}
          </span>

          {/* ADD TO CART */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product._id);
            }}
            className="inline-block cursor-pointer rounded-md border border-blue-600 bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Add to Cart
          </button>

        </div>
      </div>
    </article>
  );
}