import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaGlobe,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../utils/api";

const CompanyProfile = () => {
  const [company, setCompany] = useState({
    companyName: "Loading...",
    email: "-",
    phoneNo: "-",
    mobileNo: "-",
    companyCategory: "-",
    companyRegNo: "-",
    vatNo: "-",
    tinNo: "-",
    companyRegisteredAddress: "-",
    companyFactoryAddress: "-",
    countryName: "-",
    currencyCode: "-",
    dateJoined: "-",
    logo: "https://via.placeholder.com/150",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      const companyId = sessionStorage.getItem("companyId");
      if (!companyId) {
        setError("Company ID not found in session.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/companies/${companyId}`);
        setCompany({
          ...response,
          logo: response.companyLogoBase64
            ? `data:image/png;base64,${response.companyLogoBase64}`
            : "https://via.placeholder.com/150",
        });
      } catch (err) {
        console.error("Error fetching company profile:", err);
        setError("Failed to fetch company details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-gray-100 h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 flex justify-center">
      {/* Main Container */}
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-4xl transition-all duration-500 hover:shadow-2xl">
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Profile Card */}
          <div className="w-full sm:w-1/3 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md transition hover:scale-105">
            <img
              className="w-24 h-24 rounded-full border-4 border-gray-300 hover:border-gray-400 object-cover transition"
              src={company.logo}
              alt="Company Logo"
            />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 hover:text-gray-700 transition text-center">
              {company.companyName}
            </h2>
            <p className="text-gray-500 text-sm text-center flex items-center gap-1 mt-2">
              <FaMapMarkerAlt /> {company.companyRegisteredAddress}
            </p>
            <Link to={'/app/settings'}>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm">
                Change Settings
              </button>
            </Link>
          </div>

          {/* Company Info */}
          <div className="w-full sm:w-2/3 bg-gray-50 p-6 rounded-lg shadow-md transition hover:shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <FaBuilding /> Company Name
                </p>
                <p className="text-gray-900 font-medium">{company.companyName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <FaEnvelope /> Email
                </p>
                <p className="text-gray-900 font-medium">{company.email || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <FaPhone /> Phone No.
                </p>
                <p className="text-gray-900 font-medium">{company.phoneNo || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Mobile No.</p>
                <p className="text-gray-900 font-medium">{company.mobileNo || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Company Category</p>
                <p className="text-gray-900 font-medium">{company.companyCategory || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md transition hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4 mt-4">
            <div>
              <p className="text-gray-500 text-sm">Registration No.</p>
              <p className="text-gray-900 font-medium">{company.companyRegNo || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">VAT No.</p>
              <p className="text-gray-900 font-medium">{company.vatNo || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">TIN No.</p>
              <p className="text-gray-900 font-medium">{company.tinNo || "-"}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaMapMarkerAlt /> Registered Address
              </p>
              <p className="text-gray-900 font-medium">{company.companyRegisteredAddress || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaMapMarkerAlt /> Factory Address
              </p>
              <p className="text-gray-900 font-medium">{company.companyFactoryAddress || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaGlobe /> Country
              </p>
              <p className="text-gray-900 font-medium">{company.countryName || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaMoneyBillWave /> Currency
              </p>
              <p className="text-gray-900 font-medium">{company.currencyCode || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaCalendarAlt /> Date Joined
              </p>
              <p className="text-gray-900 font-medium">{company.dateJoined || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
