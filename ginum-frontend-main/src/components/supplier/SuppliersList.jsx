import React, { useState } from 'react';

const suppliersData = [
  { id: 1, name: 'ABC Traders', contact: 'John Doe', phone: '0771234567', email: 'abc@example.com' },
  { id: 2, name: 'XYZ Suppliers', contact: 'Jane Smith', phone: '0712345678', email: 'xyz@example.com' },
  // Add more suppliers as needed
];

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState(suppliersData);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Suppliers</h2>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Contact Person</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-t">
                <td className="py-3 px-4">{supplier.id}</td>
                <td className="py-3 px-4">{supplier.name}</td>
                <td className="py-3 px-4">{supplier.contact}</td>
                <td className="py-3 px-4">{supplier.phone}</td>
                <td className="py-3 px-4">{supplier.email}</td>
                <td className="py-3 px-4">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td className="py-3 px-4 text-center" colSpan="6">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuppliersList;
