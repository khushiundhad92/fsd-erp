const API_BASE_URL = "http://localhost:5000/api";

// Helper to get stored token reliably across all possible storage keys
export const getStoredCustomerToken = () => {
  let token =
    localStorage.getItem("customerToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("customerAuthToken") ||
    sessionStorage.getItem("customerToken") ||
    sessionStorage.getItem("token");

  if (!token) {
    try {
      const userStr = localStorage.getItem("customerUser");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        token = userObj.token || userObj.accessToken || userObj.jwt;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  return token || "";
};

// ======================================================
// COMMON CUSTOMER API REQUEST
// ======================================================

const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getStoredCustomerToken();

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data = {};

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("CUSTOMER API ERROR:", error);
    throw error;
  }
};

// ======================================================
// CUSTOMER REGISTER
// ======================================================

export const registerCustomer = async (customerData) => {
  return apiRequest("/customer-auth/register", {
    method: "POST",

    body: JSON.stringify({
      name: customerData.name?.trim() || "",
      email: customerData.email?.trim().toLowerCase() || "",
      phone: customerData.phone?.trim() || "",
      password: customerData.password || "",
      confirmPassword: customerData.confirmPassword || "",
    }),
  });
};

// ======================================================
// CUSTOMER LOGIN
// ======================================================

export const loginCustomer = async (email, password) => {
  const data = await apiRequest("/customer-auth/login", {
    method: "POST",

    body: JSON.stringify({
      email: email?.trim().toLowerCase() || "",
      password: password || "",
    }),
  });

  const token = data.token || data.accessToken || data.jwt;

  if (token) {
    localStorage.setItem("customerToken", token);
    localStorage.setItem("token", token);
    localStorage.setItem("customerAuthToken", token);
  }

  const customer = data.customer || data.user || data.data;

  if (customer) {
    localStorage.setItem("customerUser", JSON.stringify(customer));
  }

  localStorage.setItem("customerLoggedIn", "true");

  return data;
};

// ======================================================
// CUSTOMER LOGOUT
// ======================================================

export const logoutCustomer = () => {
  localStorage.removeItem("customerToken");
  localStorage.removeItem("token");
  localStorage.removeItem("customerAuthToken");
  localStorage.removeItem("customerUser");
  localStorage.removeItem("customerLoggedIn");
};

// ======================================================
// CUSTOMER DASHBOARD
// ======================================================

export const getCustomerDashboard = async () => {
  return apiRequest("/customer-panel/dashboard", {
    method: "GET",
  });
};

// ======================================================
// CUSTOMER PRODUCTS
// ======================================================

export const getCustomerProducts = async () => {
  return apiRequest("/products", {
    method: "GET",
  });
};

// ======================================================
// CUSTOMER CART
// ======================================================

export const getCustomerCart = async () => {
  return apiRequest("/customer/cart", {
    method: "GET",
  });
};

export const addToCustomerCart = async (productId, quantity = 1) => {
  return apiRequest("/customer/cart/add", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const updateCustomerCartQuantity = async (productId, quantity) => {
  return apiRequest("/customer/cart/item", {
    method: "PUT",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const removeCustomerCartItem = async (productId) => {
  return apiRequest(`/customer/cart/item/${productId}`, {
    method: "DELETE",
  });
};

export const clearCustomerCart = async () => {
  return apiRequest("/customer/cart/clear", {
    method: "DELETE",
  });
};

// ======================================================
// CUSTOMER PROFILE
// ======================================================

export const getCustomerProfile = async () => {
  return apiRequest("/customer/profile", {
    method: "GET",
  });
};

export const updateCustomerProfile = async (profileData) => {
  return apiRequest("/customer/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// ======================================================
// CUSTOMER ORDERS
// ======================================================

export const getCustomerOrders = async () => {
  return apiRequest("/customer/orders", {
    method: "GET",
  });
};

export const createCustomerOrder = async (orderData) => {
  return apiRequest("/customer/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const checkoutCustomerOrder = async () => {
  return apiRequest("/customer/orders/checkout", {
    method: "POST",
  });
};

export const getCustomerOrderById = async (orderId) => {
  return apiRequest(`/customer/orders/${orderId}`, {
    method: "GET",
  });
};

// ======================================================
// CUSTOMER PAYMENTS
// ======================================================

export const getCustomerPayments = async () => {
  return apiRequest("/customer/payments", {
    method: "GET",
  });
};

export const createCustomerPayment = async (paymentData) => {
  return apiRequest("/customer/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
};

export const getCustomerPaymentById = async (paymentId) => {
  return apiRequest(`/customer/payments/${paymentId}`, {
    method: "GET",
  });
};

// ======================================================
// CUSTOMER SALES
// ======================================================

export const getCustomerSales = async () => {
  return apiRequest("/customer/sales", {
    method: "GET",
  });
};

export const getCustomerSaleById = async (saleId) => {
  return apiRequest(`/customer/sales/${saleId}`, {
    method: "GET",
  });
};