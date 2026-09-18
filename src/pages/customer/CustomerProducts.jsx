import {
  useEffect,
  useState,
} from "react";

import {
  FaSearch,
  FaShoppingCart,
  FaBox,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  getCustomerProducts,
  createCustomerOrder,
} from "../../api/customerApi";

import "./CustomerProducts.css";

/*
 * ============================================================
 * TEMPORARY STATIC PRODUCTS
 * ============================================================
 *
 * These products are displayed only when the backend/database
 * does not return any products.
 *
 * Later, when you add real products from the admin/backend,
 * they will automatically replace these static products.
 */

const STATIC_PRODUCTS = [
  {
    id: "static-milk",
    name: "Fresh Milk",
    category: "Milk",
    price: 60,
    unit: "L",
    stock: 25,
  },

  {
    id: "static-curd",
    name: "Fresh Curd",
    category: "Curd",
    price: 50,
    unit: "500g",
    stock: 20,
  },

  {
    id: "static-paneer",
    name: "Fresh Paneer",
    category: "Paneer",
    price: 90,
    unit: "250g",
    stock: 15,
  },

  {
    id: "static-butter",
    name: "Farm Fresh Butter",
    category: "Butter",
    price: 120,
    unit: "500g",
    stock: 12,
  },

  
];

const CustomerProducts = () => {
  /*
   * ==========================================================
   * STATE
   * ==========================================================
   */

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [orderingId, setOrderingId] = useState(null);

  /*
   * ==========================================================
   * LOAD PRODUCTS
   * ==========================================================
   */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getCustomerProducts();

        /*
         * Depending on your backend, products may be returned as:
         *
         * {
         *   products: [...]
         * }
         *
         * OR directly as:
         *
         * [...]
         */

        const apiProducts =
          data?.products ||
          data ||
          [];

        /*
         * If backend has real products,
         * show those products.
         *
         * If backend has no products,
         * show temporary static products.
         */

        if (
          Array.isArray(apiProducts) &&
          apiProducts.length > 0
        ) {
          setProducts(apiProducts);
        } else {
          setProducts(STATIC_PRODUCTS);
        }

      } catch (err) {
        console.error(
          "Products Error:",
          err
        );

        /*
         * If backend/API fails, still show
         * the temporary products.
         */

        setProducts(STATIC_PRODUCTS);

        /*
         * Keep the error message.
         *
         * If you don't want the error to appear
         * on screen during temporary testing,
         * you can remove this setError().
         */

        setError(
          err?.message ||
            "Unable to load products. Showing temporary products."
        );

      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /*
   * ==========================================================
   * SEARCH / FILTER PRODUCTS
   * ==========================================================
   */

  const filteredProducts =
    products.filter((product) => {
      const text = `
        ${product?.name || ""}
        ${product?.productName || ""}
        ${product?.category || ""}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  /*
   * ==========================================================
   * PLACE ORDER
   * ==========================================================
   */

  const handleOrder = async (product) => {
    /*
     * Get currently logged-in customer
     * from localStorage.
     */

    const customer = JSON.parse(
      localStorage.getItem(
        "customerUser"
      ) || "{}"
    );

    /*
     * Support different ID names
     * from your backend.
     */

    const productId =
      product?.id ||
      product?.productId ||
      product?._id;

    const customerId =
      customer?.id ||
      customer?.customerId ||
      customer?._id;

    /*
     * Prevent ordering if there is
     * no product ID.
     */

    if (!productId) {
      alert(
        "Product ID is missing."
      );
      return;
    }

    /*
     * Prevent ordering if customer
     * is not logged in.
     */

    if (!customerId) {
      alert(
        "Customer information is missing. Please login again."
      );
      return;
    }

    setOrderingId(productId);

    try {
      await createCustomerOrder({
        productId: productId,

        product:
          product?.name ||
          product?.productName ||
          "Dairy Product",

        quantity: 1,

        rate:
          product?.price ??
          product?.rate ??
          0,

        customerId: customerId,
      });

      alert(
        "Order placed successfully."
      );

    } catch (err) {
      console.error(
        "Order Error:",
        err
      );

      alert(
        err?.message ||
          "Unable to place order."
      );

    } finally {
      setOrderingId(null);
    }
  };

  /*
   * ==========================================================
   * LOADING SCREEN
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="customer-products-page">
        <h2>
          Loading products...
        </h2>
      </div>
    );
  }

  /*
   * ==========================================================
   * MAIN PAGE
   * ==========================================================
   */

  return (
    <div className="customer-products-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="customer-products-header">

        <div>
          <h1>
            Dairy Products
          </h1>

          <p>
            Browse available dairy products
            and place your order.
          </p>
        </div>

        {/* SEARCH */}

        <div className="customer-products-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="customer-login-error">

          <FaExclamationTriangle />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* =====================================================
          PRODUCTS
          ===================================================== */}

      {filteredProducts.length === 0 ? (

        /*
         * ====================================================
         * NO PRODUCTS
         * ====================================================
         */

        <div className="customer-products-empty">

          <FaBox />

          <h2>
            No Products Found
          </h2>

          <p>
            No dairy products are currently
            available.
          </p>

        </div>

      ) : (

        /*
         * ====================================================
         * PRODUCT GRID
         * ====================================================
         */

        <div className="customer-products-grid">

          {filteredProducts.map(
            (product, index) => {

              /*
               * Product ID
               */

              const productId =
                product?.id ||
                product?.productId ||
                product?._id ||
                `product-${index}`;

              /*
               * Product Name
               */

              const name =
                product?.name ||
                product?.productName ||
                "Dairy Product";

              /*
               * Category
               */

              const category =
                product?.category ||
                "Dairy";

              /*
               * Price
               */

              const price =
                product?.price ??
                product?.rate ??
                0;

              /*
               * Unit
               */

              const unit =
                product?.unit ||
                "L";

              /*
               * Stock
               */

              const stock =
                product?.stock ??
                product?.quantity ??
                0;

              /*
               * Image
               *
               * If your backend later provides an image,
               * it will automatically be displayed.
               */

              const image =
                product?.image ||
                product?.imageUrl;

              /*
               * Check stock
               */

              const isOutOfStock =
                Number(stock) <= 0;

              /*
               * Check ordering
               */

              const isOrdering =
                orderingId === productId;

              return (

                <div
                  className="customer-product-card"
                  key={productId}
                >

                  {/* =================================================
                      PRODUCT IMAGE
                      ================================================= */}

                  <div className="customer-product-image">

                    {image ? (

                      <img
                        src={image}
                        alt={name}
                      />

                    ) : (

                      <FaBox />

                    )}

                  </div>

                  {/* =================================================
                      PRODUCT CONTENT
                      ================================================= */}

                  <div className="customer-product-content">

                    {/* CATEGORY */}

                    <span className="customer-product-category">
                      {category}
                    </span>

                    {/* NAME */}

                    <h3>
                      {name}
                    </h3>

                    {/* DESCRIPTION */}

                    <p>
                      Fresh quality dairy
                      product.
                    </p>

                    {/* =================================================
                        PRICE + STOCK
                        ================================================= */}

                    <div className="customer-product-bottom">

                      <div>

                        <strong>
                          ₹{price}
                        </strong>

                        <span>
                          / {unit}
                        </span>

                      </div>

                      <span>
                        Stock: {stock}
                      </span>

                    </div>

                    {/* =================================================
                        ORDER BUTTON
                        ================================================= */}

                    <button
                      type="button"
                      disabled={
                        isOrdering ||
                        isOutOfStock
                      }
                      onClick={() =>
                        handleOrder(
                          product
                        )
                      }
                    >

                      <FaShoppingCart />

                      {isOrdering
                        ? "Ordering..."
                        : isOutOfStock
                        ? "Out of Stock"
                        : "Place Order"}

                    </button>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}

    </div>
  );
};

export default CustomerProducts;