import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Plus, Minus, ShoppingBag, Heart, Share2, ZoomIn, X, MessageCircle } from 'lucide-react';
import { Product } from '../data/products';
import { useCurrency } from '../context/CurrencyContext';
import { useOrder } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Feedback {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  admin_response?: string;
}

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useOrder();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const inWishlist = isInWishlist(product.id);

  // Handle both emoji and image URLs
  const isImage = product.image.startsWith('http') || product.image.startsWith('');
  
  // Get additional images if available
  const allImages = [
    product.image,
    ...(product.additional_images || [])
  ];

  // Load feedbacks for this product
  useEffect(() => {
    loadFeedbacks();
  }, [product.id]);

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - ${product.description.substring(0, 100)}...`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('✅ Product link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('✅ Product link copied to clipboard!');
      } catch (clipboardError) {
        alert('❌ Could not share product. Please try again.');
      }
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      alert('Please login to leave feedback');
      return;
    }

    if (!feedbackComment.trim()) {
      alert('Please write your feedback');
      return;
    }

    setSubmittingFeedback(true);

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          user_id: user.id,
          user_name: user.name || user.email,
          user_email: user.email,
          rating: feedbackRating,
          comment: feedbackComment,
          product_id: product.id,
        }]);

      if (error) throw error;

      alert('✅ Thank you for your feedback!');
      setShowFeedbackForm(false);
      setFeedbackComment('');
      setFeedbackRating(5);
      await loadFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('❌ Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div 
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 aspect-square relative cursor-zoom-in group"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {isImage ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}>
                  <span className="text-9xl">{product.image}</span>
                </div>
              )}
              
              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-stone-700" />
              </div>

              {/* Zoom Close Button */}
              {isZoomed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                  }}
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-stone-700" />
                </button>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {img.startsWith('http') || img.startsWith('') ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                        <span className="text-3xl">{img}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_featured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  ⭐ Featured
                </span>
              )}
              {product.is_new_arrival && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  🆕 New Arrival
                </span>
              )}
              {product.is_bestseller && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  🔥 Bestseller
                </span>
              )}
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl font-serif text-stone-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-stone-600">
                    ({product.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-stone-900">
                {formatPrice(product.price)}
              </span>
              {product.discount_price && (
                <>
                  <span className="text-2xl text-stone-400 line-through">
                    {formatPrice(product.discount_price)}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Save {formatPrice(product.price - product.discount_price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Description</h3>
              <p className="text-stone-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-stone-200">
              <div>
                <p className="text-sm text-stone-600 mb-1">Origin</p>
                <p className="font-medium text-stone-900">{product.origin}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 mb-1">Region</p>
                <p className="font-medium text-stone-900">{product.region}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 mb-1">Material</p>
                <p className="font-medium text-stone-900">{product.material}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 mb-1">Process</p>
                <p className="font-medium text-stone-900">{product.process}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 mb-1">Size</p>
                <p className="font-medium text-stone-900">{product.size}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600 mb-1">Weight</p>
                <p className="font-medium text-stone-900">{product.weight}</p>
              </div>
            </div>

            {/* Colors */}
            {product.color && product.color.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((color, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Story */}
            {product.story && (
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-stone-900 mb-2">The Story</h3>
                <p className="text-stone-700 leading-relaxed italic">{product.story}</p>
              </div>
            )}

            {/* Stock Status */}
            {product.stock_quantity !== undefined && (
              <div className="flex items-center gap-2">
                {product.stock_quantity > 10 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 font-medium">In Stock</span>
                  </>
                ) : product.stock_quantity > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-700 font-medium">
                      Only {product.stock_quantity} left in stock
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 pt-6 border-t border-stone-200">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3 border border-stone-300 rounded-lg px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>

              {/* Wishlist Button */}
              <button 
                onClick={handleWishlistToggle}
                className={`p-3 border rounded-lg transition-all ${
                  inWishlist 
                    ? 'bg-red-50 border-red-300 hover:bg-red-100' 
                    : 'border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 pt-4 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share this product</span>
            </button>

            {/* Product Feedback Section */}
            <div className="pt-6 border-t border-stone-200">
              <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Customer Feedback ({feedbacks.length})
              </h3>

              {/* Feedback List */}
              {feedbacks.length > 0 && (
                <div className="space-y-4 mb-6">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="bg-white border border-stone-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-stone-900">{feedback.user_name}</p>
                          <p className="text-xs text-stone-500">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= feedback.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-700 text-sm mb-3">{feedback.comment}</p>
                      
                      {/* Admin Response */}
                      {feedback.admin_response && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                          <p className="text-xs font-semibold text-amber-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-amber-800">{feedback.admin_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback Form */}
              {user && !showFeedbackForm && (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="w-full py-3 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-colors"
                >
                  ✍️ Write a Review
                </button>
              )}

              {showFeedbackForm && (
                <div className="bg-stone-50 rounded-lg p-6 space-y-4">
                  <h4 className="font-medium text-stone-900">Your Review</h4>
                  
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= feedbackRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Your Feedback
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="flex-1 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setFeedbackComment('');
                        setFeedbackRating(5);
                      }}
                      className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg font-medium hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!user && (
                <p className="text-sm text-stone-500 text-center py-4">
                  Please login to leave a review
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
