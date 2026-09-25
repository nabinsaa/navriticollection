import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../data/products';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  customerName: string;
  customerEmail: string;
  paymentMethod?: string;
  currency?: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
}

interface OrderContextType {
  cart: CartItem[];
  orders: Order[];
  allOrders: Order[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string, customerEmail: string, couponCode?: string, discount?: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  loadOrders: () => Promise<void>;
  cartTotal: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      setAllOrders([]);
      return;
    }

    try {
      const { data: userOrders, error: userError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      const { data: allOrdersData, error: allError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      const convertOrder = (dbOrder: any): Order => ({
        id: dbOrder.id,
        user_id: dbOrder.user_id,
        items: dbOrder.items,
        total: dbOrder.total,
        status: dbOrder.status,
        createdAt: dbOrder.created_at,
        customerName: dbOrder.customer?.name || '',
        customerEmail: dbOrder.customer?.email || '',
        paymentMethod: dbOrder.payment_method,
        currency: dbOrder.currency,
        subtotal: dbOrder.subtotal,
        shipping: dbOrder.shipping,
        discount: dbOrder.discount,
        couponCode: dbOrder.coupon_code,
      });

      setOrders(userOrders?.map(convertOrder) || []);
      setAllOrders(allOrdersData?.map(convertOrder) || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (
    customerName: string,
    customerEmail: string,
    couponCode?: string,
    discount?: number
  ) => {
    if (!user) throw new Error('User not authenticated');

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 5000 ? 0 : 99;
    const finalDiscount = discount || 0;
    const total = subtotal + shipping - finalDiscount;

    const orderId = 'ORD-' + Date.now();
    const newOrder = {
      id: orderId,
      user_id: user.id,
      items: cart,
      customer: { name: customerName, email: customerEmail },
      payment_method: 'cod',
      currency: 'NPR',
      subtotal,
      shipping,
      discount: finalDiscount,
      coupon_code: couponCode || null,
      total,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) throw error;

    await loadOrders();
    clearCart();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    await loadOrders();
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <OrderContext.Provider
      value={{
        cart,
        orders,
        allOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        loadOrders,
        cartTotal,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within OrderProvider');
  return context;
}
