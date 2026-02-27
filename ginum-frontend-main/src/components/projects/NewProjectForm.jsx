import React, { useState, useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { FaPlusCircle, FaTimes  } from "react-icons/fa";
import AddCustomerForm from "../customer/AddCustomer";

const NewProjectForm = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  // State for form fields
  const [projectCode, setProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [workingStatus, setWorkingStatus] = useState("");
  const [priority, setPriority] = useState("");
const [modalTransition, setModalTransition] = useState("opacity-0 invisible");

  useEffect(() => {
    if (showCustomerModal) {
      // Fade in when modal is opened
      setModalTransition("opacity-100 visible");
    } else {
      // Fade out when modal is closed
      setModalTransition("opacity-0 invisible");
    }
  }, [showCustomerModal]);

  // Sample data for dropdowns
  const customers = [
    { id: "1", name: "Customer A" },
    { id: "2", name: "Customer B" },
    { id: "3", name: "Customer C" },
  ];

  const workingStatusOptions = [
    { id: "active", name: "Active" },
    { id: "pending", name: "Pending" },
    { id: "completed", name: "Completed" },
    { id: "canceled", name: "Canceled" },
  ];

  const priorityOptions = [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      projectCode,
      projectName,
      selectedCustomer,
      startDate,
      workingStatus,
      priority,
    });
    // Add your form submission logic here
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Create Project
      </h2>

      {/* Project Form */}
      <form onSubmit={handleSubmit}>
        {/* Row 1: Project Code and Project Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium">
              Project Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter Project Code"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter Project Name"
              required
            />
          </div>
        </div>

        {/* Row 2: Customer and Start Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-blue-500 flex items-center justify-center mt-2"
              onClick={() => setShowCustomerModal(true)}
            >
              <span className="mr-2">
                <FaPlusCircle />
              </span>{" "}
              Add New Customer
            </button>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* Row 3: Working Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium">
              Working Status <span className="text-red-500">*</span>
            </label>
            <select
              value={workingStatus}
              onChange={(e) => setWorkingStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              <option value="">Select working status</option>
              {workingStatusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              required
            >
              <option value="">Select priority</option>
              {priorityOptions.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Save
          </button>
        </div>
      </form>
      {showCustomerModal && (
  <div
    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowCustomerModal(false);
    }}
  >
    <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
      <button
        className="absolute top-2 right-2 text-gray-600 text-xl"
        onClick={() => setShowCustomerModal(false)}
      >
        <FaTimes />
      </button>
      <AddCustomerForm />
    </div>
  </div>
)}

    </div>
  );
};

export default NewProjectForm;