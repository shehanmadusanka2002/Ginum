import React from "react";
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

const CompanyProfile = () => {
  return (
    <div className="p-4 sm:p-8 bg-gray-100 flex justify-center">
      {/* Main Container */}
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-4xl transition-all duration-500 hover:shadow-2xl">
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Profile Card */}
          <div className="w-full sm:w-1/3 flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-md transition hover:scale-105">
            <img
              className="w-24 h-24 rounded-full border-4 border-gray-300 hover:border-gray-400 transition"
              src="https://knowebsolutions.com/wp-content/uploads/2024/06/2-01-1.png"
              alt="Company Logo"
            />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 hover:text-gray-700 transition">
              Knoweb PVT LTD
            </h2>
            <p className="text-gray-500 text-sm text-center flex items-center gap-1">
              <FaMapMarkerAlt /> No. 422, 4th floor, Sanvik plaza, Wakwella Road, Galle
            </p>
            <Link to={'/settings'}>
              <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm">
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
                <p className="text-gray-900 font-medium">Knoweb PVT LTD</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <FaEnvelope /> Email
                </p>
                <p className="text-gray-900 font-medium">info@knowebsolutions.com</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <FaPhone /> Phone No.
                </p>
                <p className="text-gray-900 font-medium">0123456789</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Mobile No.</p>
                <p className="text-gray-900 font-medium">-</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Company Category</p>
                <p className="text-gray-900 font-medium">IT and Technology</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md transition hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-gray-500 text-sm">Company Registration No.</p>
              <p className="text-gray-900 font-medium">R001</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">VAT No.</p>
              <p className="text-gray-900 font-medium">VAT001</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">TIN No.</p>
              <p className="text-gray-900 font-medium">TIN001</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaMapMarkerAlt /> Company Registered Address
              </p>
              <p className="text-gray-900 font-medium">No. 422, 4th floor, Sanvik plaza, Wakwella Road, Galle</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Company Factory Address</p>
              <p className="text-gray-900 font-medium"> - </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaGlobe /> Country
              </p>
              <p className="text-gray-900 font-medium">Sri Lanka (LK)</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaMoneyBillWave /> Currency Unit
              </p>
              <p className="text-gray-900 font-medium">United States Dollar (USD)</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <FaCalendarAlt /> Date Joined
              </p>
              <p className="text-gray-900 font-medium">2024-05-04</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
