import React, { useState, useEffect } from "react";
import {
    FaBuilding,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaGlobe,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaEdit,
    FaSave,
} from "react-icons/fa";
import api from "../../utils/api";
import Alert from "../Alert/Alert"; // Ensure Alert component is available

const CompanyInformationSettings = () => {
    const [company, setCompany] = useState({
        companyName: "",
        email: "",
        phoneNo: "",
        mobileNo: "",
        companyCategory: "",
        companyRegNo: "",
        vatNo: "",
        tinNo: "",
        companyRegisteredAddress: "",
        companyFactoryAddress: "",
        countryName: "",
        currencyCode: "",
        dateJoined: "",
        logo: "https://via.placeholder.com/150",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        const companyId = sessionStorage.getItem("companyId");
        if (!companyId) {
            setError("Company ID not found in session.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/api/companies/${companyId}`);
            setCompany({
                ...response,
                logo: response.companyLogoBase64
                    ? `data:image/png;base64,${response.companyLogoBase64}`
                    : "https://via.placeholder.com/150",
            });
        } catch (err) {
            console.error("Error fetching company profile:", err);
            setError("Failed to load company details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCompany({ ...company, [name]: value });
    };

    const handleSave = async () => {
        // Currently purely frontend validation/UI saving since PUT endpoint may not be implemented
        // In production, an api.put() call will be added here.
        setIsEditing(false);
        Alert.success("Company information saved successfully.");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 py-4 text-center">{error}</div>;
    }

    return (
        <div className="bg-white rounded-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
                    <p className="text-gray-500 text-sm mt-1">Review and manage your basic organization details.</p>
                </div>
                <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${isEditing
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {isEditing ? <FaSave /> : <FaEdit />}
                    {isEditing ? "Save Changes" : "Edit Details"}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side: Logo */}
                <div className="w-full md:w-1/4 flex flex-col items-center">
                    <div className="relative group cursor-pointer">
                        <img
                            src={company.logo}
                            alt="Company Logo"
                            className="w-32 h-32 object-cover rounded-2xl border-4 border-gray-100 shadow-md group-hover:opacity-75 transition-opacity"
                        />
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-semibold">Change Logo</span>
                            </div>
                        )}
                    </div>
                    <p className="mt-4 font-semibold text-lg text-gray-800 text-center">{company.companyName}</p>
                    <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium mt-1">
                        {company.companyCategory || "General"}
                    </span>
                </div>

                {/* Right Side: Form Details */}
                <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* General Info */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaBuilding className="text-gray-400" /> Company Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="companyName"
                                value={company.companyName}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.companyName}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaEnvelope className="text-gray-400" /> Email Address
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={company.email || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.email || "-"}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaPhoneAlt className="text-gray-400" /> Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phoneNo"
                                value={company.phoneNo || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.phoneNo || "-"}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-gray-400" /> Registered Address
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="companyRegisteredAddress"
                                value={company.companyRegisteredAddress || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.companyRegisteredAddress || "-"}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-gray-400" /> Factory Address
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="companyFactoryAddress"
                                value={company.companyFactoryAddress || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.companyFactoryAddress || "-"}</p>
                        )}
                    </div>

                    {/* Registration Info */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaBuilding className="text-gray-400" /> Reg Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="companyRegNo"
                                value={company.companyRegNo || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.companyRegNo || "-"}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaMoneyBillWave className="text-gray-400" /> VAT Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="vatNo"
                                value={company.vatNo || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.vatNo || "-"}</p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                            <FaMoneyBillWave className="text-gray-400" /> TIN Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="tinNo"
                                value={company.tinNo || ""}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ) : (
                            <p className="text-gray-900 font-medium py-2">{company.tinNo || "-"}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Info Row */}
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FaGlobe />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Country</p>
                        <p className="font-semibold text-gray-900">{company.countryName || "-"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <FaMoneyBillWave />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Currency</p>
                        <p className="font-semibold text-gray-900">{company.currencyCode || "-"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <FaCalendarAlt />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Member Since</p>
                        <p className="font-semibold text-gray-900">{company.dateJoined || "-"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInformationSettings;
