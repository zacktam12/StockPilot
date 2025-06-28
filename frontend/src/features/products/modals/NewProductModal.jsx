// src/features/products/modals/NewProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveProduct,
  fetchCategories,
} from "../../../store/slices/productSlice";
import {
  Package,
  Tag,
  DollarSign,
  Hash,
  Upload,
  Image,
  Barcode,
  AlertTriangle,
} from "lucide-react";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { productsAPI } from "../../../services/api";

const NewProductModal = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.product || {});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    quantity: "",
    minStock: "",
    maxStock: "",
    categoryId: "",
    image_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Add outside click functionality
  useOutsideClick(modalRef, () => {
    if (onClose) {
      onClose();
    }
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        quantity: product.quantity?.toString() || "",
        minStock: product.minStock?.toString() || "",
        maxStock: product.maxStock?.toString() || "",
        categoryId:
          product.category_id?.toString() ||
          product.categoryId?.toString() ||
          "",
        image_url: product.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        price: "",
        cost: "",
        quantity: "",
        minStock: "",
        maxStock: "",
        categoryId: "",
        image_url: "",
      });
    }
  }, [product]);

  const handleImageUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, and GIF images are allowed");
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await productsAPI.uploadImage(formData);

      if (response.data.success && response.data.imageUrl) {
        setFormData((prev) => ({ ...prev, image_url: response.data.imageUrl }));
        setImageFile(null);
        return response.data.imageUrl;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(
        "Error uploading image: " + (err.response?.data?.error || err.message)
      );
      console.error("Image upload error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0");
      return false;
    }
    if (!formData.categoryId) {
      setError("Category is required");
      return false;
    }
    if (formData.quantity && parseInt(formData.quantity) < 0) {
      setError("Quantity cannot be negative");
      return false;
    }
    if (
      formData.minStock &&
      formData.maxStock &&
      parseInt(formData.minStock) > parseInt(formData.maxStock)
    ) {
      setError("Minimum stock cannot be greater than maximum stock");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      let finalImageUrl = formData.image_url;

      // Handle image upload first if there's a new image
      if (imageFile) {
        try {
          finalImageUrl = await handleImageUpload(imageFile);
        } catch {
          // If image upload fails, don't proceed with product creation
          setLoading(false);
          return;
        }
      }

      const productData = {
        ...formData,
        image_url: finalImageUrl, // Use the final image URL
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        quantity: parseInt(formData.quantity) || 0,
        minStock: formData.minStock ? parseInt(formData.minStock) : null,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
        categoryId: parseInt(formData.categoryId),
      };

      // Remove empty strings and convert to backend field names
      const cleanData = Object.fromEntries(
        Object.entries(productData).filter(
          ([, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      // Convert frontend field names to backend field names
      const backendData = {
        name: cleanData.name,
        description: cleanData.description,
        sku: cleanData.sku,
        barcode: cleanData.barcode,
        price: cleanData.price,
        cost: cleanData.cost,
        quantity: cleanData.quantity,
        minStock: cleanData.minStock,
        maxStock: cleanData.maxStock,
        categoryId: cleanData.categoryId,
        image_url: cleanData.image_url,
      };

      await dispatch(saveProduct(backendData)).unwrap();

      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to save product");
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image_url: previewUrl }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        ref={modalRef}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              icon={<Package size={18} />}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter product name"
            />

            <Input
              label="SKU"
              icon={<Tag size={18} />}
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              placeholder="Enter SKU"
            />
          </div>

          <Input
            label="Barcode"
            icon={<Barcode size={18} />}
            value={formData.barcode}
            onChange={(e) =>
              setFormData({ ...formData, barcode: e.target.value })
            }
            placeholder="Enter barcode"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 shadow-sm p-2 min-h-[100px]"
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white shadow-sm p-2"
              required
            >
              <option value="">Select a category</option>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              icon={<DollarSign size={18} />}
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
              placeholder="0.00"
            />

            <Input
              label="Cost"
              type="number"
              step="0.01"
              icon={<DollarSign size={18} />}
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          {/* Stock Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantity"
              type="number"
              icon={<Hash size={18} />}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
              placeholder="0"
            />

            <Input
              label="Min Stock"
              type="number"
              icon={<AlertTriangle size={18} />}
              value={formData.minStock}
              onChange={(e) =>
                setFormData({ ...formData, minStock: e.target.value })
              }
              placeholder="0"
            />

            <Input
              label="Max Stock"
              type="number"
              icon={<Package size={18} />}
              value={formData.maxStock}
              onChange={(e) =>
                setFormData({ ...formData, maxStock: e.target.value })
              }
              placeholder="0"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Product"
                      className="mx-auto h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, image_url: "" })
                      }
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Image size={24} className="text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(error || categoriesError) && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error || categoriesError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={loading || categoriesLoading}
            >
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductModal;
