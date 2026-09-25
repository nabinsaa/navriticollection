import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onLoginClick: () => void;
}

export default function Cart({ isOpen, onClose, onCheckout, onLoginClick }: CartProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useOrder();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="text-xl font-serif font-semibold text-stone-900">Shopping Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-700" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4 bg-stone-50 rounded-lg">
                  <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image.startsWith('') || item.product.image.startsWith('http') ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">{item.product.image}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-stone-900">{item.product.name}</h3>
                    <p className="text-sm text-stone-600">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-stone-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-stone-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-auto p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-700">Subtotal</span>
              <span className="text-lg font-semibold text-stone-900">{formatPrice(cartTotal)}</span>
            </div>
            {isAuthenticated ? (
              <button
                onClick={onCheckout}
                className="w-full py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
              >
                Proceed to Checkout
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onLoginClick();
                }}
                className="w-full py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition-colors"
              >
                Login to Checkout
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
