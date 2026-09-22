
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/home/Home";

// ======================================================
// ADMIN IMPORTS
// ======================================================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CowManagement from "./pages/admin/CowManagement";
import MilkProduction from "./pages/admin/MilkProduction";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import Sales from "./pages/admin/Sales";

// ======================================================
// EMPLOYEE IMPORTS
// ======================================================

import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeRegister from "./pages/employee/EmployeeRegister";
import EmployeeLayout from "./pages/employee/EmployeeLayout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeMyWork from "./pages/employee/EmployeeMyWork";
import EmployeeLeave from "./pages/employee/EmployeeLeave";
import EmployeeSalary from "./pages/employee/EmployeeSalary";
import EmployeeProfile from "./pages/employee/EmployeeProfile";

// ======================================================
// CUSTOMER IMPORTS
// ======================================================

import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProducts from "./pages/customer/CustomerProducts";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerProfile from "./pages/customer/CustomerProfile";

// ======================================================
// ADMIN PROTECTION
// ======================================================

function ProtectedAdmin({ children }) {
  const loggedIn =
    localStorage.getItem("adminLoggedIn") === "true";

  if (loggedIn) {
    return children;
  }

  return (
    <Navigate
      to="/admin/login"
      replace
    />
  );
}

// ======================================================
// EMPLOYEE PROTECTION
// ======================================================

function ProtectedEmployee({ children }) {
  const loggedIn =
    localStorage.getItem("employeeLoggedIn") === "true";

  if (loggedIn) {
    return children;
  }

  return (
    <Navigate
      to="/employee/login"
      replace
    />
  );
}

// ======================================================
// CUSTOMER PROTECTION
// ======================================================

function ProtectedCustomer({ children }) {
  const loggedIn =
    localStorage.getItem("customerLoggedIn") === "true";

  const token =
    localStorage.getItem("customerToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("customerAuthToken");

  if (loggedIn && token) {
    return children;
  }

  localStorage.removeItem("customerLoggedIn");
  localStorage.removeItem("customerUser");

  return (
    <Navigate
      to="/customer/login"
      replace
    />
  );
}

// ======================================================
// ADMIN PAGE WRAPPER
// ======================================================

function AdminPage({ children }) {
  return (
    <ProtectedAdmin>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedAdmin>
  );
}

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <Routes>

      {/* ==================================================
          HOME / COVER PAGE
      ================================================== */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* ==================================================
          ADMIN ROUTES
      ================================================== */}

      {/* ADMIN LOGIN */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* ADMIN DASHBOARD */}

      <Route
        path="/admin/dashboard"
        element={
          <AdminPage>
            <AdminDashboard />
          </AdminPage>
        }
      />


      {/* ADMIN DEFAULT */}

      <Route
        path="/admin"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />


      {/* COW MANAGEMENT */}

      <Route
        path="/admin/cows"
        element={
          <AdminPage>
            <CowManagement />
          </AdminPage>
        }
      />


      {/* MILK PRODUCTION */}

      <Route
        path="/admin/milk-production"
        element={
          <AdminPage>
            <MilkProduction />
          </AdminPage>
        }
      />


      {/* EMPLOYEE MANAGEMENT */}

      <Route
        path="/admin/employees"
        element={
          <AdminPage>
            <EmployeeManagement />
          </AdminPage>
        }
      />


      {/* CUSTOMER MANAGEMENT */}

      <Route
        path="/admin/customers"
        element={
          <AdminPage>
            <CustomerManagement />
          </AdminPage>
        }
      />


      {/* SALES */}

      <Route
        path="/admin/sales"
        element={
          <AdminPage>
            <Sales />
          </AdminPage>
        }
      />


      {/* ==================================================
          EMPLOYEE ROUTES
      ================================================== */}

      {/* EMPLOYEE LOGIN */}

      <Route
        path="/employee/login"
        element={<EmployeeLogin />}
      />


      {/* EMPLOYEE REGISTER */}

      <Route
        path="/employee/register"
        element={<EmployeeRegister />}
      />


      {/* EMPLOYEE PROTECTED LAYOUT */}

      <Route
        path="/employee"
        element={
          <ProtectedEmployee>
            <EmployeeLayout />
          </ProtectedEmployee>
        }
      >

        {/* EMPLOYEE DASHBOARD */}

        <Route
          index
          element={<EmployeeDashboard />}
        />


        {/* MY WORK */}

        <Route
          path="work"
          element={<EmployeeMyWork />}
        />


        {/* LEAVE */}

        <Route
          path="leave"
          element={<EmployeeLeave />}
        />


        {/* SALARY */}

        <Route
          path="salary"
          element={<EmployeeSalary />}
        />


        {/* PROFILE */}

        <Route
          path="profile"
          element={<EmployeeProfile />}
        />

      </Route>


      {/* ==================================================
          CUSTOMER ROUTES
      ================================================== */}

      {/* CUSTOMER LOGIN */}

      <Route
        path="/customer/login"
        element={<CustomerLogin />}
      />


      {/* CUSTOMER REGISTER */}

      <Route
        path="/customer/register"
        element={<CustomerRegister />}
      />


      {/* CUSTOMER PROTECTED LAYOUT */}

      <Route
        path="/customer"
        element={
          <ProtectedCustomer>
            <CustomerLayout />
          </ProtectedCustomer>
        }
      >

        {/* CUSTOMER DASHBOARD */}

        <Route
          index
          element={<CustomerDashboard />}
        />


        {/* PRODUCTS */}

        <Route
          path="products"
          element={<CustomerProducts />}
        />


        {/* ORDERS */}

        <Route
          path="orders"
          element={<CustomerOrders />}
        />


        {/* PAYMENTS */}

        <Route
          path="payments"
          element={<CustomerPayments />}
        />


        {/* PROFILE */}

        <Route
          path="profile"
          element={<CustomerProfile />}
        />

      </Route>


      {/* ==================================================
          UNKNOWN URL
      ================================================== */}

      <Route
        path="*"
        element={<Home />}
      />

    </Routes>
  );
}

export default App;
