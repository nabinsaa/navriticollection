import { useState } from 'react';
import { ArrowLeft, Star, Plus, Minus, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { Product } from '../data/products';
import { useCurrency } from '../context/CurrencyContext';
import { useOrder } from '../context/OrderContext';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useOrder();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Handle both emoji and image URLs
  const isImage = product.image.startsWith('http') || product.image.startsWith('');
  
  // Get additional images if available
  const allImages = [
    product.image,
    ...(product.additional_images || [])
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
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
            {/* Main Image */}
            <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 aspect-square">
              {isImage ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                  <span className="text-9xl">{product.image}</span>
                </div>
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
              <button className="p-3 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors">
                <Heart className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2 pt-4">
              <Share2 className="w-4 h-4 text-stone-600" />
              <span className="text-sm text-stone-600">Share this product</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
