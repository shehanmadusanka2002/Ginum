import React, { useState, useEffect, useMemo } from "react";
import { MdOutlineCancel, MdAddCircleOutline, MdSearch } from "react-icons/md";
import { FaTimes, FaUserTie, FaBuilding, FaUser } from "react-icons/fa";
import AddAccountForm from "../account/AddAccountForm";
import NewProjectForm from "../projects/NewProjectForm";
import PayerPayee from "../PayerPayee/PayerPayee";
import api from "../../utils/api";
import Alert from '../Alert/Alert';
import { useNavigate } from "react-router-dom";

// PayeeDropdown Component
const PayeeDropdown = ({ value, onChange, onAddNew }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { suppliers, customers, employees } = useMemo(
    () => ({
      suppliers: [
        { id: "sup1", name: "Araliya Food City Perera", contact: "0771234567" },
        { id: "sup2", name: "Shan Bakers", contact: "0777654321" },
      ],
      customers: [
        { id: "cust1", name: "John Doe Enterprises", contact: "john@doe.com" },
        { id: "cust2", name: "Acme Corporation", contact: "contact@acme.com" },
      ],
      employees: [
        { id: "emp1", name: "Alice Johnson", role: "Manager" },
        { id: "emp2", name: "Bob Smith", role: "Developer" },
      ],
    }),
    []
  );

  const filteredGroups = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filterItems = (items) =>
      items.filter((item) => item.name.toLowerCase().includes(lowerSearch));

    return [
      {
        label: "Suppliers",
        icon: <FaBuilding className="text-blue-500" />,
        items: filterItems(suppliers),
      },
      {
        label: "Customers",
        icon: <FaUser className="text-green-500" />,
        items: filterItems(customers),
      },
      {
        label: "Employees",
        icon: <FaUserTie className="text-purple-500" />,
        items: filterItems(employees),
      },
    ].filter((group) => group.items.length > 0);
  }, [searchTerm, suppliers, customers, employees]);

  const selectedItem = useMemo(() => {
    const allItems = [...suppliers, ...customers, ...employees];
    return allItems.find((item) => item.id === value);
  }, [value, suppliers, customers, employees]);

  return (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between w-full px-3 py-2 border rounded-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItem ? (
          <div className="flex items-center">
            {selectedItem.name}
            {selectedItem.contact && (
              <span className="ml-2 text-sm text-gray-500">
                ({selectedItem.contact})
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Select payee/payer</span>
        )}
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b">
            <div className="relative">
              <MdSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search payees..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.label} className="border-b last:border-b-0">
                <div className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 font-medium">
                  <span className="mr-2">{group.icon}</span>
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${value === item.id ? "bg-blue-100" : ""
                      }`}
                    onClick={() => {
                      onChange(item.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      {item.contact && (
                        <span className="text-sm text-gray-500">
                          {item.contact}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Component
const MoneyTransaction = ({ type }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalTransition, setModalTransition] = useState("opacity-0 invisible");
  const [selectedPayee, setSelectedPayee] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const navigate = useNavigate();

  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [generalDescription, setGeneralDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rows, setRows] = useState([
    {
      accountCode: "",
      amount: "0.00",
      description: "",
    },
  ]);

  const [date, setDate] = useState("");

  useEffect(() => {
    if (showContactModal || showAccountModal || showProjectModal) {
      setModalTransition("opacity-100 visible");
    } else {
      setModalTransition("opacity-0 invisible");
    }
  }, [showContactModal, showAccountModal, showProjectModal]);

  const handleModalClick = (e, setModal) => {
    if (e.target === e.currentTarget) {
      setModal(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);
    setReferenceNumber(`TRX-${Math.floor(Math.random() * 1000000)}`);
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const companyId = sessionStorage.getItem("companyId");
      if (!companyId) return;

      const response = await api.get(`/api/companies/${companyId}/accounts`);
      let accountsData = response.data || response;

      if (!Array.isArray(accountsData)) {
        throw new Error("Invalid accounts structure");
      }

      setAccounts(accountsData);

      const banks = accountsData.filter(a => a.accountType === "ASSET_BANK");
      setBankAccounts(banks);
      if (banks.length > 0) {
        setSelectedBankCode(banks[0].accountCode);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      Alert.error("Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (index === rows.length - 1 && value.trim() !== "") {
      updatedRows.push({
        accountCode: "",
        amount: "0.00",
        description: "",
      });
    }
    setRows(updatedRows);
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const totalAmount = rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

  const handleRecord = async () => {
    if (!selectedBankCode) {
      Alert.error("Please select a bank account");
      return;
    }

    const validRows = rows.filter(r => r.accountCode && parseFloat(r.amount) > 0);
    if (validRows.length === 0) {
      Alert.error("Please add at least one valid line item with an account and amount > 0");
      return;
    }

    if (!date) {
      Alert.error("Please select a date");
      return;
    }

    setIsSubmitting(true);
    const companyId = sessionStorage.getItem("companyId");

    // Construct the payload for Journal Entry 
    try {
      const payload = {
        entryType: type === "spend" ? "PAYMENT" : "RECEIPT",
        entryDate: date,
        journalTitle: type === "spend" ? "Spend Money" : "Receive Money",
        referenceNo: referenceNumber,
        description: generalDescription || `Money ${type === "spend" ? "spent from" : "received into"} bank`,
        companyId: parseInt(companyId),
        lines: []
      };

      // For Spend Money: Bank is Credited (debit: false), other lines are Debited (debit: true)
      // For Receive Money: Bank is Debited (debit: true), other lines are Credited (debit: false)
      const isBankDebit = type === "receive";

      // Add the Bank Account line
      payload.lines.push({
        accountCode: selectedBankCode,
        amount: totalAmount,
        debit: isBankDebit,
        description: generalDescription || `Money ${type === "spend" ? "spent" : "received"}`
      });

      // Add the detail lines
      validRows.forEach(row => {
        payload.lines.push({
          accountCode: row.accountCode,
          amount: parseFloat(row.amount),
          debit: !isBankDebit,
          description: row.description || `Transaction detail`
        });
      });

      const res = await api.post(`/api/companies/${companyId}/journal-entries`, payload);
      Alert.success(type === "spend" ? "Spend Money recorded successfully!" : "Receive Money recorded successfully!");

      // Reset form
      setRows([{ accountCode: "", amount: "0.00", description: "" }]);
      setGeneralDescription("");
      setReferenceNumber(`TRX-${Math.floor(Math.random() * 1000000)}`);
      setSelectedPayee(null);
    } catch (err) {
      console.error("Failed to record transaction:", err);
      Alert.error(err.response?.data?.error || "Failed to record transaction. Be sure Debit/Credit balances match.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {type === "spend"
          ? "Spend Money Transaction"
          : "Receive Money Transaction"}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">
              Bank Account <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBankCode}
              onChange={(e) => setSelectedBankCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base">
              {isLoadingAccounts ? (
                <option>Loading...</option>
              ) : bankAccounts.length > 0 ? (
                bankAccounts.map(b => (
                  <option key={b.id} value={b.accountCode}>{b.accountCode} - {b.accountName}</option>
                ))
              ) : (
                <option value="">No bank accounts found</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base bg-gray-100"
              value={referenceNumber}
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">
              Payee / Payer
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-grow">
                <PayeeDropdown
                  value={selectedPayee}
                  onChange={(id) => setSelectedPayee(id)}
                  onAddNew={() => setShowContactModal(true)}
                />
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="p-2 text-blue-600 hover:text-blue-700 self-end mb-1"
              >
                <MdAddCircleOutline className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium">
            Description of Transaction
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            rows={3}
            value={generalDescription}
            onChange={(e) => setGeneralDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-2 text-left">
                  Account <span className="text-red-500">*</span>{" "}
                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    <MdAddCircleOutline className="h-5 w-5" />
                  </button>
                </th>
                <th className="p-2 text-left">
                  Amount ($) <span className="text-red-500">*</span>
                </th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="p-2">
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      value={row.accountCode}
                      onChange={(e) =>
                        handleRowChange(index, "accountCode", e.target.value)
                      }
                    >
                      <option value="">Select Account</option>
                      {accounts.filter(a => a.accountType !== "ASSET_BANK").map(account => (
                        <option key={account.id} value={account.accountCode}>
                          {account.accountCode} - {account.accountName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      min={0}
                      value={row.amount}
                      onChange={(e) =>
                        handleRowChange(index, "amount", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      value={row.description}
                      onChange={(e) =>
                        handleRowChange(index, "description", e.target.value)
                      }
                      rows={1}
                    />
                  </td>
                  <td className="p-2 text-center">
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

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-right w-full flex justify-end items-center mr-4">
            <span className="font-semibold text-gray-900 text-lg">
              Total: ${totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRecord}
              disabled={isSubmitting}
              className="bg-blue-600 w-32 justify-center flex text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Record"}
            </button>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowContactModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg  max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowContactModal(false)}
            >
              <FaTimes />
            </button>
            <PayerPayee />
          </div>
        </div>
      )}

      {showAccountModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${modalTransition}`}
          onClick={(e) => handleModalClick(e, setShowAccountModal)}
        >
          <div className="w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3  p-2 rounded-lg max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-black-600 text-xl"
              onClick={() => {
                setShowAccountModal(false);
                fetchAccounts(); // refresh accounts when modal closes
              }}
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

export default MoneyTransaction;