"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/productStore";
import { generateBarcode } from "../utils/barcodeUtils";
import { Save, X, Barcode } from "lucide-react";
import { useParams } from "react-router-dom";

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProduct, categories, product, fetchProductById, updateProduct, isLoading } =
    useProductStore();

  const [updateStock, setUpdateStock] = useState("")

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        await fetchProductById(id);
      }
    };
    getProduct();
  }, [id]);

  useEffect(() => {
    if (id && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        barcode: product.barcode || "",
        category: product.category || "",
        stock: (product.stock + updateStock) || "",
        image: product.image || "/placeholder.svg?height=200&width=200",
      });
    }
  }, [id, product]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    barcode: "",
    category: "",
    stock: "",

    image: "/placeholder.svg?height=200&width=200",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateRandomBarcode = () => {
    setFormData((prev) => ({ ...prev, barcode: generateBarcode() }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (
      isNaN(formData.price) ||
      Number.parseFloat(formData.price) <= 0
    ) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description) {
      newErrors.description = "Description is required";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (isNaN(formData.stock) || Number.parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: id
          ? Number.parseInt(product.stock || 0) + Number.parseInt(updateStock || 0)
          : Number.parseInt(formData.stock),
      };
      const { name, description, price, barcode, category, stock, image } =
        productData;

      if (id) {
        updateProduct(id, productData);
      } else {
        addProduct(name, description, price, barcode, category, stock, image);
      }

      // Redirect after successful addition
      setTimeout(() => {
        navigate("/products");
      }, 1000);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{id ? "Update Product" : "Add New Product"}</h1>
      </div>

      <div className="card max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Product Name*
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Description*
              </label>
              <input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                className={`input ${errors.description ? "border-red-500" : ""
                  }`}
                placeholder="Add description"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-400">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Price*
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`input ${errors.price ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-400">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="barcode"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Barcode
              </label>
              <div className="flex">
                <input
                  id="barcode"
                  name="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="input rounded-r-none"
                  placeholder="Enter barcode or generate"
                />
                <button
                  type="button"
                  onClick={generateRandomBarcode}
                  className="btn-secondary rounded-l-none flex items-center"
                >
                  <Barcode size={16} className="mr-1" />
                  Generate
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Leave empty to auto-generate on save
              </p>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Category*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`input ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-400">{errors.category}</p>
              )}
            </div>

            {/* Show current stock (disabled) */}
            {id ? (
              <div>
                <label
                  htmlFor="currentStock"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Current Quantity*
                </label>
                <input
                  id="currentStock"
                  type="number"
                  disabled
                  value={formData.stock}
                  className="input"
                  placeholder="Current stock"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >

                  Stock*
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  // disabled
                  value={formData.stock}
                    onChange={handleChange}
                className={`input ${errors.stock ? "border-red-500" : ""}`}
                  placeholder="stock"
                />
              </div>
            )}

            {/* Input for new stock to add */}
            {id && (<div>
              <label
                htmlFor="updateStock"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                {id ? "Add Quantity*" : "Stock Quantity*"}
              </label>
              <input
                id="updateStock"
                name="updateStock"
                type="number"
                value={updateStock}
                onChange={(e) => setUpdateStock(e.target.value)}
                className={`input ${errors.stock ? "border-red-500" : ""}`}
                placeholder="Enter quantity"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-400">{errors.stock}</p>
              )}
            </div>)}


            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Image URL
              </label>
              <input
                id="image"
                name="image"
                type="text"
                value={formData.image}
                onChange={handleChange}
                className="input"
                placeholder="Enter image URL"
              />
              <p className="mt-1 text-xs text-slate-400">
                Leave as is for a placeholder image
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="btn-secondary flex items-center"
            >
              <X size={18} className="mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save size={18} className="mr-1" />
                  {id ? "Update Product" : " Save Product"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
