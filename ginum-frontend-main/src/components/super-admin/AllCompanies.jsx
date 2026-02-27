import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const AllCompanies = () => {
  const [showPopup, setShowPopup] = useState(null);
  const [privileges, setPrivileges] = useState({});
  const [statuses, setStatuses] = useState({});
  const [statusPopup, setStatusPopup] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/api/superadmin/companies');
        setCompanies(response); // our api.js returns response.data directly
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white";
      case "Pending":
        return "bg-blue-400 text-white";
      case "Not Paid":
        return "bg-yellow-500 text-black";
      case "Reject":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const closePopup = () => {
    setShowPopup(null);
    setStatusPopup(null);
  };

  const handlePrivilegeChange = (companyId, newPrivilege) => {
    setPrivileges((prev) => ({ ...prev, [companyId]: newPrivilege }));
    closePopup();
  };

  const handleStatusChange = (companyId, newStatus) => {
    setStatuses((prev) => ({ ...prev, [companyId]: newStatus }));
    closePopup();
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col">
      <h1 className="text-4xl font-bold mb-8">All Companies</h1>
      <div className="overflow-x-auto flex-grow">
        <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-4 px-6">No</th>
              <th className="py-4 px-6">Company Name</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Privilege Level</th>
              <th className="py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr
                key={company.companyId}
                className="hover:bg-gray-100 transition duration-300"
              >
                <td className="py-4 px-6">{index + 1}</td>
                <td className="py-4 px-6">{company.companyName}</td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                      statuses[company.companyId] || (company.status ? "Active" : "Pending")
                    )}`}
                  >
                    {statuses[company.companyId] || (company.status ? "Active" : "Pending")}
                  </span>
                </td>
                <td className="py-4 px-6">{privileges[company.companyId] || "All"}</td>
                <td className="py-4 px-6 space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded">
                    Profile
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-4 rounded"
                    onClick={() => setShowPopup(company.companyId)}
                  >
                    Change Privilege
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded"
                    onClick={() => setStatusPopup(company.companyId)}
                  >
                    Change Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-96 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={closePopup}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Change Privilege Level</h2>
            <label className="block mb-4">
              <span className="text-gray-700">Select Privilege Level</span>
              <select
                className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handlePrivilegeChange(showPopup, e.target.value)}
              >
                <option>-- Select an Option --</option>
                <option>Inventory</option>
                <option>Payroll</option>
                <option>All</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {statusPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-96 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={closePopup}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Change Company Status</h2>
            <label className="block mb-4">
              <span className="text-gray-700">Select Status</span>
              <select
                className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleStatusChange(statusPopup, e.target.value)}
              >
                <option>-- Select an Option --</option>
                <option>Pending</option>
                <option>Active</option>
                <option>Reject</option>
                <option>Not Paid</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;
