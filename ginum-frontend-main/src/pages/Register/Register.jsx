import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaArrowLeft } from "react-icons/fa";
import api from "../../utils/api";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../../components/Alert/Alert";

const Register = () => {
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [currencyError, setCurrencyError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countryError, setCountryError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploadMessage, setLogoUploadMessage] = useState('');

  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: null,
    companyCategory: "",
    registrationNo: "",
    tinNo: "",
    vatNo: "",
    phoneNo: "",
    mobileNo: "",
    registeredAddress: "",
    factoryAddress: "",
    country: "",
    currency: "",
    email: "",
    website: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const COMPANY_CATEGORIES = [
    { value: "EDUCATION_AND_EDTECH", label: "Education and EdTech" },
    { value: "FINANCE", label: "Finance" },
    { value: "CREATIVE_AND_DESIGN", label: "Creative and Design" },
    { value: "REAL_ESTATE_AND_PROPERTY_MANAGEMENT", label: "Real Estate and Property Management" },
    { value: "CONSTRUCTION_AND_ENGINEERING", label: "Construction and Engineering" },
    { value: "HOSPITALITY_AND_TOURISM", label: "Hospitality and Tourism" },
    { value: "IT_AND_TECHNOLOGY", label: "IT and Technology" },
    { value: "MARKETING_AND_E_COMMERCE", label: "Marketing and E-Commerce" },
    { value: "MANUFACTURING_AND_LOGISTICS", label: "Manufacturing and Logistics" },
    { value: "HEALTHCARE_AND_LIFE_SCIENCES", label: "Healthcare and Life Sciences" },
    { value: "PROFESSIONAL_SERVICES", label: "Professional Services" }
  ];

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        setCountryError(null);
        const response = await api.get("/api/countries");
        let countriesData = [];
        if (Array.isArray(response)) {
          countriesData = response;
        } else if (Array.isArray(response.data)) {
          countriesData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          countriesData = response.data.data;
        }
        if (!Array.isArray(countriesData) || countriesData.length === 0) {
          throw new Error("Invalid countries data format");
        }
        setCountries(countriesData);
      } catch (error) {
        console.error("Country fetch error:", error);
        setCountryError(error.message);
        setCountries([
          { id: 1, name: "United States" },
          { id: 2, name: "Canada" },
          { id: 3, name: "United Kingdom" },
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        setCurrencyError(null);
        const response = await api.get("/api/currencies");
        let currenciesData = [];
        if (Array.isArray(response)) {
          currenciesData = response;
        } else if (Array.isArray(response.data)) {
          currenciesData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          currenciesData = response.data.data;
        }
        if (!Array.isArray(currenciesData) || currenciesData.length === 0) {
          throw new Error("Invalid currencies data format");
        }
        setCurrencies(currenciesData);
      } catch (error) {
        console.error("Currency fetch error:", error);
        setCurrencyError(error.message);
        setCurrencies([
          { id: 1, code: "USD", name: "US Dollar" },
          { id: 2, code: "EUR", name: "Euro" },
          { id: 3, code: "GBP", name: "British Pound" },
        ]);
      } finally {
        setLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.companyCategory) newErrors.companyCategory = "Company Category is required";
    if (isVatRegistered && !formData.vatNo) newErrors.vatNo = "VAT No. is required";
    if (!formData.phoneNo) newErrors.phoneNo = "Phone No. is required";
    if (!formData.registeredAddress) newErrors.registeredAddress = "Registered Address is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.currency) newErrors.currency = "Currency is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const registrationData = {
        companyName: formData.companyName,
        companyCategory: formData.companyCategory,
        email: formData.email,
        password: formData.password,
        phoneNo: formData.phoneNo,
        companyRegisteredAddress: formData.registeredAddress,
        countryName: formData.country,
        currencyCode: formData.currency,
        dateJoined: new Date().toISOString().split("T")[0],
        packageId: 1,
        isVatRegistered: isVatRegistered,
        ...(formData.registrationNo && { companyRegNo: formData.registrationNo }),
        ...(formData.tinNo && { tinNo: formData.tinNo }),
        ...(isVatRegistered && formData.vatNo && { vatNo: formData.vatNo }),
        ...(formData.mobileNo && { mobileNo: formData.mobileNo }),
        ...(formData.factoryAddress && { companyFactoryAddress: formData.factoryAddress }),
        ...(formData.website && { websiteUrl: formData.website }),
      };

      const formDataToSend = new FormData();
      if (logoFile) {
        formDataToSend.append("companyLogo", logoFile);
      }
      Object.entries(registrationData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      await api.post("/api/companies/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.success("Registration successful! Please log in.");
      setTimeout(() => {
        navigate("/ginum-login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLogoUploadMessage('File size must be less than 2 MB');
        setLogoFile(null);
        return;
      }
      setLogoFile(file);
      setLogoUploadMessage(`✓ Logo uploaded: ${file.name}`);
    }
  };

  const handleVatRegistrationChange = (e) => {
    const isRegistered = e.target.value === "yes";
    setIsVatRegistered(isRegistered);
    if (!isRegistered) {
      setFormData({ ...formData, vatNo: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Back to Home */}
        <Link
          to="/ginum-login"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Ginum Login
        </Link>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <FaBuilding className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Registration</h1>
            <p className="text-gray-500">Join the Ginuma ecosystem today</p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name & Logo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter company name"
                  />
                </div>
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {logoUploadMessage && (
                  <p className={`text-sm mt-2 ${logoUploadMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                    {logoUploadMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Company Category */}
            <div>
              <label htmlFor="companyCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Company Category *
              </label>
              <select
                id="companyCategory"
                name="companyCategory"
                value={formData.companyCategory}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Category</option>
                {COMPANY_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.companyCategory && <p className="text-red-500 text-sm mt-1">{errors.companyCategory}</p>}
            </div>

            {/* Registration No, TIN No, VAT Registered */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="registrationNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration No.
                </label>
                <input
                  type="text"
                  id="registrationNo"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter registration no"
                />
              </div>

              <div>
                <label htmlFor="tinNo" className="block text-sm font-medium text-gray-700 mb-2">
                  TIN No.
                </label>
                <input
                  type="text"
                  id="tinNo"
                  name="tinNo"
                  value={formData.tinNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter TIN no"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT Registered? *
                </label>
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="vatRegistered"
                      value="yes"
                      checked={isVatRegistered}
                      onChange={handleVatRegistrationChange}
                      className="mr-2"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="vatRegistered"
                      value="no"
                      checked={!isVatRegistered}
                      onChange={handleVatRegistrationChange}
                      className="mr-2"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* VAT No (conditional) */}
            {isVatRegistered && (
              <div>
                <label htmlFor="vatNo" className="block text-sm font-medium text-gray-700 mb-2">
                  VAT No. *
                </label>
                <input
                  type="text"
                  id="vatNo"
                  name="vatNo"
                  value={formData.vatNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter VAT no"
                />
                {errors.vatNo && <p className="text-red-500 text-sm mt-1">{errors.vatNo}</p>}
              </div>
            )}

            {/* Phone & Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone No. *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="phoneNo"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phoneNo && <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>}
              </div>

              <div>
                <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile No.
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="mobileNo"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="registeredAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Address *
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    id="registeredAddress"
                    name="registeredAddress"
                    value={formData.registeredAddress}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter registered address"
                  />
                </div>
                {errors.registeredAddress && <p className="text-red-500 text-sm mt-1">{errors.registeredAddress}</p>}
              </div>

              <div>
                <label htmlFor="factoryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Factory Address
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    id="factoryAddress"
                    name="factoryAddress"
                    value={formData.factoryAddress}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter factory address"
                  />
                </div>
              </div>
            </div>

            {/* Country & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                {loadingCountries ? (
                  <div className="w-full px-4 py-3 border rounded-xl bg-gray-100 animate-pulse">
                    Loading countries...
                  </div>
                ) : (
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                {loadingCurrencies ? (
                  <div className="w-full px-4 py-3 border rounded-xl bg-gray-100 animate-pulse">
                    Loading currencies...
                  </div>
                ) : (
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                )}
                {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
              </div>
            </div>

            {/* Email & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/ginum-login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
