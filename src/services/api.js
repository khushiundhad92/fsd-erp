// ========================================
// API BASE URL
// ========================================

const API_BASE_URL = "http://localhost:5000/api";

// ========================================
// COMMON API REQUEST FUNCTION
// ========================================

const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    let data;

    try {
      data = await response.json();
    } catch (error) {
      data = {};
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

// ========================================
// AUTHENTICATION API
// ========================================

export const employeeLogin = async (email, password) => {
  return await apiRequest(
    `${API_BASE_URL}/auth/employee-login`,
    {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  );
};

export const employeeRegister = async (employeeData) => {
  return await apiRequest(
    `${API_BASE_URL}/auth/employee-register`,
    {
      method: "POST",
      body: JSON.stringify(employeeData),
    }
  );
};

export const adminLogin = async (email, password) => {
  return await apiRequest(
    `${API_BASE_URL}/auth/admin-login`,
    {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  );
};

// ========================================
// COW API
// ========================================

export const getCows = async () => {
  return await apiRequest(
    `${API_BASE_URL}/cows`
  );
};

export const addCow = async (cowData) => {
  return await apiRequest(
    `${API_BASE_URL}/cows`,
    {
      method: "POST",
      body: JSON.stringify(cowData),
    }
  );
};

export const updateCow = async (id, cowData) => {
  return await apiRequest(
    `${API_BASE_URL}/cows/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(cowData),
    }
  );
};

export const deleteCow = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/cows/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// MILK PRODUCTION API
// ========================================

export const getMilkProduction = async () => {
  return await apiRequest(
    `${API_BASE_URL}/milk-production`
  );
};

export const addMilkProduction = async (milkData) => {
  return await apiRequest(
    `${API_BASE_URL}/milk-production`,
    {
      method: "POST",
      body: JSON.stringify(milkData),
    }
  );
};

export const updateMilkProduction = async (
  id,
  milkData
) => {
  return await apiRequest(
    `${API_BASE_URL}/milk-production/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(milkData),
    }
  );
};

export const deleteMilkProduction = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/milk-production/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// EMPLOYEE API
// ========================================

export const getEmployees = async () => {
  return await apiRequest(
    `${API_BASE_URL}/employees`
  );
};

export const addEmployee = async (employeeData) => {
  return await apiRequest(
    `${API_BASE_URL}/employees`,
    {
      method: "POST",
      body: JSON.stringify(employeeData),
    }
  );
};

export const updateEmployee = async (
  id,
  employeeData
) => {
  return await apiRequest(
    `${API_BASE_URL}/employees/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(employeeData),
    }
  );
};

export const deleteEmployee = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/employees/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// CUSTOMER API
// ========================================

export const getCustomers = async () => {
  return await apiRequest(
    `${API_BASE_URL}/customers`
  );
};

export const addCustomer = async (customerData) => {
  return await apiRequest(
    `${API_BASE_URL}/customers`,
    {
      method: "POST",
      body: JSON.stringify(customerData),
    }
  );
};

export const updateCustomer = async (
  id,
  customerData
) => {
  return await apiRequest(
    `${API_BASE_URL}/customers/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(customerData),
    }
  );
};

export const deleteCustomer = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/customers/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// SALES API
// ========================================

export const getSales = async () => {
  return await apiRequest(
    `${API_BASE_URL}/sales`
  );
};

export const addSale = async (saleData) => {
  return await apiRequest(
    `${API_BASE_URL}/sales`,
    {
      method: "POST",
      body: JSON.stringify(saleData),
    }
  );
};

export const updateSale = async (
  id,
  saleData
) => {
  return await apiRequest(
    `${API_BASE_URL}/sales/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(saleData),
    }
  );
};

export const deleteSale = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/sales/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// ATTENDANCE API
// ========================================

export const getAttendance = async () => {
  return await apiRequest(
    `${API_BASE_URL}/attendance`
  );
};

export const addAttendance = async (
  attendanceData
) => {
  return await apiRequest(
    `${API_BASE_URL}/attendance`,
    {
      method: "POST",
      body: JSON.stringify(attendanceData),
    }
  );
};

export const updateAttendance = async (
  id,
  attendanceData
) => {
  return await apiRequest(
    `${API_BASE_URL}/attendance/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(attendanceData),
    }
  );
};

export const deleteAttendance = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/attendance/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// LEAVE API
// ========================================

export const getLeaves = async () => {
  return await apiRequest(
    `${API_BASE_URL}/leaves`
  );
};

export const addLeave = async (leaveData) => {
  return await apiRequest(
    `${API_BASE_URL}/leaves`,
    {
      method: "POST",
      body: JSON.stringify(leaveData),
    }
  );
};

export const updateLeave = async (
  id,
  leaveData
) => {
  return await apiRequest(
    `${API_BASE_URL}/leaves/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(leaveData),
    }
  );
};

export const deleteLeave = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/leaves/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// SALARY API
// ========================================

export const getSalaries = async () => {
  return await apiRequest(
    `${API_BASE_URL}/salaries`
  );
};

export const addSalary = async (salaryData) => {
  return await apiRequest(
    `${API_BASE_URL}/salaries`,
    {
      method: "POST",
      body: JSON.stringify(salaryData),
    }
  );
};

export const updateSalary = async (
  id,
  salaryData
) => {
  return await apiRequest(
    `${API_BASE_URL}/salaries/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(salaryData),
    }
  );
};

export const deleteSalary = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/salaries/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// WORK API
// ========================================

export const getWork = async () => {
  return await apiRequest(
    `${API_BASE_URL}/work`
  );
};

export const getMyWork = async () => {
  const token = localStorage.getItem("employeeToken");
  return await apiRequest(`${API_BASE_URL}/work/my-work`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const addWork = async (workData) => {
  return await apiRequest(
    `${API_BASE_URL}/work`,
    {
      method: "POST",
      body: JSON.stringify(workData),
    }
  );
};

export const updateWork = async (
  id,
  workData
) => {
  return await apiRequest(
    `${API_BASE_URL}/work/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(workData),
    }
  );
};

export const updateWorkStatus = async (id, status) => {
  const token = localStorage.getItem("employeeToken");
  return await apiRequest(`${API_BASE_URL}/work/${id}/status`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ status }),
  });
};

export const deleteWork = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/work/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// ORDER API
// ========================================

export const getOrders = async () => {
  return await apiRequest(
    `${API_BASE_URL}/orders`
  );
};

export const addOrder = async (orderData) => {
  return await apiRequest(
    `${API_BASE_URL}/orders`,
    {
      method: "POST",
      body: JSON.stringify(orderData),
    }
  );
};

export const updateOrder = async (
  id,
  orderData
) => {
  return await apiRequest(
    `${API_BASE_URL}/orders/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(orderData),
    }
  );
};

export const deleteOrder = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/orders/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// PAYMENT API
// ========================================

export const getPayments = async () => {
  return await apiRequest(
    `${API_BASE_URL}/payments`
  );
};

export const addPayment = async (
  paymentData
) => {
  return await apiRequest(
    `${API_BASE_URL}/payments`,
    {
      method: "POST",
      body: JSON.stringify(paymentData),
    }
  );
};

export const updatePayment = async (
  id,
  paymentData
) => {
  return await apiRequest(
    `${API_BASE_URL}/payments/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(paymentData),
    }
  );
};

export const deletePayment = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/payments/${id}`,
    {
      method: "DELETE",
    }
  );
};

// ========================================
// DASHBOARD API
// ========================================

export const getDashboardSummary = async () => {
  return await apiRequest(
    `${API_BASE_URL}/dashboard/summary`
  );
};


// ========================================
// EMPLOYEE PROFILE API
// ========================================

// GET EMPLOYEE PROFILE
export const getProfile = async (id) => {
  return await apiRequest(
    `${API_BASE_URL}/auth/employee-profile/${id}`
  );
};

// UPDATE EMPLOYEE PROFILE
export const updateProfile = async (
  id,
  profileData
) => {
  return await apiRequest(
    `${API_BASE_URL}/profile/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(profileData),
    }
  );
};