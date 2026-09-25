import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../data/products';
import { useCurrency } from '../context/CurrencyContext';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface ShopCollectionProps {
  categories: string[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAdmin: boolean;
  onGoToAdmin: () => void;
}

export default function ShopCollection({ 
  categories, 
  onProductClick, 
  onAddToCart, 
  isAdmin,
  onGoToAdmin 
}: ShopCollectionProps) {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const loadProducts = async () => {
    if (isSupabaseConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading products:', error);
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setProducts([]);
      }
    }
    setLoading(false);
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = `${product.name} ${product.origin} ${product.region} ${product.material} ${product.description}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setPriceRange([0, 100000]);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-4 text-stone-600 font-medium">Loading our collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white py-16 md:py-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full -ml-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full -mr-48 -mb-48 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-amber-200 border border-amber-400/30">
              ✨ Premium Collection
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 tracking-tight">
            Vastra Elegance
          </h1>
          <p className="text-lg md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover exquisite traditional clothing crafted with passion and heritage. 
            Each piece tells a story of artisanal craftsmanship, timeless elegance, and cultural richness.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              <span>Handcrafted with Love</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              <span>Free Shipping Over ₹5000</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Info Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif text-stone-900 font-semibold">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-stone-600 mt-1">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4 text-stone-700" />
                </button>
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-4 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Categories</label>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const count = category === 'All' 
                      ? products.length 
                      : products.filter(p => p.category === category).length;
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category
                            ? 'bg-amber-50 text-amber-900 border-2 border-amber-500'
                            : 'bg-stone-50 text-stone-700 border-2 border-transparent hover:bg-stone-100'
                        }`}
                      >
                        <span>{category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedCategory === category ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Price Range</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-stone-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="text-xs text-stone-500 text-center">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(selectedCategory !== 'All' || searchQuery || sortBy !== 'newest' || priceRange[0] !== 0 || priceRange[1] !== 100000) && (
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-16 text-center">
                <div className="text-7xl mb-4">🔍</div>
                <h3 className="text-2xl font-serif text-stone-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-stone-600 mb-6">
                  {isAdmin 
                    ? 'Start by adding products from the Admin Panel!' 
                    : 'Try adjusting your filters or check back soon for new arrivals!'}
                </p>
                {isAdmin ? (
                  <button
                    onClick={onGoToAdmin}
                    className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Go to Admin Panel
                  </button>
                ) : (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Display */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCardEnhanced
                        key={product.id}
                        product={product}
                        onClick={() => onProductClick(product)}
                        onAddToCart={() => onAddToCart(product)}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <ProductCardList
                        key={product.id}
                        product={product}
                        onClick={() => onProductClick(product)}
                        onAddToCart={() => onAddToCart(product)}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? 'bg-stone-900 text-white shadow-lg'
                              : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="text-sm font-medium">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <div className="mt-4 text-center text-sm text-stone-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                    <span className="mx-2">•</span>
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Grid Product Card
interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: () => void;
  formatPrice: (price: number) => string;
}

function ProductCardEnhanced({ product, onClick, onAddToCart, formatPrice }: ProductCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-72 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        {product.image.startsWith('') || product.image.startsWith('http') ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {product.image}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
              🆕 New
            </span>
          )}
          {product.is_bestseller && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
              🔥 Bestseller
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-medium rounded-full shadow">
            {product.category}
          </span>
        </div>

        {/* Stock Status */}
        {product.stock_quantity !== undefined && product.stock_quantity <= (product.low_stock_threshold || 10) && (
          <div className="absolute bottom-3 left-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
              product.stock_quantity === 0
                ? 'bg-red-500 text-white'
                : 'bg-orange-500 text-white'
            }`}>
              {product.stock_quantity === 0 ? 'Out of Stock' : `Only ${product.stock_quantity} left`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Rating */}
        <div className="mb-3">
          <h3 className="font-serif text-lg text-stone-900 font-semibold mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-stone-600">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        {/* Origin & Material */}
        <div className="mb-3 space-y-1">
          <p className="text-sm text-stone-600">
            <span className="font-medium">Origin:</span> {product.origin}, {product.region}
          </p>
          <p className="text-sm text-stone-600">
            <span className="font-medium">Material:</span> {product.material}
          </p>
        </div>

        {/* Colors */}
        {product.color && product.color.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-stone-500 mb-1.5">Available Colors:</p>
            <div className="flex flex-wrap gap-1.5">
              {product.color.slice(0, 3).map((c, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full"
                >
                  {c}
                </span>
              ))}
              {product.color.length > 3 && (
                <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
                  +{product.color.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div>
            {product.discount_price ? (
              <>
                <span className="text-xl font-bold text-stone-900">
                  {formatPrice(product.discount_price)}
                </span>
                <span className="text-sm text-stone-400 line-through ml-2">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-stone-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={product.stock_quantity === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// List View Product Card
function ProductCardList({ product, onClick, onAddToCart, formatPrice }: ProductCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative md:w-64 h-64 md:h-auto bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden flex-shrink-0">
          {product.image.startsWith('') || product.image.startsWith('http') ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              {product.image}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
                ⭐ Featured
              </span>
            )}
            {product.is_new_arrival && (
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
                🆕 New
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-serif text-xl text-stone-900 font-semibold mb-2 group-hover:text-amber-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-stone-600">
                <span className="px-3 py-1 bg-stone-100 rounded-full">{product.category}</span>
                <span>{product.origin}, {product.region}</span>
              </div>
            </div>
            <div className="text-right">
              {product.discount_price ? (
                <>
                  <p className="text-2xl font-bold text-stone-900">
                    {formatPrice(product.discount_price)}
                  </p>
                  <p className="text-sm text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-stone-900">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-stone-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-stone-600 mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium text-stone-900">Material:</span>{' '}
              <span className="text-stone-600">{product.material}</span>
            </div>
            <div>
              <span className="font-medium text-stone-900">Process:</span>{' '}
              <span className="text-stone-600">{product.process}</span>
            </div>
            <div>
              <span className="font-medium text-stone-900">Size:</span>{' '}
              <span className="text-stone-600">{product.size}</span>
            </div>
          </div>

          {/* Colors */}
          {product.color && product.color.length > 0 && (
            <div className="mb-4">
              <span className="text-xs text-stone-500 mb-1.5 block">Available Colors:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.color.map((c, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2">
              {product.stock_quantity !== undefined && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  product.stock_quantity === 0
                    ? 'bg-red-100 text-red-700'
                    : product.stock_quantity <= 10
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={product.stock_quantity === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
