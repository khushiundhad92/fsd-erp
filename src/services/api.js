// ======================================================
// UNIFIED API SERVICE FILE - DAIRY FARM ERP
// Contains ALL APIs for Admin, Employee, and Customer panels.
// ======================================================

const API_BASE_URL = "http://localhost:5000/api";

// ======================================================
// HELPER: GET STORED CUSTOMER TOKEN
// ======================================================
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
// HELPER: GET STORED EMPLOYEE TOKEN
// ======================================================
export const getStoredEmployeeToken = () => {
  return localStorage.getItem("employeeToken") || "";
};

// ======================================================
// COMMON API REQUEST FUNCTION
// ======================================================
const apiRequest = async (endpointOrUrl, options = {}) => {
  try {
    const url = endpointOrUrl.startsWith("http")
      ? endpointOrUrl
      : `${API_BASE_URL}${endpointOrUrl}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Auto-attach customer token if available and not present
    const customerToken = getStoredCustomerToken();
    if (customerToken && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${customerToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data = {};
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (err) {
        data = {};
      }
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
    console.error("API ERROR:", error);
    throw error;
  }
};


// ======================================================
// 1. AUTHENTICATION APIs
// ======================================================

export const employeeLogin = async (email, password) => {
  return await apiRequest("/auth/employee-login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });
};

export const employeeRegister = async (employeeData) => {
  return await apiRequest("/auth/employee-register", {
    method: "POST",
    body: JSON.stringify(employeeData),
  });
};

export const adminLogin = async (email, password) => {
  return await apiRequest("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });
};

export const registerCustomer = async (customerData) => {
  return await apiRequest("/customer-auth/register", {
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

export const logoutCustomer = () => {
  localStorage.removeItem("customerToken");
  localStorage.removeItem("token");
  localStorage.removeItem("customerAuthToken");
  localStorage.removeItem("customerUser");
  localStorage.removeItem("customerLoggedIn");
};


// ======================================================
// 2. COW APIs
// ======================================================

export const getCows = async () => {
  return await apiRequest("/cows");
};

export const addCow = async (cowData) => {
  return await apiRequest("/cows", {
    method: "POST",
    body: JSON.stringify(cowData),
  });
};

export const updateCow = async (id, cowData) => {
  return await apiRequest(`/cows/${id}`, {
    method: "PUT",
    body: JSON.stringify(cowData),
  });
};

export const deleteCow = async (id) => {
  return await apiRequest(`/cows/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 3. MILK PRODUCTION APIs
// ======================================================

export const getMilkProduction = async () => {
  return await apiRequest("/milk-production");
};

export const addMilkProduction = async (milkData) => {
  return await apiRequest("/milk-production", {
    method: "POST",
    body: JSON.stringify(milkData),
  });
};

export const updateMilkProduction = async (id, milkData) => {
  return await apiRequest(`/milk-production/${id}`, {
    method: "PUT",
    body: JSON.stringify(milkData),
  });
};

export const deleteMilkProduction = async (id) => {
  return await apiRequest(`/milk-production/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 4. EMPLOYEE MANAGEMENT APIs
// ======================================================

export const getEmployees = async () => {
  return await apiRequest("/employees");
};

export const addEmployee = async (employeeData) => {
  return await apiRequest("/employees", {
    method: "POST",
    body: JSON.stringify(employeeData),
  });
};

export const updateEmployee = async (id, employeeData) => {
  return await apiRequest(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employeeData),
  });
};

export const deleteEmployee = async (id) => {
  return await apiRequest(`/employees/${id}`, {
    method: "DELETE",
  });
};

export const getProfile = async (id) => {
  return await apiRequest(`/auth/employee-profile/${id}`);
};

export const updateProfile = async (id, profileData) => {
  return await apiRequest(`/profile/${id}`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};


// ======================================================
// 5. CUSTOMER MANAGEMENT APIs (ADMIN)
// ======================================================

export const getCustomers = async () => {
  return await apiRequest("/customers");
};

export const addCustomer = async (customerData) => {
  return await apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
};

export const updateCustomer = async (id, customerData) => {
  return await apiRequest(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
  });
};

export const deleteCustomer = async (id) => {
  return await apiRequest(`/customers/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 6. CUSTOMER PORTAL APIs
// ======================================================

export const getCustomerDashboard = async () => {
  return await apiRequest("/customer-panel/dashboard", {
    method: "GET",
  });
};

export const getCustomerProducts = async () => {
  return await apiRequest("/products", {
    method: "GET",
  });
};

export const getCustomerCart = async () => {
  return await apiRequest("/customer/cart", {
    method: "GET",
  });
};

export const addToCustomerCart = async (productId, quantity = 1) => {
  return await apiRequest("/customer/cart/add", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const updateCustomerCartQuantity = async (productId, quantity) => {
  return await apiRequest("/customer/cart/item", {
    method: "PUT",
    body: JSON.stringify({ productId, quantity }),
  });
};

export const removeCustomerCartItem = async (productId) => {
  return await apiRequest(`/customer/cart/item/${productId}`, {
    method: "DELETE",
  });
};

export const clearCustomerCart = async () => {
  return await apiRequest("/customer/cart/clear", {
    method: "DELETE",
  });
};

export const getCustomerProfile = async () => {
  return await apiRequest("/customer/profile", {
    method: "GET",
  });
};

export const updateCustomerProfile = async (profileData) => {
  return await apiRequest("/customer/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

export const getCustomerOrders = async () => {
  return await apiRequest("/customer/orders", {
    method: "GET",
  });
};

export const createCustomerOrder = async (orderData) => {
  return await apiRequest("/customer/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const checkoutCustomerOrder = async () => {
  return await apiRequest("/customer/orders/checkout", {
    method: "POST",
  });
};

export const getCustomerOrderById = async (orderId) => {
  return await apiRequest(`/customer/orders/${orderId}`, {
    method: "GET",
  });
};

export const getCustomerPayments = async () => {
  return await apiRequest("/customer/payments", {
    method: "GET",
  });
};

export const createCustomerPayment = async (paymentData) => {
  return await apiRequest("/customer/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
};

export const getCustomerPaymentById = async (paymentId) => {
  return await apiRequest(`/customer/payments/${paymentId}`, {
    method: "GET",
  });
};

export const getCustomerSales = async () => {
  return await apiRequest("/customer/sales", {
    method: "GET",
  });
};

export const getCustomerSaleById = async (saleId) => {
  return await apiRequest(`/customer/sales/${saleId}`, {
    method: "GET",
  });
};


// ======================================================
// 7. SALES APIs
// ======================================================

export const getSales = async () => {
  return await apiRequest("/sales");
};

export const addSale = async (saleData) => {
  return await apiRequest("/sales", {
    method: "POST",
    body: JSON.stringify(saleData),
  });
};

export const updateSale = async (id, saleData) => {
  return await apiRequest(`/sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(saleData),
  });
};

export const deleteSale = async (id) => {
  return await apiRequest(`/sales/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 8. ATTENDANCE APIs
// ======================================================

export const getAttendance = async () => {
  return await apiRequest("/attendance");
};

export const addAttendance = async (attendanceData) => {
  return await apiRequest("/attendance", {
    method: "POST",
    body: JSON.stringify(attendanceData),
  });
};

export const updateAttendance = async (id, attendanceData) => {
  return await apiRequest(`/attendance/${id}`, {
    method: "PUT",
    body: JSON.stringify(attendanceData),
  });
};

export const deleteAttendance = async (id) => {
  return await apiRequest(`/attendance/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 9. LEAVE APIs
// ======================================================

export const getLeaves = async () => {
  return await apiRequest("/leaves");
};

export const addLeave = async (leaveData) => {
  return await apiRequest("/leaves", {
    method: "POST",
    body: JSON.stringify(leaveData),
  });
};

export const updateLeave = async (id, leaveData) => {
  return await apiRequest(`/leaves/${id}`, {
    method: "PUT",
    body: JSON.stringify(leaveData),
  });
};

export const deleteLeave = async (id) => {
  return await apiRequest(`/leaves/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 10. SALARY APIs
// ======================================================

export const getSalaries = async () => {
  return await apiRequest("/salaries");
};

export const addSalary = async (salaryData) => {
  return await apiRequest("/salaries", {
    method: "POST",
    body: JSON.stringify(salaryData),
  });
};

export const updateSalary = async (id, salaryData) => {
  return await apiRequest(`/salaries/${id}`, {
    method: "PUT",
    body: JSON.stringify(salaryData),
  });
};

export const deleteSalary = async (id) => {
  return await apiRequest(`/salaries/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 11. WORK APIs
// ======================================================

export const getWork = async () => {
  return await apiRequest("/work");
};

export const getMyWork = async () => {
  const token = getStoredEmployeeToken();
  return await apiRequest("/work/my-work", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const addWork = async (workData) => {
  return await apiRequest("/work", {
    method: "POST",
    body: JSON.stringify(workData),
  });
};

export const updateWork = async (id, workData) => {
  return await apiRequest(`/work/${id}`, {
    method: "PUT",
    body: JSON.stringify(workData),
  });
};

export const updateWorkStatus = async (id, status) => {
  const token = getStoredEmployeeToken();
  return await apiRequest(`/work/${id}/status`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ status }),
  });
};

export const deleteWork = async (id) => {
  return await apiRequest(`/work/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 12. ORDER APIs (ADMIN)
// ======================================================

export const getOrders = async () => {
  return await apiRequest("/orders");
};

export const addOrder = async (orderData) => {
  return await apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const updateOrder = async (id, orderData) => {
  return await apiRequest(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
};

export const deleteOrder = async (id) => {
  return await apiRequest(`/orders/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 13. PAYMENT APIs (ADMIN)
// ======================================================

export const getPayments = async () => {
  return await apiRequest("/payments");
};

export const addPayment = async (paymentData) => {
  return await apiRequest("/payments", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
};

export const updatePayment = async (id, paymentData) => {
  return await apiRequest(`/payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(paymentData),
  });
};

export const deletePayment = async (id) => {
  return await apiRequest(`/payments/${id}`, {
    method: "DELETE",
  });
};


// ======================================================
// 14. DASHBOARD APIs
// ======================================================

export const getDashboardSummary = async () => {
  return await apiRequest("/dashboard/summary");
};