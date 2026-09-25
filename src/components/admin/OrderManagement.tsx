import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Truck, CheckCircle, XCircle, Package, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';

interface Order {
  id: string;
  user_id: string;
  items: any[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  payment_method: string;
  currency: string;
  subtotal: number;
  shipping: number;
  discount?: number;
  coupon_code?: string;
  total: number;
  status: string;
  created_at: string;
}

// Status transition helper functions
const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const TERMINAL_STATUSES = ['delivered', 'cancelled'];

function getNextOrderStatus(currentStatus: string): string | null {
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    return null;
  }
  
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
    return null;
  }
  
  return ORDER_STATUS_FLOW[currentIndex + 1];
}

function canTransitionOrderStatus(currentStatus: string, nextStatus: string): boolean {
  // Terminal states cannot be changed
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    return false;
  }
  
  // Can only move to next status in flow or cancel
  const nextInFlow = getNextOrderStatus(currentStatus);
  
  if (nextStatus === 'cancelled') {
    return true; // Can cancel from any non-terminal state
  }
  
  return nextStatus === nextInFlow;
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getNextActionButtonLabel(currentStatus: string): string {
  const nextStatus = getNextOrderStatus(currentStatus);
  
  switch (nextStatus) {
    case 'confirmed':
      return 'Confirm Order';
    case 'processing':
      return 'Start Processing';
    case 'shipped':
      return 'Mark as Shipped';
    case 'delivered':
      return 'Mark as Delivered';
    default:
      return '';
  }
}

export default function OrderManagement() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      if (dateFilter === 'today') {
        filtered = filtered.filter(o => new Date(o.created_at) >= today);
      } else if (dateFilter === 'week') {
        filtered = filtered.filter(o => new Date(o.created_at) >= weekAgo);
      } else if (dateFilter === 'month') {
        filtered = filtered.filter(o => new Date(o.created_at) >= monthAgo);
      }
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Find the current order
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      setToast({ message: 'Order not found', type: 'error' });
      return;
    }

    // Validate transition
    if (!canTransitionOrderStatus(order.status, newStatus)) {
      setToast({ message: 'Invalid order status transition', type: 'error' });
      console.error(`Invalid transition: ${order.status} → ${newStatus}`);
      return;
    }

    setUpdatingStatus(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      await loadOrders();
      
      // Update selected order if it's the one being viewed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Show success toast
      setToast({ 
        message: `Order #${orderId.slice(-8)} moved to ${getStatusLabel(newStatus)}`, 
        type: 'success' 
      });

      // Close cancel confirmation if open
      setShowCancelConfirm(false);

    } catch (error) {
      console.error('Error updating order:', error);
      setToast({ 
        message: 'Unable to update order status. Please try again.', 
        type: 'error' 
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Orders</h2>
        <p className="text-stone-600 mt-1">
          {orders.length} total orders • {orders.filter(o => o.status === 'pending').length} pending
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-stone-900">#{order.id.slice(-8)}</div>
                    <div className="text-sm text-stone-500">{order.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900">{order.customer.name}</div>
                    <div className="text-sm text-stone-500">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-stone-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-stone-900">{formatPrice(order.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Order #{selectedOrder.id.slice(-8)}</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setShowCancelConfirm(false);
                  }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Progress Stepper */}
              <div className="bg-stone-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-stone-700 mb-4">Order Status</h4>
                
                {/* Terminal States */}
                {selectedOrder.status === 'delivered' && (
                  <div className="flex items-center gap-3 p-4 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Order Completed</p>
                      <p className="text-sm text-green-700">This order has been successfully delivered.</p>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'cancelled' && (
                  <div className="flex items-center gap-3 p-4 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Order Cancelled</p>
                      <p className="text-sm text-red-700">This order has been cancelled.</p>
                    </div>
                  </div>
                )}

                {/* Progress Stepper for Active Orders */}
                {!TERMINAL_STATUSES.includes(selectedOrder.status) && (
                  <div className="space-y-4">
                    {/* Visual Progress */}
                    <div className="flex items-center justify-between">
                      {ORDER_STATUS_FLOW.map((status, index) => {
                        const currentIndex = ORDER_STATUS_FLOW.indexOf(selectedOrder.status);
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        
                        return (
                          <div key={status} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                isCompleted 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : isCurrent 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : 'bg-white border-stone-300 text-stone-400'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              <span className={`text-xs mt-2 font-medium ${
                                isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-stone-400'
                              }`}>
                                {getStatusLabel(status)}
                              </span>
                            </div>
                            {index < ORDER_STATUS_FLOW.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-2 ${
                                index < currentIndex ? 'bg-green-500' : 'bg-stone-300'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Current Status Badge */}
                    <div className="flex items-center justify-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        Current Status: {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>

                    {/* Next Action Button */}
                    {getNextOrderStatus(selectedOrder.status) && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => {
                            const nextStatus = getNextOrderStatus(selectedOrder.status);
                            if (nextStatus) {
                              updateOrderStatus(selectedOrder.id, nextStatus);
                            }
                          }}
                          disabled={updatingStatus}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {updatingStatus ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              {getNextActionButtonLabel(selectedOrder.status)}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Cancel Order - Danger Zone */}
                    <div className="pt-4 border-t border-stone-200">
                      <h5 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h5>
                      {!showCancelConfirm ? (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={updatingStatus}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </button>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-900 mb-3">
                            <strong>Cancel this order?</strong><br />
                            This action cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                              disabled={updatingStatus}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {updatingStatus ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                'Confirm Cancellation'
                              )}
                            </button>
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              disabled={updatingStatus}
                              className="px-4 py-2 bg-white text-stone-700 rounded-lg font-medium hover:bg-stone-50 transition-colors border border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-2">Customer Information</h4>
                  <div className="bg-stone-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                    <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.customer.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-2">Shipping Address</h4>
                  <div className="bg-stone-50 rounded-lg p-4">
                    <p className="text-sm">{selectedOrder.customer.address || 'N/A'}</p>
                    <p className="text-sm">{selectedOrder.customer.city || ''}, {selectedOrder.customer.zip || ''}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Order Items</h4>
                <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product.image.startsWith('') || item.product.image.startsWith('http') ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{item.product.image}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900">{item.product.name}</p>
                          <p className="text-xs text-stone-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-stone-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Order Summary</h4>
                <div className="bg-stone-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Subtotal</span>
                    <span className="text-stone-900">{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Shipping</span>
                    <span className="text-stone-900">{formatPrice(selectedOrder.shipping || 0)}</span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Discount</span>
                      <span className="text-green-600">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium border-t border-stone-300 pt-2">
                    <span className="text-stone-900">Total</span>
                    <span className="text-stone-900">{formatPrice(selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-stone-600">Payment Method</span>
                    <span className="text-stone-900">{selectedOrder.payment_method || 'COD'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
