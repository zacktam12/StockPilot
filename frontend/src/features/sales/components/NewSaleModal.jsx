// src/features/sales/components/NewSaleModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../components/shared/Button";
import Input from "../../../components/shared/Input";
import { Package, Plus, Minus, X } from "lucide-react";
import OrderReceipt from "./OrderReceipt";
import { useRef } from "react";
import {
	createSale,
	fetchProducts,
	fetchCustomers,
} from "../../../store/slices/salesSlice";

const NewSaleModal = ({ isOpen, onClose, onSuccess }) => {
	const dispatch = useDispatch();
	const products = useSelector((state) => state.product?.items || []);
	const customers = useSelector((state) => state.customer?.items || []);
	// loading: productsLoading,
	// } = useSelector((state) => ({
	//   products: state.products.items,
	//   customers: state.customers.items,
	//   loading: state.products.loading || state.customers.loading,
	// }));

	const [customerId, setCustomerId] = useState("");
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [showReceipt, setShowReceipt] = useState(false);
	const [saleId, setSaleId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const receiptRef = useRef();

	useEffect(() => {
		dispatch(fetchProducts());
		dispatch(fetchCustomers());
	}, [dispatch]);

	const handleAddProduct = (product) => {
		if (product.quantity === 0) return;

		const existing = selectedProducts.find((p) => p.product.id === product.id);
		if (existing) {
			if (existing.quantity < product.quantity) {
				setSelectedProducts((prev) =>
					prev.map((p) =>
						p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
					)
				);
			}
		} else {
			setSelectedProducts((prev) => [...prev, { product, quantity: 1 }]);
		}
	};

	const handleUpdateQuantity = (productId, delta) => {
		setSelectedProducts((prev) =>
			prev
				.map((item) => {
					if (item.product.id === productId) {
						const newQuantity = item.quantity + delta;
						if (newQuantity <= 0) return null;
						if (newQuantity > item.product.quantity) return item;
						return { ...item, quantity: newQuantity };
					}
					return item;
				})
				.filter(Boolean)
		);
	};

	const handleRemoveProduct = (productId) => {
		setSelectedProducts((prev) =>
			prev.filter((item) => item.product.id !== productId)
		);
	};

	const calculateTotal = () => {
		return selectedProducts.reduce(
			(sum, item) => sum + item.product.price * item.quantity,
			0
		);
	};

	const handleSubmit = async () => {
		try {
			if (selectedProducts.length === 0) {
				throw new Error("Please select at least one product");
			}

			const items = selectedProducts.map((item) => ({
				product_id: item.product.id,
				quantity: item.quantity,
				price: Number(item.product.price),
			}));

			const result = await dispatch(
				createSale({
					customer_id: customerId ? Number(customerId) : null,
					items,
					status: "completed",
				})
			).unwrap();

			setSaleId(result.id);
			setShowReceipt(true);
			onSuccess();
		} catch (error) {
			console.error("Error creating sale:", error);
			alert(`Error: ${error.message}`);
		}
	};

	const filteredProducts = products.filter((product) =>
		product.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (!isOpen) return null;

	if (showReceipt && saleId) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
					<OrderReceipt
						ref={receiptRef}
						orderId={saleId}
						items={selectedProducts.map((item) => ({
							name: item.product.name,
							quantity: item.quantity,
							price: item.product.price,
						}))}
						totalAmount={calculateTotal()}
						date={new Date()}
						type="sale"
						status="completed"
					/>
					<div className="mt-4 flex justify-end">
						<Button variant="primary" onClick={onClose}>
							Close
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold">New Sale</h2>
				</div>

				<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Left Side - Product Selection */}
					<div className="space-y-4">
						<Input
							placeholder="Search products..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>

						<div className="border rounded-lg overflow-hidden">
							<div className="grid grid-cols-2 gap-4 p-4 max-h-[400px] overflow-y-auto">
								{filteredProducts.map((product) => (
									<div
										key={product.id}
										className="border rounded-lg p-3 cursor-pointer hover:border-indigo-500 transition-colors"
										onClick={() => handleAddProduct(product)}
									>
										<div className="w-full h-32 bg-gray-100 rounded-md mb-2 overflow-hidden">
											{product.imageUrl ? (
												<img
													src={product.imageUrl}
													alt={product.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<Package size={32} className="text-gray-400" />
												</div>
											)}
										</div>
										<h3 className="font-medium text-gray-900">
											{product.name}
										</h3>
										<p className="text-sm text-gray-500">
											Stock: {product.quantity}
										</p>
										<p className="text-sm font-medium text-indigo-600">
											${product.price.toFixed(2)}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Side - Order Summary */}
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Customer</label>
							<select
								value={customerId}
								onChange={(e) => setCustomerId(e.target.value)}
								className="w-full p-2 border rounded-md"
							>
								<option value="">Walk-in Customer</option>
								{customers.map((customer) => (
									<option key={customer.id} value={customer.id}>
										{customer.name} (ID: {customer.id})
									</option>
								))}
							</select>
						</div>

						<div className="border rounded-lg p-4">
							<h3 className="font-medium mb-4">Selected Items</h3>
							<div className="space-y-4 max-h-[300px] overflow-y-auto">
								{selectedProducts.map((item) => (
									<div
										key={item.product.id}
										className="flex items-center justify-between border-b pb-2"
									>
										<div className="flex-1">
											<h4 className="font-medium">{item.product.name}</h4>
											<p className="text-sm text-gray-500">
												${item.product.price.toFixed(2)} each
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleUpdateQuantity(item.product.id, -1)
												}
											>
												<Minus size={14} />
											</Button>
											<span className="w-8 text-center">{item.quantity}</span>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleUpdateQuantity(item.product.id, 1)}
											>
												<Plus size={14} />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="text-red-600"
												onClick={() => handleRemoveProduct(item.product.id)}
											>
												<X size={14} />
											</Button>
										</div>
									</div>
								))}
							</div>

							<div className="mt-4 pt-4 border-t">
								<div className="flex justify-between text-lg font-semibold">
									<span>Total:</span>
									<span>${calculateTotal().toFixed(2)}</span>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleSubmit}
								// isLoading={loading}
								disabled={selectedProducts.length === 0}
							>
								Complete Sale
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NewSaleModal;
