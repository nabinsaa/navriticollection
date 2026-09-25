import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useOrder } from '../context/OrderContext';
import { Product } from '../data/products';

interface WishlistPageProps {
  onBack: () => void;
  onLoginClick: () => void;
}

interface WishlistItem {
  id: string;
  product: Product;
  created_at: string;
}

export default function WishlistPage({ onBack, onLoginClick }: WishlistPageProps) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToCart } = useOrder();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get wishlist items
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (wishlistError) throw wishlistError;

      // Transform data
      const items: WishlistItem[] = (wishlistData || []).map((item: any) => ({
        id: item.id,
        product: item.products,
        created_at: item.created_at
      }));

      setWishlist(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      alert('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlist(wishlist.filter(item => item.id !== wishlistId));
      alert('✅ Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const addToCartFromWishlist = (product: Product) => {
    addToCart(product);
    alert('✅ Added to cart!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-16 h-16 text-stone-300 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Login Required</h2>
          <p className="text-stone-600 mb-6">
            Please login to view your wishlist
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onLoginClick}
              className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
            >
              Login / Sign Up
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 border border-stone-300 text-stone-700 rounded-full font-medium hover:bg-stone-50 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shop</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-serif text-stone-900 mb-2">My Wishlist</h1>
          <p className="text-stone-600">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
            <Heart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-stone-900 mb-2">Your wishlist is empty</h3>
            <p className="text-stone-600 mb-6">
              Start adding products you love to your wishlist
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                  {item.product.image.startsWith('http') || item.product.image.startsWith('') ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-7xl">{item.product.image}</span>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-serif text-lg text-stone-900 font-semibold mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>
                  
                  <p className="text-sm text-stone-600 mb-3">
                    {item.product.origin}, {item.product.region}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.product.color?.slice(0, 2).map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="text-xl font-bold text-stone-900">
                      {formatPrice(item.product.price)}
                    </span>
                    <button
                      onClick={() => addToCartFromWishlist(item.product)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
