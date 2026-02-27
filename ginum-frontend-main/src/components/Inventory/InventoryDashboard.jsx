import React, { useState } from "react";
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const InventoryDashboard = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      itemName: "Pen",
      category: "Stationery",
      purchasePrice: 10,
      sellingPrice: 15,
      quantity: 200,
    },
    {
      id: 2,
      itemName: "Notebook",
      category: "Stationery",
      purchasePrice: 50,
      sellingPrice: 70,
      quantity: 5,
    },
  ]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' or 'reduce'
  const [currentItem, setCurrentItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  // Open modal and reset inputs
  const openModal = (type, item) => {
    setModalType(type);
    setCurrentItem(item);
    setQuantity("");
    setNotes("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setCurrentItem(null);
    setQuantity("");
    setNotes("");
  };

  // Handle submit of Add or Reduce Stock
  const handleSubmit = () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      alert("Please enter a valid quantity greater than zero.");
      return;
    }

    if (modalType === "reduce" && qty > currentItem.quantity) {
      alert("Cannot reduce more than current stock.");
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === currentItem.id) {
          if (modalType === "add") {
            return { ...item, quantity: item.quantity + qty };
          } else if (modalType === "reduce") {
            return { ...item, quantity: item.quantity - qty };
          }
        }
        return item;
      })
    );

    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Inventory Dashboard</h2>

        <div className="overflow-x-auto bg-white shadow rounded-xl p-4">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-gray-600 uppercase border-b">
              <tr>
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Purchase Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{item.itemName}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                        item.quantity < 10
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.quantity} {item.quantity < 10 ? "Low" : "In Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4">Rs. {item.purchasePrice}</td>
                  <td className="py-3 px-4">Rs. {item.sellingPrice}</td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <div className="inline-flex items-center gap-2">
                      <div className="relative group">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">
                          <Pencil size={16} />
                        </button>
                        <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition">
                          Edit
                        </span>
                      </div>
                      <div className="relative group">
                        <button
                          onClick={() => openModal("add", item)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <ArrowUpCircle size={16} /> Add Stock
                        </button>
                      </div>
                      <div className="relative group">
                        <button
                          onClick={() => openModal("reduce", item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                        >
                          <ArrowDownCircle size={16} /> Reduce Stock
                        </button>
                      </div>
                      <div className="relative group">
                        <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                        <span className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition">
                          Delete
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h3 className="text-xl font-semibold mb-4">
              {modalType === "add" ? "Add Stock" : "Reduce Stock"}
            </h3>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">
                Item
              </label>
              <input
                type="text"
                value={currentItem.itemName}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">
                Current Stock
              </label>
              <input
                type="number"
                value={currentItem.quantity}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 font-medium mb-1">
                Quantity to {modalType === "add" ? "Add" : "Reduce"}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter quantity"
              />
            </div>

            {modalType === "reduce" && (
              <div className="mb-3">
                <label className="block text-gray-700 font-medium mb-1">
                  Reason
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Optional reason for stock reduction"
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded text-white ${
                  modalType === "add"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } transition`}
              >
                {modalType === "add" ? "Add Stock" : "Reduce Stock"}
              </button>
            </div>

            {/* Close X button */}
            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
