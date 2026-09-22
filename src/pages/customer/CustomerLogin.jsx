import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./CustomerLogin.css";

import { loginCustomer } from "../../services/api";

const CustomerLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------
      // SEND LOGIN DATA TO CUSTOMER DATABASE API
      // ------------------------------------------

      const data = await loginCustomer(
        email.trim(),
        password
      );

      // ------------------------------------------
      // CHECK LOGIN RESPONSE
      // ------------------------------------------

      if (!data) {
        throw new Error(
          "No response received from server."
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      // ------------------------------------------
      // SAVE CUSTOMER JWT TOKEN
      // ------------------------------------------

      const token =
        data.token ||
        data.accessToken ||
        data.jwt;

      if (!token) {
        throw new Error(
          "Login successful but token was not received."
        );
      }

      localStorage.setItem(
        "customerToken",
        token
      );

      // ------------------------------------------
      // SAVE CUSTOMER INFORMATION
      // ------------------------------------------

      const customer =
        data.customer ||
        data.user ||
        data.data;

      if (customer) {
        localStorage.setItem(
          "customerUser",
          JSON.stringify(customer)
        );
      }

      // ------------------------------------------
      // CUSTOMER LOGIN STATUS
      // ------------------------------------------

      localStorage.setItem(
        "customerLoggedIn",
        "true"
      );

      // ------------------------------------------
      // REDIRECT CUSTOMER
      // ------------------------------------------

      navigate("/customer", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Customer Login Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-page">

      <div className="customer-login-card">

        <div className="customer-login-logo">
          <FaSignInAlt />
        </div>

        <div className="customer-login-heading">
          <h1>Customer Login</h1>

          <p>
            Sign in to manage your dairy orders
          </p>
        </div>

        {error && (
          <div className="customer-login-error">
            <FaExclamationTriangle />

            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="customer-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <div className="customer-input-wrapper">

              <span className="customer-input-icon">
                <FaEnvelope />
              </span>

              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="customer-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="customer-input-wrapper">

              <span className="customer-input-icon">
                <FaLock />
              </span>

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="customer-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>

          {/* OPTIONS */}

          <div className="customer-login-options">

            <label className="customer-remember-me">

              <input
                type="checkbox"
                id="rememberMe"
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              className="customer-forgot-password"
              onClick={() =>
                setError(
                  "Please contact the dairy farm administrator to reset your password."
                )
              }
            >
              Forgot Password?
            </button>

          </div>

          {/* LOGIN */}

          <button
            type="submit"
            className="customer-login-button"
            disabled={loading}
          >
            {loading ? (
              "Signing In..."
            ) : (
              <>
                <FaSignInAlt />
                Sign In
              </>
            )}
          </button>

        </form>

        {/* REGISTER */}

        <div className="customer-register-section">

          <p>
            Don't have an account?
          </p>

          <button
            type="button"
            className="customer-register-button"
            onClick={() =>
              navigate(
                "/customer/register"
              )
            }
          >
            <FaUserPlus />
            Create Account
          </button>

        </div>

        <div className="customer-login-footer">
          © 2026 Dairy Farm Management System
        </div>

      </div>

    </div>
  );
};

export default CustomerLogin;