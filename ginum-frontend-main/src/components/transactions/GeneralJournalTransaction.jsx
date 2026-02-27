import React, { useState, useEffect } from "react";
import { MdOutlineCancel, MdAddCircleOutline } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import AddAccountForm from "../account/AddAccountForm";
import NewProjectForm from "../projects/NewProjectForm";
import api from "../../utils/api";

const CreateGeneralJournalTransaction = () => {
  const [rows, setRows] = useState([
    {
      account: "",
      debit: "",
      credit: "",
      job: "",
      quantity: "",
      description: "",
    },
  ]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [tax, setTax] = useState(0);
  const [outOfBalance, setOutOfBalance] = useState(0);

  // Recalculate totals when rows change
  useEffect(() => {
    let debit = 0;
    let credit = 0;

    rows.forEach((row) => {
      const debitValue = parseFloat(row.debit);
      const creditValue = parseFloat(row.credit);

      if (!isNaN(debitValue)) {
        debit += debitValue;
      }

      if (!isNaN(creditValue)) {
        credit += creditValue;
      }
    });

    const calculatedTax = 0; // You can define your tax logic here
    const difference = Math.abs(debit - credit);

    setTotalDebit(debit);
    setTotalCredit(credit);
    setTax(calculatedTax);
    setOutOfBalance(difference);
  }, [rows]);

  useEffect(() => {
    if (showAccountModal || showProjectModal) {
      // Fade in when modal is opened
      setModalTransition("opacity-100 visible");
    } else {
      // Fade out when modal is closed
      setModalTransition("opacity-0 invisible");
    }
  }, [showAccountModal, showProjectModal]);

  const handleModalClick = (e, setModal) => {
    if (e.target === e.currentTarget) {
      setModal(false);
    }
  };
  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        setAccountsError(null);

        const companyId = sessionStorage.getItem("companyId");
        if (!companyId) {
          throw new Error("Company ID not found in session storage");
        }

        const response = await api.get(`/api/companies/${companyId}/accounts`);
        let accountsData = response.data;

        if (Array.isArray(response)) {
          accountsData = response;
        } else if (Array.isArray(response.data)) {
          accountsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          accountsData = response.data.data;
        }

        if (!Array.isArray(accountsData)) {
          throw new Error("Invalid accounts data format");
        }

        const formattedAccounts = accountsData.map((account) => ({
          id: account.id,
          name: `${account.accountCode} - ${account.accountName}`,
          accountType: account.accountType,
          currentBalance: account.currentBalance,
          accountCode: account.accountCode,
        }));

        setAccounts(formattedAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccountsError(error.message);
        setAccounts([]);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);
  const projects = [
    { id: "1", name: "project A" },
    { id: "2", name: "project B" },
    { id: "3", name: "project C" },
  ];

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];

    // If debit is being set, clear and disable credit
    if (field === "debit" && value.trim() !== "") {
      updatedRows[index].credit = "";
    }
    // If credit is being set, clear and disable debit
    else if (field === "credit" && value.trim() !== "") {
      updatedRows[index].debit = "";
    }

    updatedRows[index][field] = value;

    if (index === rows.length - 1 && value.trim() !== "") {
      updatedRows.push({
        account: "",
        debit: "",
        credit: "",
        job: "",
        quantity: "",
        description: "",
      });
    }

    setRows(updatedRows);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 my-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Create Transactions
      </h2>

      {/* Reference Number */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium">
          Reference Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          className=" px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          placeholder="Enter Reference Number"
          required
        />
      </div>

      {/* Date and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            defaultValue="2025-03-14"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Description of Transaction <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            rows={2}
            placeholder="Description"
          ></textarea>
        </div>
      </div>

      {/* Table for Debit and Credit Entries */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="p-2">
                Account <span className="text-red-500">*</span>
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="ml-1 text-blue-600 hover:text-blue-700"
                >
                  <MdAddCircleOutline className="h-5 w-5" />
                </button>
              </th>
              <th className="p-2">
                Debit ($) <span className="text-red-500">*</span>
              </th>
              <th className="p-2">
                Credit ($) <span className="text-red-500">*</span>
              </th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Description</th>
              <th className="p-2">
                Project
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="ml-1 text-blue-600 hover:text-blue-700"
                >
                  <MdAddCircleOutline className="h-5 w-5" />
                </button>
              </th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="p-2">
                  <select
                    value={row.account}
                    onChange={(e) =>
                      handleRowChange(index, "account", e.target.value)
                    }
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    disabled={isLoadingAccounts}
                  >
                    <option value="">Select Account</option>
                    {isLoadingAccounts ? (
                      <option value="">Loading accounts...</option>
                    ) : accountsError ? (
                      <option value="">Error loading accounts</option>
                    ) : accounts.length === 0 ? (
                      <option value="">No accounts available</option>
                    ) : (
                      accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))
                    )}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                      row.credit.trim() !== ""
                        ? "bg-gray-100 cursor-not-allowed"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder="Debit"
                    value={row.debit}
                    onChange={(e) =>
                      handleRowChange(index, "debit", e.target.value)
                    }
                    disabled={row.credit.trim() !== ""}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm sm:text-base ${
                      row.debit.trim() !== ""
                        ? "bg-gray-100 cursor-not-allowed"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder="Credit"
                    value={row.credit}
                    onChange={(e) =>
                      handleRowChange(index, "credit", e.target.value)
                    }
                    disabled={row.debit.trim() !== ""}
                  />
                </td>

                <td className="p-2">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Quantity"
                    value={row.quantity}
                    onChange={(e) =>
                      handleRowChange(index, "quantity", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Description"
                    value={row.description}
                    onChange={(e) =>
                      handleRowChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td className="p-2">
                  <select
                    value={row.project}
                    onChange={(e) =>
                      handleRowChange(index, "project", e.target.value)
                    }
                    className=" px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  {index !== rows.length - 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdOutlineCancel className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700">
          Total debit: ${totalDebit.toFixed(2)}
        </p>
        <p className="text-sm font-medium text-gray-700">
          Total credit: ${totalCredit.toFixed(2)}
        </p>
        <p className="text-sm font-medium text-gray-700">
          Tax: ${tax.toFixed(2)}
        </p>
        <p
          className={`text-sm font-medium ${outOfBalance !== 0 ? "text-red-600" : "text-green-600"}`}
        >
          Out of balance: ${outOfBalance.toFixed(2)}
        </p>
      </div>

      {/* Save as Recurring and Prefill from Recurring Buttons */}
      {/* <div className="flex justify-start space-x-2">
        <button className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base">
          Save as recurring
        </button>
        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base">
          Prefill from recurring
        </button>
      </div> */}

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end space-x-2">
        {/* <button className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base">
          Cancel
        </button> */}
        {outOfBalance > 0 && (
          <p className="text-red-600 font-medium mt-2">
            Your entry is out of balance. Please ensure total debit equals
            total credit.
          </p>
        )}
        <button
          disabled={outOfBalance > 0}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          Save Transaction
        </button>
      </div>

      {showAccountModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowAccountModal)} // Close modal when clicking outside
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => setShowAccountModal(false)}
            >
              <FaTimes />
            </button>
            <AddAccountForm />
          </div>
        </div>
      )}
      {showProjectModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowProjectModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => setShowProjectModal(false)}
            >
              <FaTimes />
            </button>
            <NewProjectForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGeneralJournalTransaction;
