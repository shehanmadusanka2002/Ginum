import React, { useState, useEffect } from "react";
import { Line, Bar, Pie, Doughnut, Radar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import api from "../../utils/api";

// Finance Stats Component
const FinanceStats = ({ revenue, expenses, profit, prevRevenue, prevExpenses, prevProfit }) => {
  return (
    <div className="rounded-lg ">
      <h2 className="text- font-semibold text-gray-500 mb-1">Last 30 Days</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={revenue || 0} previous={prevRevenue || 0} color="text-green-600" />
        <StatCard title="Total Expenses" value={expenses || 0} previous={prevExpenses || 0} color="text-red-500" />
        <StatCard title="Net Profit" value={profit || 0} previous={prevProfit || 0} color="text-blue-500" />
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, previous, color }) => {
  const change = previous ? (((value - previous) / previous) * 100).toFixed(2) : 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-5 rounded-lg shadow flex flex-col items-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-semibold ${color}`}>${value.toLocaleString()}</p>
      <p className="text-gray-400 text-xs">from ${previous.toLocaleString()}</p>
      <span
        className={`mt-2 text-sm font-medium px-2 py-1 rounded-full ${isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
      >
        {isPositive ? "▲" : "▼"} {Math.abs(change)}%
      </span>
    </div>
  );
};

const DashboardPage = () => {
  const [financeStats, setFinanceStats] = useState({
    revenue: 0,
    prevRevenue: 0,
    expenses: 0,
    prevExpenses: 0,
    profit: 0,
    prevProfit: 0,
    recentTransactions: [],
    topClients: [],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const companyId = sessionStorage.getItem("companyId");
        if (companyId) {
          const response = await api.get(`/api/companies/${companyId}/dashboard/stats`);
          setFinanceStats(response); // Since api.js automatically returns response.data
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, []);
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Revenue",
        data: [5000, 7000, 10000, 15000, 20000, 25000, 30000],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: [3000, 4000, 5000, 7000, 8000, 10000, 12000],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Sales",
        data: [30, 40, 50, 60, 70, 80, 90],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Product A", "Product B", "Product C"],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ["Rent", "Salaries", "Marketing", "Other Expenses"],
    datasets: [
      {
        data: [30, 40, 20, 10],
        backgroundColor: ["#FF9F40", "#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };

  const radarData = {
    labels: [
      "Revenue",
      "Growth",
      "Customer Satisfaction",
      "Efficiency",
      "Profitability",
    ],
    datasets: [
      {
        label: "Performance",
        data: [85, 90, 75, 80, 95],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col gap-6">
      {/* Finance Stats Section */}
      <FinanceStats
        revenue={financeStats.revenue}
        prevRevenue={financeStats.prevRevenue}
        expenses={financeStats.expenses}
        prevExpenses={financeStats.prevExpenses}
        profit={financeStats.profit}
        prevProfit={financeStats.prevProfit}
      />

      <h2 className="font-semibold text-gray-500">Finance Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Revenue and Expenses Overview</h3>
          <div className="h-80 w-full max-w-md"><Line data={chartData} options={chartOptions} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Comparison</h3>
          <div className="h-80 w-full max-w-md"><Bar data={barData} options={chartOptions} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4"> Revenue Sources</h3>
          <div className="h-80 w-full max-w-md"><Pie data={pieData} options={chartOptions} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="h-80 w-full max-w-md"><Doughnut data={doughnutData} options={chartOptions} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">Financial KPIs</h3>
          <div className="h-80 w-full max-w-md"><Radar data={radarData} options={chartOptions} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div class="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Description</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Category</th>
                </tr>
              </thead>
              <tbody>
                {financeStats.recentTransactions && financeStats.recentTransactions.length > 0 ? (
                  financeStats.recentTransactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4">{tx.date}</td>
                      <td className="py-2 px-4">{tx.description}</td>
                      <td className={`py-2 px-4 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : '-'} $ {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">{tx.category}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">No recent transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Clients</h3>
          <div className="bg-gradient-to-r from-cyan-300 to-cyan-500 h-px mb-6"></div>
          <ul>
            {financeStats.topClients && financeStats.topClients.length > 0 ? (
              financeStats.topClients.map((client, idx) => (
                <li key={idx} className="py-2 px-4 border-b border-gray-200">
                  {client.name} - ${client.value.toLocaleString()}
                </li>
              ))
            ) : (
              <li className="py-4 px-4 text-center text-gray-500">No top client data available</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
