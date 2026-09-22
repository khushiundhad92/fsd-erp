import { useEffect, useState } from "react";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../../services/api";

import "./CustomerProfile.css";

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // LOAD CUSTOMER PROFILE
  // ======================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const storedCustomer = JSON.parse(
          localStorage.getItem("customerUser") || "{}"
        );

        const response = await getCustomerProfile();

        const customer =
          response?.customer ||
          response?.profile ||
          response?.data ||
          storedCustomer;

        const customerProfile = {
          name:
            customer?.name ||
            storedCustomer?.name ||
            "",

          email:
            customer?.email ||
            storedCustomer?.email ||
            "",

          phone:
            customer?.phone ||
            storedCustomer?.phone ||
            "",

          address:
            customer?.address || "",

          city:
            customer?.city || "",

          state:
            customer?.state || "",

          pincode:
            customer?.pincode || "",
        };

        setProfile(customerProfile);
        setFormData(customerProfile);

        // Keep latest customer information
        // in localStorage for the Topbar.
        localStorage.setItem(
          "customerUser",
          JSON.stringify(customerProfile)
        );
      } catch (err) {
        console.error(
          "Customer Profile Error:",
          err
        );

        // If API is not available,
        // still show login customer data.
        try {
          const storedCustomer = JSON.parse(
            localStorage.getItem(
              "customerUser"
            ) || "{}"
          );

          if (storedCustomer.name) {
            const fallbackProfile = {
              name:
                storedCustomer.name || "",

              email:
                storedCustomer.email || "",

              phone:
                storedCustomer.phone || "",

              address:
                storedCustomer.address || "",

              city:
                storedCustomer.city || "",

              state:
                storedCustomer.state || "",

              pincode:
                storedCustomer.pincode || "",
            };

            setProfile(fallbackProfile);
            setFormData(fallbackProfile);
          } else {
            setError(
              err.message ||
                "Unable to load customer profile."
            );
          }
        } catch {
          setError(
            "Unable to load customer profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // EDIT PROFILE
  // ======================================================

  const handleEdit = () => {
    setSuccess("");
    setError("");

    setFormData(profile);

    setEditing(true);
  };

  // ======================================================
  // CANCEL EDIT
  // ======================================================

  const handleCancel = () => {
    setFormData(profile);

    setError("");
    setSuccess("");

    setEditing(false);
  };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      const response =
        await updateCustomerProfile({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        });

      const updatedCustomer =
        response?.customer ||
        response?.profile ||
        response?.data ||
        formData;

      const finalProfile = {
        name:
          updatedCustomer.name ||
          formData.name,

        email:
          updatedCustomer.email ||
          formData.email,

        phone:
          updatedCustomer.phone ||
          formData.phone,

        address:
          updatedCustomer.address ||
          formData.address,

        city:
          updatedCustomer.city ||
          formData.city,

        state:
          updatedCustomer.state ||
          formData.state,

        pincode:
          updatedCustomer.pincode ||
          formData.pincode,
      };

      setProfile(finalProfile);
      setFormData(finalProfile);

      // Update Topbar customer name.
      localStorage.setItem(
        "customerUser",
        JSON.stringify(finalProfile)
      );

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );

      // Refresh other components
      window.dispatchEvent(
        new Event("customerProfileUpdated")
      );
    } catch (err) {
      console.error(
        "Update Customer Profile Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="customer-profile-page">
        <div className="customer-profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  // ======================================================
  // PROFILE PAGE
  // ======================================================

  return (
    <div className="customer-profile-page">

      {/* PAGE HEADER */}

      <div className="customer-profile-page-header">
        <div>
          <h1>My Profile</h1>

          <p>
            Manage your customer information and
            account details.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="customer-profile-edit-button"
            onClick={handleEdit}
          >
            <FaEdit />
            Edit Profile
          </button>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="customer-profile-message error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="customer-profile-message success">
          {success}
        </div>
      )}

      {/* PROFILE CARD */}

      <div className="customer-profile-main-card">

        {/* PROFILE HEADER */}

        <div className="customer-profile-card-header">

          <div className="customer-profile-avatar">
            <FaUser />
          </div>

          <div className="customer-profile-user-info">
            <h2>
              {profile.name || "Customer"}
            </h2>

            <p>
              Customer Account
            </p>
          </div>

        </div>

        {/* VIEW MODE */}

        {!editing && (
          <div className="customer-profile-details">

            {/* NAME */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaUser />
              </div>

              <div>
                <span>Full Name</span>

                <strong>
                  {profile.name || "Not provided"}
                </strong>
              </div>

            </div>

            {/* EMAIL */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email Address</span>

                <strong>
                  {profile.email || "Not provided"}
                </strong>
              </div>

            </div>

            {/* PHONE */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaPhone />
              </div>

              <div>
                <span>Phone Number</span>

                <strong>
                  {profile.phone || "Not provided"}
                </strong>
              </div>

            </div>

            {/* ADDRESS */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <span>Address</span>

                <strong>
                  {profile.address || "Not provided"}
                </strong>
              </div>

            </div>

            {/* CITY */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <span>City</span>

                <strong>
                  {profile.city || "Not provided"}
                </strong>
              </div>

            </div>

            {/* STATE */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <span>State</span>

                <strong>
                  {profile.state || "Not provided"}
                </strong>
              </div>

            </div>

            {/* PINCODE */}

            <div className="customer-profile-detail">

              <div className="customer-profile-detail-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <span>PIN Code</span>

                <strong>
                  {profile.pincode || "Not provided"}
                </strong>
              </div>

            </div>

          </div>
        )}

        {/* EDIT MODE */}

        {editing && (
          <form
            className="customer-profile-form"
            onSubmit={handleSave}
          >

            <div className="customer-profile-form-grid">

              {/* NAME */}

              <div className="customer-profile-form-group">

                <label>
                  Full Name
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaUser />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="customer-profile-form-group">

                <label>
                  Email Address
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaEnvelope />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="customer-profile-form-group">

                <label>
                  Phone Number
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaPhone />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="customer-profile-form-group full-width">

                <label>
                  Address
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />

                </div>

              </div>

              {/* CITY */}

              <div className="customer-profile-form-group">

                <label>
                  City
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />

                </div>

              </div>

              {/* STATE */}

              <div className="customer-profile-form-group">

                <label>
                  State
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />

                </div>

              </div>

              {/* PINCODE */}

              <div className="customer-profile-form-group">

                <label>
                  PIN Code
                </label>

                <div className="customer-profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter PIN code"
                  />

                </div>

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="customer-profile-form-actions">

              <button
                type="button"
                className="customer-profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                <FaTimes />
                Cancel
              </button>

              <button
                type="submit"
                className="customer-profile-save-button"
                disabled={saving}
              >
                <FaSave />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        )}

      </div>

      {/* ACCOUNT INFORMATION */}

      <div className="customer-profile-info-box">

        <div className="customer-profile-info-icon">
          <FaUser />
        </div>

        <div>
          <h3>
            Customer Account
          </h3>

          <p>
            Your profile information is used
            to manage your dairy orders,
            payments and account activity.
          </p>
        </div>

      </div>

    </div>
  );
};

export default CustomerProfile;