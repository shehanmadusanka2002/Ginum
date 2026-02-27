import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { apiUrl } from '../../utils/api';
import Alert from '../../components/Alert/Alert';
import { useNavigate } from 'react-router-dom';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const companyId = sessionStorage.getItem("companyId");
  const token = sessionStorage.getItem("auth_token");

  const fetchCustomers = async () => {
    try {
      if (!companyId || !token) {
        throw new Error("Missing company ID or auth token");
      }
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/customers/companies/${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        Alert.error("Failed to load customers");
      }
    } catch (e) {
      console.error(e);
      Alert.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`${apiUrl}/api/customers/${customerId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          Alert.success("Customer deleted successfully");
          fetchCustomers();
        } else {
          Alert.error("Failed to delete customer");
        }
      } catch (e) {
        console.error(e);
        Alert.error("Error deleting customer");
      }
    }
  };

  const filteredCustomers = customers.filter(c =>
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phoneNo && c.phoneNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Customers</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={() => navigate('/app/customer/new')}
          >
            <FiPlus /> Add Customer
          </button>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {customers.length === 0 ? "No customers found." : "No matching customers found."}
          </p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            onClick={() => navigate('/account/app/customer/new')}
          >
            <FiPlus /> Add New Customer
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <FiUser size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.billingAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2"><FiPhone className="text-gray-400" /> {customer.phoneNo || '-'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1"><FiMail className="text-gray-400" /> {customer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {customer.customerType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4" title="Edit">
                        <FiEdit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete" onClick={() => handleDelete(customer.id)}>
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;