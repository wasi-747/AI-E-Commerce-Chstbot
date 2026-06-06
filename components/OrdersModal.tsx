"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ShoppingBag, CheckCircle2, AlertCircle, Clock, CreditCard, ChevronDown, ChevronUp, Package } from "lucide-react";

interface OrderItem {
  _id: string;
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  size: string;
  quantity: number;
  lineTotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  placedVia: "chatbot" | "direct";
  createdAt: string;
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load orders.");
        return;
      }
      setOrders(data.data || []);
      // Auto-expand the first order if available
      if (data.data && data.data.length > 0) {
        setExpandedOrder(data.data[0]._id);
      }
    } catch {
      setError("An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">Confirmed</span>;
      case "shipped":
        return <span className="px-2 py-0.5 text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">Shipped</span>;
      case "delivered":
        return <span className="px-2 py-0.5 text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">Delivered</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 text-[9px] font-semibold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">Pending</span>;
    }
  };

  const getPaymentStatus = (status: Order["status"]) => {
    if (status === "delivered") {
      return <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Paid</span>;
    }
    if (status === "cancelled") {
      return <span className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Void</span>;
    }
    return <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Pending COD</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My Order History"
        className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl z-10 flex flex-col max-h-[85vh]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={16} strokeWidth={1.5} className="text-slate-600" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
          <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400 mb-1">TechDojo Account</p>
          <h2 className="text-xl font-light text-slate-900 tracking-tight">
            Order & Payment History
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="animate-spin text-slate-400" />
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Loading order history...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-3 text-red-600 rounded-sm">
              <AlertCircle size={16} />
              <span className="text-xs">{error}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 border border-slate-200 flex items-center justify-center rounded-sm">
                <Package size={20} strokeWidth={1.2} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-1">No Orders Found</p>
                <p className="text-[10px] text-slate-400 tracking-wider">You haven't placed any orders yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrder === order._id;
                return (
                  <div
                    key={order._id}
                    className="border border-slate-200 bg-white transition-shadow hover:shadow-sm"
                  >
                    {/* Order Summary Line */}
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono font-bold text-slate-900">{order.orderNumber}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400">
                          Placed: {formatDate(order.createdAt)} · Via: {order.placedVia}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.status)}
                          <span className="text-xs font-semibold text-slate-900">
                            ৳{order.pricing.total.toLocaleString("en-BD")}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Order Details (Collapsible) */}
                    {isExpanded && (
                      <div className="px-5 py-4 border-t border-slate-200 divide-y divide-slate-100">
                        {/* Items List */}
                        <div className="pb-4">
                          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2.5">
                            Items
                          </p>
                          <ul className="space-y-3">
                            {order.items.map((item) => (
                              <li key={item._id} className="flex justify-between items-center gap-4 text-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Small Thumbnail */}
                                  <div className="relative w-8 h-10 bg-slate-100 border border-slate-200/50 flex-shrink-0">
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag size={10} className="text-slate-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-800 leading-tight truncate">{item.name}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Size: {item.size} · Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-semibold text-slate-900 whitespace-nowrap">
                                  ৳{item.lineTotal.toLocaleString("en-BD")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Payment & Shipping info */}
                        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
                              Payment Details
                            </p>
                            <div className="space-y-1 bg-slate-50 p-3 border border-slate-100 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <CreditCard size={12} className="text-slate-400" />
                                <span>Method: Cash on Delivery (COD)</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock size={12} className="text-slate-400" />
                                <div className="flex items-center gap-1">
                                  <span>Status:</span>
                                  {getPaymentStatus(order.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
                              Fulfillment Info
                            </p>
                            <div className="space-y-1 bg-slate-50 p-3 border border-slate-100 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <Package size={12} className="text-slate-400" />
                                <span className="capitalize">Status: {order.status}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 italic">Shipping to address associated with account.</p>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="pt-4 flex justify-end">
                          <div className="w-60 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-500">
                              <span>Subtotal</span>
                              <span>৳{order.pricing.subtotal.toLocaleString("en-BD")}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Shipping</span>
                              <span>৳{order.pricing.shipping.toLocaleString("en-BD")}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                              <span>Total</span>
                              <span>৳{order.pricing.total.toLocaleString("en-BD")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="border border-slate-300 text-slate-700 text-[10px] uppercase tracking-widest px-4 py-2 hover:border-slate-900 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
