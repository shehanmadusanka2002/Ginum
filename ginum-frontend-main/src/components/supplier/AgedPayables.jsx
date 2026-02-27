import React, { useState } from 'react';

const payablesSummaryData = [
  {
    supplier: 'Supplier A',
    notDueYet: '$1,200',
    age1: '$100',
    age2: '$250',
    age3: '$350',
    total: '$1,900',
    invoiceDate: '2025-03-01',
  },
  {
    supplier: 'Supplier B',
    notDueYet: '$2,500',
    age1: '$300',
    age2: '$400',
    age3: '$700',
    total: '$3,900',
    invoiceDate: '2025-02-15',
  },
  {
    supplier: 'Supplier C',
    notDueYet: '$900',
    age1: '$150',
    age2: '$200',
    age3: '$300',
    total: '$1,550',
    invoiceDate: '2025-01-10',
  },
];

const payablesDetailData = [
  {
    supplier: 'Supplier A',
    invoice: 'INV-56789',
    invoiceDate: '2025-03-01',
    dueDate: '2025-04-01',
    notDueYet: '$1,200',
    age1: '$100',
    age2: '$250',
    age3: '$350',
    total: '$1,900',
    balance: '$1,900',
  },
  {
    supplier: 'Supplier B',
    invoice: 'INV-98765',
    invoiceDate: '2025-02-15',
    dueDate: '2025-03-15',
    notDueYet: '$2,500',
    age1: '$300',
    age2: '$400',
    age3: '$700',
    total: '$3,900',
    balance: '$3,900',
  },
  {
    supplier: 'Supplier C',
    invoice: 'INV-12345',
    invoiceDate: '2025-03-05',
    dueDate: '2025-04-05',
    notDueYet: '$900',
    age1: '$150',
    age2: '$200',
    age3: '$300',
    total: '$1,550',
    balance: '$1,550',
  },
];

export default function AgedPayables() {
  const [activeTab, setActiveTab] = useState('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;

  // Filter function based on search query and date range
  const filterData = (data) => {
    let filteredData = data;

    // Search by supplier
    if (searchQuery) {
      filteredData = filteredData.filter((row) =>
        row.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filtering
    if (dateRange) {
      const today = new Date();
      filteredData = filteredData.filter((row) => {
        const invoiceDate = new Date(row.invoiceDate);
        switch (dateRange) {
          case 'last30':
            const last30Days = new Date(today.setDate(today.getDate() - 30));
            return invoiceDate >= last30Days;
          case 'thisMonth':
            return invoiceDate.getMonth() === today.getMonth() && invoiceDate.getFullYear() === today.getFullYear();
          case 'lastMonth':
            const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
            return (
              invoiceDate.getMonth() === lastMonth.getMonth() && invoiceDate.getFullYear() === lastMonth.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    return filteredData;
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handlePaginationChange = (newPage) => {
    setPage(newPage);
  };

  // Paginate the filtered data
  const paginatedData = filterData(activeTab === 'summary' ? payablesSummaryData : payablesDetailData)
    .slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Aged Payables</h1>

      {/* Filters and Buttons */}
      <div className="flex space-x-4 items-center mb-4">
        <input
          type="text"
          placeholder="Search by Supplier"
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-md shadow-sm w-1/3"
        />
        <select
          value={dateRange}
          onChange={handleDateRangeChange}
          className="px-4 py-2 border rounded-md shadow-sm"
        >
          <option value="">All Dates</option>
          <option value="last30">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
        </select>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Export
        </button>

        <div className="flex space-x-2 ml-auto">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md">Create Bill</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md">Add Payment</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'detail' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('detail')}
        >
          Detail
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' ? (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Not Due Yet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">1–30</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">31–60</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">61–90+</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.notDueYet}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.age1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.age2}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.age3}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Invoice Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Not Due Yet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">1–30</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">31–60</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">61–90+</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.invoice}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.invoiceDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.dueDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.notDueYet}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.age1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.age2}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.age3}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.total}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{row.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">Page {page}</div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePaginationChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          >
            Previous
          </button>
          <button
            onClick={() => handlePaginationChange(page + 1)}
            disabled={page * itemsPerPage >= (activeTab === 'summary' ? payablesSummaryData.length : payablesDetailData.length)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}