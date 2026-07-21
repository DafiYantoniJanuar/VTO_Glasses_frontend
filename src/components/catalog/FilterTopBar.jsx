import { useState, useRef, useEffect } from 'react'
import './FilterTopBar.css'

const CATEGORIES = ['Reading Glasses', 'Sunglasses', 'Blue Light', 'Minus']
const SHAPES = ['Round', 'Square', 'Aviator', 'Cat Eye']
const COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Dark Gray', hex: '#4a4a4a' },
  { name: 'White', hex: '#f0f0f0' },
  { name: 'Gold', hex: '#C5A256' },
  { name: 'Tortoise', hex: '#8B5E3C' },
  { name: 'Clear', hex: '#D0EDFF' },
]

function FilterTopBar({ filters, onChange }) {
  const { categories = [], shapes = [], colors = [] } = filters || {}
  const [activeMenu, setActiveMenu] = useState(null)
  const barRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleItem = (key, value) => {
    const current = filters[key] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: updated })
  }

  const clearFilters = () => {
    onChange({ categories: [], shapes: [], colors: [] })
    setActiveMenu(null)
  }

  const activeCount = categories.length + shapes.length + colors.length

  return (
    <div className="ftb-container" ref={barRef}>
      <div className="ftb-actions">
        {/* Category Dropdown */}
        <div className="ftb-dropdown">
          <button 
            className={`ftb-btn ${categories.length > 0 ? 'has-selection' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'category' ? null : 'category')}
          >
            Category {categories.length > 0 && `(${categories.length})`}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          {activeMenu === 'category' && (
            <div className="ftb-menu">
              {CATEGORIES.map(cat => (
                <label key={cat} className="ftb-checkbox-row">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggleItem('categories', cat)}
                    className="ftb-checkbox"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Shape Dropdown */}
        <div className="ftb-dropdown">
          <button 
            className={`ftb-btn ${shapes.length > 0 ? 'has-selection' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'shape' ? null : 'shape')}
          >
            Shape {shapes.length > 0 && `(${shapes.length})`}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          {activeMenu === 'shape' && (
            <div className="ftb-menu ftb-menu-pills">
              {SHAPES.map(shape => (
                <button
                  key={shape}
                  className={`ftb-pill ${shapes.includes(shape) ? 'active' : ''}`}
                  onClick={() => toggleItem('shapes', shape)}
                >
                  {shape}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Dropdown */}
        <div className="ftb-dropdown">
          <button 
            className={`ftb-btn ${colors.length > 0 ? 'has-selection' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
          >
            Color {colors.length > 0 && `(${colors.length})`}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          {activeMenu === 'color' && (
            <div className="ftb-menu ftb-menu-colors">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  title={c.name}
                  className={`ftb-color-swatch ${colors.includes(c.name) ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => toggleItem('colors', c.name)}
                />
              ))}
            </div>
          )}
        </div>
        
        {activeCount > 0 && (
          <button className="ftb-clear-btn" onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Active Tags */}
      {activeCount > 0 && (
        <div className="ftb-tags">
          {categories.map(cat => (
            <span key={cat} className="ftb-tag" onClick={() => toggleItem('categories', cat)}>
              {cat} ✕
            </span>
          ))}
          {shapes.map(shape => (
            <span key={shape} className="ftb-tag" onClick={() => toggleItem('shapes', shape)}>
              {shape} ✕
            </span>
          ))}
          {colors.map(color => (
            <span key={color} className="ftb-tag" onClick={() => toggleItem('colors', color)}>
              {color} ✕
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterTopBar
