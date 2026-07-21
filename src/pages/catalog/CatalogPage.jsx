import { useState, useMemo } from 'react'
import FilterTopBar from '../../components/catalog/FilterTopBar'
import ProductCard from '../../components/catalog/ProductCard'
import './CatalogPage.css'

// Dummy data — akan diganti API di Fase 2
const DUMMY_PRODUCTS = [
  { id: 1, name: 'The Cambridge', shape: 'Round', color: 'Tortoise', price: 2175000, category: 'Sunglasses', bestSeller: false, rating: 4.7 },
  { id: 2, name: 'The Architect', shape: 'Square', color: 'Matte Black', price: 2460000, category: 'Sunglasses', bestSeller: false, rating: 4.6 },
  { id: 3, name: 'The Maverick', shape: 'Aviator', color: 'Gold', price: 2760000, category: 'Sunglasses', bestSeller: true, rating: 4.9 },
  { id: 4, name: 'The Ghost', shape: 'Cat Eye', color: 'Clear', price: 2235000, category: 'Blue Light', bestSeller: false, rating: 4.5 },
  { id: 5, name: 'Classic Scholar', shape: 'Round', color: 'Dark Gray', price: 1890000, category: 'Reading Glasses', bestSeller: false, rating: 4.4 },
  { id: 6, name: 'Aero Slim', shape: 'Aviator', color: 'Black', price: 2450000, category: 'Minus', bestSeller: false, rating: 4.8 },
]

const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rating']

function CatalogPage() {
  const [filters, setFilters] = useState({ categories: [], shapes: [], colors: [] })
  const [sort, setSort] = useState('Newest')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = [...DUMMY_PRODUCTS]

    // Search
    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.color.toLowerCase().includes(search.toLowerCase()) ||
        p.shape.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category))
    }

    // Shape filter
    if (filters.shapes.length > 0) {
      result = result.filter(p => filters.shapes.includes(p.shape))
    }

    // Sort
    if (sort === 'Price: Low to High') result.sort((a, b) => a.price - b.price)
    else if (sort === 'Price: High to Low') result.sort((a, b) => b.price - a.price)
    else if (sort === 'Best Rating') result.sort((a, b) => b.rating - a.rating)

    return result
  }, [filters, sort, search])

  return (
    <div className="cat-wrapper">
      {/* Main Content (Full Width) */}
      <div className="cat-main">
        {/* Header */}
        <div className="cat-header">
          <div className="cat-header-left">
            <h1 className="cat-title">Explore Frames</h1>
            <span className="cat-count">{filtered.length} produk ditemukan</span>
          </div>
          <div className="cat-header-right">
            {/* Search */}
            <div className="cat-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A7F78" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search frames..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="cat-search"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="cat-sort"
            >
              {SORT_OPTIONS.map(o => <option key={o} value={o}>Sort by: {o}</option>)}
            </select>
          </div>
        </div>

        {/* Top Bar Filter */}
        <FilterTopBar filters={filters} onChange={setFilters} />

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="cat-grid">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="cat-empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C5B8AF" strokeWidth="1.2">
              <circle cx="6" cy="15" r="3" /><circle cx="18" cy="15" r="3" />
              <path d="M9 15h6" /><path d="M3 15c0-4.5 2.5-7 3-7h12c.5 0 3 2.5 3 7" />
            </svg>
            <p>Tidak ada produk yang ditemukan</p>
            <button onClick={() => { setFilters({ categories: [], shapes: [], colors: [] }); setSearch('') }} className="cat-reset-btn">
              Reset Filter
            </button>
          </div>
        )}

        {/* Load More */}
        {filtered.length > 0 && (
          <div className="cat-load-more">
            <button className="cat-load-btn">Load More Frames</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogPage
