import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown, Package, Grid3X3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES } from './Home';

interface Product {
  _id: string; name: string; slug: string; price: number; salePrice?: number;
  hasCasePricing?: boolean; casePrice?: number; caseSalePrice?: number; caseUnitsCount?: number;
  piecePrice?: number; pieceSalePrice?: number;
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
    <div style={{ borderBottom: '1px solid var(--b1)', paddingBottom: 18, marginBottom: 18 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px',
        }}
      >
        <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t1)' }}>
          {title}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--t3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && children}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 99,
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
  const navigate = useNavigate();
  let imgSrc = '/imgs/hero_rackets.png';
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = (product.images as any)[0];
    imgSrc = typeof firstImg === 'string' ? firstImg : firstImg?.url || '/imgs/hero_rackets.png';
  }
  const regularPrice = Number(product.piecePrice || product.price) || 0;
  const salePriceVal = Number(product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || 0;
  const isOnSale = salePriceVal > 0 && salePriceVal < regularPrice;
  const displayPrice = isOnSale ? salePriceVal : regularPrice;

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
        <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} onError={e => { (e.target as HTMLImageElement).src = '/imgs/hero_rackets.png'; }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--red-vivid)', marginBottom: 5 }}>{product.brand?.name}</div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16.5, color: 'var(--t1)', marginBottom: 6, lineHeight: 1.25 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Outfit', fontWeight: 800, fontSize: 18,
            background: 'var(--grad-silver)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Rs. {displayPrice.toLocaleString()} {product.hasCasePricing ? <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>/ piece</span> : null}</span>
          {isOnSale && <span style={{ fontSize: 13, color: 'var(--t3)', textDecoration: 'line-through' }}>Rs. {regularPrice.toLocaleString()}</span>}
        </div>
        {product.hasCasePricing && product.casePrice && (
          <div style={{ fontSize: 11.5, color: '#10B981', fontWeight: 700, marginTop: 4 }}>
            📦 Case / Tube ({product.caseUnitsCount || 12} pcs): Rs. {(product.caseSalePrice || product.casePrice).toLocaleString()}
          </div>
        )}
      </div>
      <button
        onClick={e => {
          e.stopPropagation();
          navigate(`/product/${product.slug}`);
        }}
        className="btn btn-primary btn-sm"
        style={{ alignSelf: 'center', flexShrink: 0 }}
      >
        {product.hasCasePricing ? 'Select Option' : 'View Details'}
      </button>
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

  // Sync state when URL searchParams change
  useEffect(() => {
    const catParam = searchParams.get('category') ?? '';
    const brandParam = searchParams.get('brand') ?? '';
    const searchParam = searchParams.get('search') ?? '';
    setSelCategory(catParam);
    setSelBrand(brandParam);
    setSearch(searchParam);
  }, [searchParams]);

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

  const handleSelectCategory = (catName: string) => {
    const target = catName === 'All Categories' ? '' : catName;
    setSelCategory(target);
    const newParams = new URLSearchParams(searchParams);
    if (target) {
      newParams.set('category', target);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSelectBrand = (brandName: string) => {
    const target = brandName === 'All Brands' ? '' : brandName;
    setSelBrand(target);
    const newParams = new URLSearchParams(searchParams);
    if (target) {
      newParams.set('brand', target);
    } else {
      newParams.delete('brand');
    }
    setSearchParams(newParams, { replace: true });
  };

  const applyFilters = useCallback(() => {
    let res = [...products];
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(p => {
        const pName = (p.name || '').toLowerCase();
        const brandObj: any = p.brand;
        const bName = (typeof brandObj === 'object' ? brandObj?.name : (typeof brandObj === 'string' ? brandObj : ''))?.toLowerCase() || '';
        const catObj: any = p.category;
        const cName = (typeof catObj === 'object' ? catObj?.name : (typeof catObj === 'string' ? catObj : ''))?.toLowerCase() || '';
        return pName.includes(q) || bName.includes(q) || cName.includes(q);
      });
    }
    if (selCategory && selCategory !== 'All Categories' && selCategory !== 'all') {
      const cq = selCategory.toLowerCase().trim();
      res = res.filter(p => {
        const catObj: any = p.category;
        const catName = (typeof catObj === 'object' ? catObj?.name : (typeof catObj === 'string' ? catObj : ''))?.toLowerCase()?.trim() || '';
        const catId = typeof catObj === 'object' ? catObj?._id : (typeof catObj === 'string' ? catObj : '');
        return catName === cq || catId === selCategory;
      });
    }
    if (selBrand && selBrand !== 'All Brands' && selBrand !== 'all') {
      const bq = selBrand.toLowerCase().trim();
      res = res.filter(p => {
        const brandObj: any = p.brand;
        const bName = (typeof brandObj === 'object' ? brandObj?.name : (typeof brandObj === 'string' ? brandObj : ''))?.toLowerCase()?.trim() || '';
        const bId = typeof brandObj === 'object' ? brandObj?._id : (typeof brandObj === 'string' ? brandObj : '');
        return bName === bq || bId === selBrand;
      });
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
    setSearchParams({}, { replace: true });
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

  const pageTitle = selCategory && selCategory !== 'All Categories'
    ? `Buy ${selCategory} in Sri Lanka`
    : selBrand && selBrand !== 'All Brands'
      ? `Buy Genuine ${selBrand} Badminton & Sports Equipment in Sri Lanka`
      : search
        ? `Search Results for "${search}" - Badminton & Sports Sri Lanka`
        : 'Buy Badminton Rackets, Court Shoes & Sports Equipment Sri Lanka';

  const pageDesc = selCategory && selCategory !== 'All Categories'
    ? `Explore our genuine collection of ${selCategory} in Sri Lanka. 100% authentic Yonex, Li-Ning, Victor gear with islandwide express delivery across Sri Lanka.`
    : 'Shop genuine badminton rackets, indoor court shoes, feather shuttlecocks, cricket bats, and tennis racquets with islandwide delivery across Sri Lanka.';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <SEO
        title={pageTitle}
        description={pageDesc}
        keywords={`Buy ${selCategory || 'badminton'}, ${selBrand || 'Yonex'} Sri Lanka, badminton rackets Sri Lanka, shuttlecocks Sri Lanka, sports shop Sri Lanka, badminton price in Sri Lanka`}
      />

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
                value={search} onChange={e => {
                  setSearch(e.target.value);
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value.trim()) {
                    newParams.set('search', e.target.value.trim());
                  } else {
                    newParams.delete('search');
                  }
                  setSearchParams(newParams, { replace: true });
                }}
                placeholder="Search rackets, shoes, shuttlecocks…"
                className="input"
                style={{ paddingLeft: 46, paddingRight: search ? 40 : 16 }}
              />
              {search && (
                <button onClick={() => {
                  setSearch('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams, { replace: true });
                }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
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
                  const active = c._id === '' ? (!selCategory || selCategory === 'All Categories') : (selCategory === c.name || selCategory === c._id);
                  return (
                    <button key={c._id} onClick={() => handleSelectCategory(c._id === '' ? '' : c.name)} style={filterBtnStyle(active)}>
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
                  const active = b._id === '' ? (!selBrand || selBrand === 'All Brands') : (selBrand === b.name || selBrand === b._id);
                  return (
                    <button key={b._id} onClick={() => handleSelectBrand(b._id === '' ? '' : b.name)} style={filterBtnStyle(active)}>
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

          {/* ── PRODUCTS SECTION ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Controls Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 14, marginBottom: 24, paddingBottom: 16,
              borderBottom: '1px solid var(--b1)',
            }}>
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="hidden-desktop btn btn-outline btn-sm"
                style={{ gap: 8 }}
              >
                <SlidersHorizontal size={14} /> Filters {hasFilters ? `(${[search,selCategory,selBrand,priceMin,priceMax,inStockOnly].filter(Boolean).length})` : ''}
              </button>

              {/* Active Filter Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', flex: 1 }}>
                {selCategory && <Chip label={`Category: ${selCategory}`} onRemove={() => handleSelectCategory('')} />}
                {selBrand && <Chip label={`Brand: ${selBrand}`} onRemove={() => handleSelectBrand('')} />}
                {priceMin && <Chip label={`Min: Rs. ${Number(priceMin).toLocaleString()}`} onRemove={() => setPriceMin('')} />}
                {priceMax && <Chip label={`Max: Rs. ${Number(priceMax).toLocaleString()}`} onRemove={() => setPriceMax('')} />}
                {inStockOnly && <Chip label="In Stock Only" onRemove={() => setInStockOnly(false)} />}
              </div>

              {/* View / Sort */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
                <select
                  value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="input"
                  style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <div style={{ display: 'flex', borderRadius: 10, border: '1px solid var(--b1)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '8px 11px', background: viewMode === 'grid' ? 'var(--red-vivid)' : 'var(--bg-3)',
                      color: viewMode === 'grid' ? '#fff' : 'var(--t3)', border: 'none', cursor: 'pointer',
                    }}
                  ><Grid3X3 size={16} /></button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '8px 11px', background: viewMode === 'list' ? 'var(--red-vivid)' : 'var(--bg-3)',
                      color: viewMode === 'list' ? '#fff' : 'var(--t3)', border: 'none', cursor: 'pointer',
                    }}
                  ><List size={16} /></button>
                </div>
              </div>
            </div>

            {/* Product Listing */}
            {loading ? (
              <div style={{ padding: 80, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--t3)', fontSize: 14 }}>Fetching catalog products…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '72px 24px',
                borderRadius: 20, border: '1px dashed var(--b1)', background: 'var(--bg-2)',
                color: 'var(--t3)',
              }}>
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
                      const active = c._id === '' ? (!selCategory || selCategory === 'All Categories') : (selCategory === c.name || selCategory === c._id);
                      return (
                        <button key={c._id} onClick={() => { handleSelectCategory(c._id === '' ? '' : c.name); setFiltersOpen(false); }} style={filterBtnStyle(active)}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </FilterBlock>

                <FilterBlock title="Brand">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[{ _id: '', name: 'All Brands' }, ...brands].map(b => {
                      const active = b._id === '' ? (!selBrand || selBrand === 'All Brands') : (selBrand === b.name || selBrand === b._id);
                      return (
                        <button key={b._id} onClick={() => { handleSelectBrand(b._id === '' ? '' : b.name); setFiltersOpen(false); }} style={filterBtnStyle(active)}>
                          {b.name}
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
