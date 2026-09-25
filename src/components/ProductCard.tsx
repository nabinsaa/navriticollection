import { Star, Plus } from 'lucide-react';
import { Product } from '../data/products';
import { useCurrency } from '../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div
        onClick={onClick}
        className="relative h-64 bg-gradient-to-br from-amber-50 to-orange-50 cursor-pointer overflow-hidden"
      >
        {product.image.startsWith('') || product.image.startsWith('http') ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            {product.image}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-medium rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3
            onClick={onClick}
            className="font-serif text-lg text-stone-900 font-semibold cursor-pointer hover:text-amber-600 transition-colors flex-1"
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-stone-700">{product.rating}</span>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-3">
          {product.origin}, {product.region}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.color.slice(0, 3).map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-xl font-bold text-stone-900">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={onAddToCart}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
