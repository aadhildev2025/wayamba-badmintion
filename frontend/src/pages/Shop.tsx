import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Package, Grid3X3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from './Home';

interface Product {
  _id: string; name: string; slug: string; price: number; salePrice?: number;
  images?: { url: string }[]; brand?: { name: string; _id?: string }; category?: { name: string; _id?: string };
  stockQuantity: number; averageRating?: number; reviewCount?: number; isFeatured?: boolean;
}
interface FilterItem { _id: string; name: string; }

const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest' },
  { label: 'Price: Low → High',  value: 'price_asc' },
  { label: 'Price: High → Low',  value: 'price_desc' },
  { label: 'Best Rated',         value: 'rating' },
  { label: 'Name A–Z',           value: 'name_asc' },
];
const DEFAULT_BRANDS: FilterItem[] = [
  { _id:'b1', name:'Yonex' }, { _id:'b2', name:'Li-Ning' }, { _id:'b3', name:'Victor' },
  { _id:'b4', name:'Apacs' }, { _id:'b5', name:'Kawasaki' }, { _id:'b6', name:'Fleet' },
];

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderRadius: 14, border: '1px solid var(--b1)', background: 'var(--bg-3)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 11.5, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{title}</span>
        <ChevronDown size={14} style={{ color: 'var(--t3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <div style={{ padding: '8px 12px 14px', borderTop: '1px solid var(--b1)' }}>{children}</div>}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 99,
      background: 'var(--red-vivid)', color: '#FFFFFF',
      fontSize: 12.5, fontWeight: 800, fontFamily: 'Outfit',
      boxShadow: '0 2px 10px rgba(176,28,40,0.3)'
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 0 }}>
        <X size={13} />
      </button>
    </div>
  );
}

function ListCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  let imgSrc = '/imgs/hero_rackets.png';
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = (product.images as any)[0];
    imgSrc = typeof firstImg === 'string' ? firstImg : firstImg?.url || '/imgs/hero_rackets.png';
  }
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const isOnSale = !!product.salePrice && product.salePrice < product.price;

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      style={{
        display: 'flex', gap: 20, padding: 20,
        borderRadius: 18, border: '1px solid var(--b1)',
        background: 'var(--surface)', cursor: 'pointer', transition: 'all 0.22s',
        alignItems: 'center',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--red-border)';
        (e.currentTarget as HTMLElement).style.transform = 'translateX(5px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)';
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ width: 96, height: 96, borderRadius: 14, background: 'var(--bg-4)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--b1)' }}>
        <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).src = '/imgs/hero_rackets.png'; }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--red-vivid)', marginBottom: 5 }}>{product.brand?.name}</div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16.5, color: 'var(--t1)', marginBottom: 10, lineHeight: 1.25 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontFamily: 'Outfit', fontWeight: 800, fontSize: 18,
            background: 'var(--grad-silver)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Rs. {displayPrice.toLocaleString()}</span>
          {isOnSale && <span style={{ fontSize: 13, color: 'var(--t3)', textDecoration: 'line-through' }}>Rs. {product.price.toLocaleString()}</span>}
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); addToCart({ _id: product._id, name: product.name, price: displayPrice, image: imgSrc }); }}
        className="btn btn-primary btn-sm"
        style={{ alignSelf: 'center', flexShrink: 0 }}
      >Add to Cart</button>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [filtered, setFiltered] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<FilterItem[]>(FALLBACK_CATEGORIES);
  const [brands, setBrands] = useState<FilterItem[]>(DEFAULT_BRANDS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch]         = useState(searchParams.get('search') ?? '');
  const [selCategory, setSelCategory] = useState(searchParams.get('category') ?? '');
  const [selBrand, setSelBrand]     = useState(searchParams.get('brand') ?? '');
  const [sortBy, setSortBy]         = useState('newest');
  const [priceMin, setPriceMin]     = useState('');
  const [priceMax, setPriceMax]     = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/products?limit=200&status=active'),
      api.get('/categories'),
      api.get('/brands'),
    ])
      .then(([pRes, cRes, bRes]) => {
        const fetched: Product[] = Array.isArray(pRes.data) ? pRes.data : pRes.data?.products ?? [];
        if (fetched.length > 0) setProducts(fetched);
        const fetchedCats = Array.isArray(cRes.data) ? cRes.data : [];
        if (fetchedCats.length > 0) setCategories(fetchedCats);
        const fetchedBrands = Array.isArray(bRes.data) ? bRes.data : [];
        if (fetchedBrands.length > 0) setBrands(fetchedBrands);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const applyFilters = useCallback(() => {
    let res = [...products];
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(p => p.name.toLowerCase().includes(q) || p.brand?.name?.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q));
    }
    if (selCategory) {
      const cq = selCategory.toLowerCase();
      res = res.filter(p => p.category?.name?.toLowerCase() === cq || p.category?._id === selCategory);
    }
    if (selBrand) {
      const bq = selBrand.toLowerCase();
      res = res.filter(p => p.brand?.name?.toLowerCase() === bq || p.brand?._id === selBrand);
    }
    if (priceMin) res = res.filter(p => (p.salePrice ?? p.price) >= Number(priceMin));
    if (priceMax) res = res.filter(p => (p.salePrice ?? p.price) <= Number(priceMax));
    if (inStockOnly) res = res.filter(p => p.stockQuantity > 0);
    switch (sortBy) {
      case 'price_asc':  res.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break;
      case 'price_desc': res.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break;
      case 'rating':     res.sort((a, b) => (b.averageRating ?? 4.8) - (a.averageRating ?? 4.8)); break;
      case 'name_asc':   res.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    setFiltered(res);
  }, [products, search, selCategory, selBrand, priceMin, priceMax, inStockOnly, sortBy]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const clearFilters = () => {
    setSearch(''); setSelCategory(''); setSelBrand('');
    setPriceMin(''); setPriceMax(''); setInStockOnly(false); setSortBy('newest');
    setSearchParams({});
  };
  const hasFilters = search || selCategory || selBrand || priceMin || priceMax || inStockOnly;

  /* filter button style helper */
  const filterBtnStyle = (active: boolean) => ({
    textAlign: 'left' as const,
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13.5,
    fontFamily: 'Outfit',
    fontWeight: active ? 800 : 500,
    background: active ? 'var(--red-vivid)' : 'transparent',
    color: active ? '#FFFFFF' : 'var(--t2)',
    border: active ? '1px solid var(--red-vivid)' : '1px solid transparent',
    boxShadow: active ? '0 4px 14px rgba(176,28,40,0.35)' : 'none',
    cursor: 'pointer',
    transition: 'all 0.18s var(--ease)',
    width: '100%',
  });

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>

      {/* ── PAGE BANNER ── */}
      <div style={{ position: 'relative', background: 'var(--bg-2)', borderBottom: '1px solid var(--b1)', overflow: 'hidden' }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
        <div className="container" style={{ paddingTop: 48, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Wayamba Badminton Home</div>
              <h1 className="display-md" style={{ color: 'var(--t1)', marginBottom: 6 }}>Pro Equipment Catalog</h1>
              <p style={{ color: 'var(--t3)', fontSize: 14 }}>
                {loading ? 'Loading products…' : `${filtered.length} authentic equipment item${filtered.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            {/* Search */}
            <div style={{ position: 'relative', flex: '0 0 auto', minWidth: 320 }}>
              <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search rackets, shoes, shuttlecocks…"
                className="input"
                style={{ paddingLeft: 46, paddingRight: search ? 40 : 16 }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 100 }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* ── SIDEBAR FILTERS ── */}
          <aside className="hidden-mobile" style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 108 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>Filters</span>
              {hasFilters && (
                <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--red-vivid)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Reset All</button>
              )}
            </div>

            {/* Category Filter */}
            <FilterBlock title="Category">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[{ _id: '', name: 'All Categories' }, ...categories].map(c => {
                  const active = c._id === '' ? !selCategory : selCategory === c.name;
                  return (
                    <button key={c._id} onClick={() => setSelCategory(c._id === '' ? '' : c.name)} style={filterBtnStyle(active)}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </FilterBlock>

            {/* Brand Filter */}
            <FilterBlock title="Brand">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[{ _id: '', name: 'All Brands' }, ...brands].map(b => {
                  const active = b._id === '' ? !selBrand : selBrand === b.name;
                  return (
                    <button key={b._id} onClick={() => setSelBrand(b._id === '' ? '' : b.name)} style={filterBtnStyle(active)}>
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </FilterBlock>

            {/* Price Range */}
            <FilterBlock title="Price Range (Rs.)">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Min" className="input" style={{ flex: 1, padding: '9px 12px' }} />
                <span style={{ color: 'var(--t3)', fontSize: 13 }}>–</span>
                <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Max" className="input" style={{ flex: 1, padding: '9px 12px' }} />
              </div>
            </FilterBlock>

            {/* In Stock Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', padding: '13px 15px', borderRadius: 13, border: '1px solid var(--b1)', background: 'var(--bg-3)' }}>
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--red)' }} />
              <span style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>In Stock Only</span>
            </label>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
              <button
                onClick={() => setFiltersOpen(true)}
                className="btn btn-outline btn-sm show-mobile"
                style={{ display: 'none' }}
              >
                <SlidersHorizontal size={14} /> Filters {hasFilters ? `(${[search,selCategory,selBrand,priceMin,priceMax,inStockOnly].filter(Boolean).length})` : ''}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: 13, color: 'var(--t3)', fontWeight: 600 }}>Sort:</span>
                <div style={{ position: 'relative' }}>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                    appearance: 'none', padding: '9px 36px 9px 14px',
                    background: 'var(--bg-4)', border: '1.5px solid var(--bs)',
                    borderRadius: 11, color: 'var(--t1)', fontSize: 13.5,
                    outline: 'none', cursor: 'pointer',
                    fontFamily: 'Outfit', fontWeight: 700,
                  }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['grid', 'list'] as const).map(mode => (
                    <button key={mode} onClick={() => setViewMode(mode)} style={{
                      width: 38, height: 38, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: viewMode === mode ? 'var(--red-vivid)' : 'var(--bg-4)',
                      color: viewMode === mode ? '#FFFFFF' : 'var(--t3)',
                      border: `1.5px solid ${viewMode === mode ? 'var(--red-vivid)' : 'var(--bs)'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {mode === 'grid' ? <Grid3X3 size={15} /> : <List size={15} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {selCategory && <Chip label={`Category: ${selCategory}`} onRemove={() => setSelCategory('')} />}
                {selBrand    && <Chip label={`Brand: ${selBrand}`}       onRemove={() => setSelBrand('')} />}
                {priceMin    && <Chip label={`Min: Rs. ${priceMin}`}     onRemove={() => setPriceMin('')} />}
                {priceMax    && <Chip label={`Max: Rs. ${priceMax}`}     onRemove={() => setPriceMax('')} />}
                {inStockOnly && <Chip label="In Stock Only"              onRemove={() => setInStockOnly(false)} />}
              </div>
            )}

            {/* Product listing */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--t3)' }}>
                <Package size={56} style={{ opacity: 0.18, margin: '0 auto 18px' }} />
                <h3 style={{ fontFamily: 'Outfit', fontSize: 24, color: 'var(--t2)', marginBottom: 10 }}>No equipment matches your filters</h3>
                <p style={{ fontSize: 14 }}>Try adjusting your search criteria or resetting filters.</p>
                <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ marginTop: 24 }}>Reset All Filters</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {filtered.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.32) }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.24) }}>
                    <ListCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200 }}
              onClick={() => setFiltersOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 290,
                background: 'var(--bg-2)', zIndex: 201, overflowY: 'auto', padding: '24px 18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--t1)' }}>Filters</span>
                <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FilterBlock title="Category">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[{ _id: '', name: 'All Categories' }, ...categories].map(c => {
                      const active = c._id === '' ? !selCategory : selCategory === c.name;
                      return (
                        <button key={c._id} onClick={() => { setSelCategory(c._id === '' ? '' : c.name); setFiltersOpen(false); }} style={filterBtnStyle(active)}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </FilterBlock>
              </div>
              <button onClick={() => { clearFilters(); setFiltersOpen(false); }} className="btn btn-outline" style={{ width: '100%', marginTop: 22 }}>Reset Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

