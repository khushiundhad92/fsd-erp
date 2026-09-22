import { useEffect, useState } from "react";
import {
  FaSearch,
  FaShoppingCart,
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getCustomerProducts,
  addToCustomerCart,
  getCustomerCart,
} from "../../api/customerApi";

import "./CustomerProducts.css";

/* ==========================================================
   PRODUCT ILLUSTRATION FALLBACK COMPONENT
========================================================== */
const ProductIllustration = ({ name, category, image }) => {
  if (image) {
    return <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }

  const title = (name || "").toLowerCase();
  const cat = (category || "").toLowerCase();

  if (title.includes("milk") || cat.includes("milk")) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        <path d="M22 14C22 10 26 8 32 8C38 8 42 10 42 14V18H22V14Z" fill="#CBD5E1" />
        <path d="M20 18H44L48 26V54C48 57 45 60 42 60H22C19 60 16 57 16 54V26L20 18Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
        <path d="M16 36C20 38 28 40 32 37C38 34 44 38 48 36V54C48 57 45 60 42 60H22C19 60 16 57 16 54V36Z" fill="#16834B" opacity="0.15" />
        <circle cx="32" cy="44" r="7" fill="#16834B" opacity="0.85" />
        <path d="M30 41L34 44L30 47" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  } else if (title.includes("curd") || cat.includes("curd")) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="46" rx="22" ry="10" fill="#E2E8F0" />
        <path d="M10 32C10 44 20 52 32 52C44 52 54 44 54 32H10Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        <ellipse cx="32" cy="32" rx="22" ry="7" fill="#FEF08A" opacity="0.7" />
        <ellipse cx="32" cy="30" rx="18" ry="5" fill="#FFFFFF" />
      </svg>
    );
  } else if (title.includes("paneer") || cat.includes("paneer")) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        <rect x="14" y="22" width="36" height="28" rx="4" fill="#FEF9C3" stroke="#FACC15" strokeWidth="2" />
        <path d="M14 34H50" stroke="#EAB308" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M32 22V50" stroke="#EAB308" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
    );
  } else if (title.includes("butter") || cat.includes("butter")) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="28" width="40" height="22" rx="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
        <path d="M12 28L24 18H52L40 28H12Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
        <path d="M40 28L52 18V40L40 50V28Z" fill="#CA8A04" opacity="0.3" />
      </svg>
    );
  } else if (title.includes("ghee") || cat.includes("ghee")) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
        <rect x="22" y="10" width="20" height="8" rx="2" fill="#E2E8F0" />
        <path d="M18 18H46L50 28V52C50 56 46 58 42 58H22C18 58 14 56 14 52V28L18 18Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
        <circle cx="32" cy="40" r="10" fill="#EAB308" opacity="0.25" />
      </svg>
    );
  }

  return (
    <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
      <rect x="16" y="16" width="32" height="32" rx="8" fill="#ECFDF5" stroke="#16834B" strokeWidth="2" />
      <circle cx="32" cy="32" r="10" fill="#16834B" opacity="0.3" />
    </svg>
  );
};

const CustomerProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  /* ==========================================================
     LOAD PRODUCTS & CART FROM BACKEND
  ========================================================== */

  const loadCartData = async () => {
    try {
      const res = await getCustomerCart();
      if (res?.cart?.items) {
        const map = {};
        res.cart.items.forEach((item) => {
          const key = item.productId || item.product || item._id;
          map[key] = (map[key] || 0) + item.quantity;
        });
        setCartItemsMap(map);
      }
    } catch (err) {
      // Silent error
    }
  };

  const loadProductsData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerProducts();
      const apiProducts = data?.products || (Array.isArray(data) ? data : []);
      setProducts(apiProducts);
    } catch (err) {
      console.error("Products Error:", err);
      setError(err?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductsData();
    loadCartData();
  }, []);

  /* ==========================================================
     SEARCH & CATEGORY FILTER
  ========================================================== */

  const categories = ["All", ...new Set(products.map((p) => p.category || "Dairy"))];

  const filteredProducts = products.filter((product) => {
    const text = `
      ${product?.name || ""}
      ${product?.productName || ""}
      ${product?.category || ""}
    `.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" ||
      (product.category || "Dairy").toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart = async (product) => {
    const productId = product?.id || product?.productId || product?._id;

    if (!productId) {
      showNotification("Product ID is missing.", "error");
      return;
    }

    const stock = Number(product.stock ?? product.quantity ?? 0);
    const currentCartQty = cartItemsMap[productId] || 0;

    if (currentCartQty + 1 > stock) {
      showNotification(`Maximum available stock reached (${stock} ${product.unit || "units"}).`, "warning");
      return;
    }

    setAddingId(productId);

    try {
      await addToCustomerCart(productId, 1);

      // Trigger custom event so Topbar badge updates
      window.dispatchEvent(new Event("cartUpdated"));

      // Update local cart items map
      setCartItemsMap((prev) => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      }));

      // Show temporary [ ✓ Added to Cart ] state for 2 seconds
      setAddedIds((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [productId]: false }));
      }, 2000);
    } catch (err) {
      console.error("Cart Error:", err);
      showNotification(err?.message || "Unable to add product to cart.", "error");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="customer-products-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Loading fresh dairy products...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-products-page">
      {/* TOAST NOTIFICATION BANNER */}
      {toast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "12px 20px",
          borderRadius: "8px",
          backgroundColor: toast.type === "error" ? "#fee2e2" : toast.type === "warning" ? "#fef3c7" : "#dcfce7",
          color: toast.type === "error" ? "#991b1b" : toast.type === "warning" ? "#92400e" : "#166534",
          border: `1px solid ${toast.type === "error" ? "#fca5a5" : toast.type === "warning" ? "#fcd34d" : "#86efac"}`,
          fontWeight: "600",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="customer-products-header">
        <div>
          <h1>Dairy Products</h1>
          <p>Browse available farm-fresh dairy products and add to your cart.</p>
        </div>

        <div className="customer-products-count">
          <span>{filteredProducts.length}</span>
          <small>Products</small>
        </div>
      </div>

      {/* TOOLBAR (SEARCH + FILTER) */}
      <div className="customer-products-toolbar">
        <div className="customer-product-search">
          <span><FaSearch /></span>
          <input
            type="text"
            placeholder="Search milk, curd, paneer, butter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="customer-product-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {/* ERROR */}
      {error && (
        <div className="customer-login-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="customer-products-empty" style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "15px" }}>
          <FaBox style={{ fontSize: "48px", color: "#94a3b8", marginBottom: "15px" }} />
          <h2>No Products Found</h2>
          <p style={{ color: "#64748b" }}>No dairy products match your search query.</p>
        </div>
      ) : (
        <div className="customer-products-grid">
          {filteredProducts.map((product, index) => {
            const productId =
              product?.id || product?.productId || product?._id || `product-${index}`;

            const name = product?.name || product?.productName || "Dairy Product";
            const category = product?.category || "Dairy";
            const price = product?.price ?? product?.rate ?? 0;
            const unit = product?.unit || "L";
            const stock = Number(product?.stock ?? product?.quantity ?? 0);
            const image = product?.image || product?.imageUrl;

            const isOutOfStock = stock <= 0;
            const isAdding = addingId === productId;
            const isJustAdded = addedIds[productId];

            return (
              <div className="customer-product-card" key={productId}>
                {/* PRODUCT IMAGE CONTAINER */}
                <div className="customer-product-image">
                  <ProductIllustration name={name} category={category} image={image} />
                  {isOutOfStock && (
                    <span className="customer-product-unavailable">Out of Stock</span>
                  )}
                </div>

                {/* PRODUCT CONTENT */}
                <div className="customer-product-content">
                  <span className="customer-product-category">{category}</span>

                  <h2>{name}</h2>

                  <p>{product.description || "Fresh quality dairy product delivered straight from farm."}</p>

                  {/* PRICE & STOCK ROW */}
                  <div className="customer-product-price-row">
                    <div>
                      <strong>₹{price}</strong>
                      <span> / {unit}</span>
                    </div>

                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: isOutOfStock
                          ? "#dc2626"
                          : stock <= 10
                          ? "#d97706"
                          : "#166534",
                        background: isOutOfStock
                          ? "#fef2f2"
                          : stock <= 10
                          ? "#fffbeb"
                          : "#f0fdf4",
                        padding: "3px 8px",
                        borderRadius: "10px",
                      }}
                    >
                      {isOutOfStock ? "Out of Stock" : `Stock: ${stock}`}
                    </span>
                  </div>

                  {/* ADD TO CART BUTTON (STYLED WITH customer-product-order-button CLASS) */}
                  <button
                    type="button"
                    className="customer-product-order-button"
                    disabled={isAdding || isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    {isAdding ? (
                      "Adding..."
                    ) : isJustAdded ? (
                      <>
                        <FaCheckCircle style={{ marginRight: "6px" }} />
                        Added to Cart
                      </>
                    ) : isOutOfStock ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <FaShoppingCart style={{ marginRight: "6px" }} />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;