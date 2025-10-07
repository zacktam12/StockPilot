// Demo component to test and showcase NumericInput features
// This can be used for testing or removed after verification
import React, { useState } from "react";
import NumericInput from "../../../components/shared/NumericInput";
import { DollarSign, Package, AlertTriangle } from "lucide-react";

const NumericInputDemo = () => {
  const [formData, setFormData] = useState({
    price: "",
    cost: "",
    quantity: "",
    minStock: "",
    maxStock: "",
    discount: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.minStock && formData.maxStock) {
      const min = parseInt(formData.minStock);
      const max = parseInt(formData.maxStock);
      if (min > max) {
        newErrors.maxStock = "Max must be ≥ Min";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Form validated successfully! Check console for data.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          NumericInput Component Demo
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Price (Decimal, Required, Min > 0) */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold mb-2">Price Field</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Try typing letters, negative numbers, or more than 2 decimals
            </p>
            <NumericInput
              label="Product Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="0.00"
              min={0.01}
              allowDecimal={true}
              decimals={2}
              required={true}
              icon={<DollarSign size={18} />}
            />
          </div>

          {/* Cost (Decimal, Optional, Min >= 0) */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-semibold mb-2">Cost Field (Optional)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Allows 0 but not negative numbers
            </p>
            <NumericInput
              label="Product Cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              error={errors.cost}
              placeholder="0.00"
              min={0}
              allowDecimal={true}
              decimals={2}
              icon={<DollarSign size={18} />}
            />
          </div>

          {/* Quantity (Integer only) */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold mb-2">Quantity (Integer Only)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No decimals allowed, only whole numbers
            </p>
            <NumericInput
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              placeholder="0"
              min={0}
              allowDecimal={false}
              icon={<Package size={18} />}
            />
          </div>

          {/* Min/Max Stock (Cross-validation) */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="text-lg font-semibold mb-2">Stock Levels (Cross-Validation)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Try setting Min Stock higher than Max Stock
            </p>
            <div className="grid grid-cols-2 gap-4">
              <NumericInput
                label="Min Stock"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                error={errors.minStock}
                placeholder="0"
                min={0}
                allowDecimal={false}
                icon={<AlertTriangle size={18} />}
              />
              <NumericInput
                label="Max Stock"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                error={errors.maxStock}
                placeholder="0"
                min={0}
                allowDecimal={false}
                icon={<AlertTriangle size={18} />}
              />
            </div>
          </div>

          {/* Discount (Negative allowed) */}
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-lg font-semibold mb-2">Discount (Negative Allowed)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Allows negative values for discounts/refunds
            </p>
            <NumericInput
              label="Discount/Adjustment"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              error={errors.discount}
              placeholder="0.00"
              allowNegative={true}
              allowDecimal={true}
              decimals={2}
              icon={<DollarSign size={18} />}
            />
          </div>

          {/* Test Cases Section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              🧪 Test Cases
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Try typing "abc123" in any field - only "123" will appear
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Type "19.999" in price - automatically becomes "19.99"
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Try negative numbers in quantity - they'll be removed
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Set Min Stock = 100, Max Stock = 50 - see error message
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Copy "price: $49.95 each" and paste - becomes "49.95"
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                Leave required fields empty - see validation errors
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Validate & Log Data
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  price: "",
                  cost: "",
                  quantity: "",
                  minStock: "",
                  maxStock: "",
                  discount: "",
                });
                setErrors({});
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Reset Form
            </button>
          </div>

          {/* Current Values Display */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
              Current Form Values:
            </h4>
            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NumericInputDemo;

