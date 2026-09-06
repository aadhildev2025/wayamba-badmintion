import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, RefreshCw, UploadCloud, ImageIcon } from 'lucide-react';
import api from '@/lib/api';


interface Brand {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Specification {
  key: string;
  value: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  images: string[];
  brand: string | { _id: string; name: string };
  category: string | { _id: string; name: string };
  status: 'active' | 'draft';
  tags: string[];
  isFeatured: boolean;
  specifications: Specification[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [imageInput, setImageInput] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [specList, setSpecList] = useState<Specification[]>([]);

  // Spec form state
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // Fast client-side image compressor before uploading to server/Cloudinary
  const compressImageFile = async (file: File, maxDimension = 1400, quality = 0.85): Promise<File> => {
    if (!file.type.startsWith('image/') || file.size < 200 * 1024) {
      return file; // If already tiny or non-image, skip compression
    }
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i]);
        formData.append('images', compressed);
      }

      const res = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrls: string[] = res.data.urls || res.data.imageUrls || [];
      if (Array.isArray(uploadedUrls) && uploadedUrls.length > 0) {
        const currentList = imageInput ? imageInput.split(',').map(s => s.trim()).filter(Boolean) : [];
        const combined = Array.from(new Set([...currentList, ...uploadedUrls]));
        setImageInput(combined.join(', '));
      } else {
        alert('No image URLs returned from server.');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const currentList = imageInput ? imageInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const filtered = currentList.filter(url => url !== urlToRemove);
    setImageInput(filtered.join(', '));
  };


  const fetchLists = () => {
    setLoading(true);
    const getProds = api.get('/products?adminView=true');
    const getCats = api.get('/products/categories');
    const getBrands = api.get('/products/brands');

    Promise.all([getProds, getCats, getBrands])
      .then(([pRes, cRes, bRes]) => {
        setProducts(pRes.data || []);
        setCategories(cRes.data || []);
        setBrands(bRes.data || []);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch catalog entries.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const openForm = (prod: Product | null = null) => {
    setSelectedProduct(prod);
    setModalOpen(true);
    
    if (prod) {
      setName(prod.name);
      setSku(prod.sku);
      setDescription(prod.description);
      setPrice(prod.price);
      setSalePrice(prod.salePrice ? String(prod.salePrice) : '');
      setStockQuantity(prod.stockQuantity);
      setImageInput(prod.images.join(', '));
      setBrandId(typeof prod.brand === 'object' ? prod.brand._id : prod.brand);
      setCategoryId(typeof prod.category === 'object' ? prod.category._id : prod.category);
      setStatus(prod.status);
      setTagsInput(prod.tags.join(', '));
      setIsFeatured(prod.isFeatured);
      setSpecList(prod.specifications || []);
    } else {
      setName('');
      setSku('');
      setDescription('');
      setPrice(0);
      setSalePrice('');
      setStockQuantity(0);
      setImageInput('');
      setBrandId(brands[0]?._id || '');
      setCategoryId(categories[0]?._id || '');
      setStatus('active');
      setTagsInput('');
      setIsFeatured(false);
      setSpecList([]);
    }
  };

  const handleAddSpec = () => {
    if (specKey.trim() && specVal.trim()) {
      setSpecList([...specList, { key: specKey.trim(), value: specVal.trim() }]);
      setSpecKey('');
      setSpecVal('');
    }
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = Number(price);
    const salePriceVal = salePrice ? Number(salePrice) : undefined;
    const finalPrice = priceVal > 0 ? priceVal : (salePriceVal && salePriceVal > 0 ? salePriceVal : 0);

    if (!name || !sku || !brandId || !categoryId || finalPrice <= 0) {
      alert('Name, SKU, Brand, Category, and a valid Regular Price (> 0) are required.');
      return;
    }
    
    setModalLoading(true);

    const payload = {
      name,
      sku,
      description,
      price: finalPrice,
      salePrice: salePriceVal,
      stockQuantity: Number(stockQuantity),
      images: imageInput.split(',').map(s => s.trim()).filter(Boolean),
      brand: brandId,
      category: categoryId,
      status,
      tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      isFeatured,
      specifications: specList,
    };

    try {
      if (selectedProduct) {
        // Edit product
        const { data } = await api.put(`/products/${selectedProduct._id}`, payload);
        setProducts(prev => prev.map(p => p._id === selectedProduct._id ? data : p));
      } else {
        // Create product
        const { data } = await api.post('/products', payload);
        setProducts(prev => [data, ...prev]);
      }
      setModalOpen(false);
      fetchLists();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => {
    const brandName = typeof p.brand === 'object' ? p.brand.name : '';
    const categoryName = typeof p.category === 'object' ? p.category.name : '';
    
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>Manage Products</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Configure pricing, toggle features, check inventory metrics, and add new sports equipment.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={fetchLists}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
              fontFamily: 'Outfit', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Catalog
          </button>
          <button
            onClick={() => openForm(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 800,
              fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
              border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(176,28,40,0.45)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(176,28,40,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(176,28,40,0.45)'; }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Command Bar Toolbar */}
      <div style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '14px 18px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#161622',
          border: '1.5px solid rgba(255,255,255,0.14)',
          borderRadius: 14,
          padding: '6px 14px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(176,28,40,0.18)', border: '1px solid rgba(176,28,40,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Search size={15} style={{ color: 'var(--red-vivid)' }} />
          </div>
          <input
            type="text"
            placeholder="Search catalog by product name, SKU, brand, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: 14,
              fontFamily: 'Outfit',
              padding: '6px 0',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                width: 22, height: 22, cursor: 'pointer', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(176,28,40,0.2)', borderTopColor: 'var(--red-vivid)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ color: '#ef4444', fontSize: 14.5, fontWeight: 600 }}>{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏸</div>
          <h4 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: 18, marginBottom: 6 }}>No products found</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>Try adjusting your search query.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Image</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Product Details</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>SKU / Brand</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Price (LKR)</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Stock</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const brandName = typeof p.brand === 'object' ? p.brand.name : '';
                const categoryName = typeof p.category === 'object' ? p.category.name : '';
                const displayPrice = p.salePrice || p.price;
                const isLowStock = p.stockQuantity <= 5;
                const isDraft = p.status === 'draft';
                const mainImage = p.images[0] || '/imgs/hero_rackets.png';
                
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '14px 20px' }}>
                      <img src={mainImage} alt={p.name} style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)', background: '#060609' }} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF', fontFamily: 'Outfit' }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter' }}>{categoryName}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--red-vivid)', fontWeight: 800 }}>{brandName}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#FFFFFF', fontFamily: 'Outfit' }}>Rs. {displayPrice.toLocaleString()}</div>
                      {p.salePrice && <div style={{ fontSize: 11, textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>Rs. {p.price.toLocaleString()}</div>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: isLowStock ? '#F59E0B' : '#FFFFFF', fontFamily: 'Outfit' }}>{p.stockQuantity}</span>
                        {isLowStock && <AlertTriangle size={13} style={{ color: '#F59E0B' }} />}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 800,
                        background: isDraft ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.18)',
                        color: isDraft ? 'rgba(255,255,255,0.6)' : '#22C55E',
                        border: isDraft ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(34,197,94,0.3)',
                      }}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        <button onClick={() => openForm(p)} style={{ padding: 8, borderRadius: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', cursor: 'pointer' }} title="Edit Product">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(p._id)} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', cursor: 'pointer' }} title="Delete Product">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} onClick={() => setModalOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                position: 'relative', width: '100%', maxWidth: 840,
                maxHeight: '90vh', overflowY: 'auto',
                background: '#111118', border: '1.5px solid rgba(255,255,255,0.14)',
                borderRadius: 24, padding: '32px 28px',
                boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                    {selectedProduct ? 'Edit Product Catalog Item' : 'Add New Equipment Entry'}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>Configure pricing, stock, technical specifications, and product media.</p>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Section 1: Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Yonex Astrox 100ZZ Kurenai"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>SKU Code</label>
                    <input
                      type="text"
                      placeholder="e.g. YNX-AX100ZZ"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'monospace', outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on structure, material, balance, speed metrics..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', background: '#161622',
                      border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                      color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Section 2: Pricing & Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Regular Price (LKR)</label>
                    <input
                      type="number"
                      placeholder="48500"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', fontWeight: 700, outline: 'none'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Sale Price (Optional)</label>
                    <input
                      type="number"
                      placeholder="45000"
                      value={salePrice}
                      onChange={e => setSalePrice(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', fontWeight: 700, outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', fontWeight: 700, outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Section 3: Brand, Category, Status, Featured */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Brand</label>
                    <select
                      value={brandId}
                      onChange={e => setBrandId(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', fontWeight: 600, outline: 'none'
                      }}
                    >
                      {brands.map(b => <option key={b._id} value={b._id} style={{ background: '#161622', color: '#fff' }}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Category</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', fontWeight: 600, outline: 'none'
                      }}
                    >
                      {categories.map(c => <option key={c._id} value={c._id} style={{ background: '#161622', color: '#fff' }}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', fontWeight: 600, outline: 'none'
                      }}
                    >
                      <option value="active" style={{ background: '#161622', color: '#fff' }}>Active (Visible in Store)</option>
                      <option value="draft" style={{ background: '#161622', color: '#fff' }}>Draft (Hidden)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={isFeatured}
                      onChange={e => setIsFeatured(e.target.checked)}
                      style={{ width: 20, height: 20, accentColor: 'var(--red-vivid)', cursor: 'pointer' }}
                    />
                    <label htmlFor="isFeatured" style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit', cursor: 'pointer' }}>
                      Featured Product Badge
                    </label>
                  </div>
                </div>

                {/* Section 4: Product Image Upload & Media Gallery */}
                <div style={{ background: '#161622', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ImageIcon size={16} style={{ color: 'var(--red-vivid)' }} /> Product Media & Image Gallery
                      </label>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter' }}>Upload photos from computer or select equipment presets.</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(176,28,40,0.18)', color: 'var(--red-vivid)', padding: '4px 12px', borderRadius: 99, border: '1px solid rgba(176,28,40,0.3)', fontFamily: 'Outfit' }}>
                      {imageInput ? imageInput.split(',').map(s => s.trim()).filter(Boolean).length : 0} Images Attached
                    </span>
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '24px 16px', border: '2px dashed rgba(176,28,40,0.4)', borderRadius: 14,
                    background: 'rgba(176,28,40,0.04)', cursor: 'pointer', transition: 'all 0.2s ease',
                    marginBottom: 16, textAlign: 'center',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(176,28,40,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(176,28,40,0.04)')}
                  >
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} hidden />
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(176,28,40,0.18)', border: '1px solid rgba(176,28,40,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      {uploadingImage ? <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--red-vivid)' }} /> : <UploadCloud size={22} style={{ color: 'var(--red-vivid)' }} />}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                      {uploadingImage ? 'Uploading image files to server...' : 'Click to Upload Images or Drag & Drop Files'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                      Supports PNG, JPG, WEBP formats (Max 5MB each)
                    </div>
                  </label>

                  {/* Active Images Thumbnails Gallery Grid */}
                  {imageInput && imageInput.split(',').map(s => s.trim()).filter(Boolean).length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontFamily: 'Outfit' }}>
                        Attached Product Photos
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                        {imageInput.split(',').map(s => s.trim()).filter(Boolean).map((imgUrl, idx) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#08080C' }}>
                            <img src={imgUrl} alt="Product Media" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                            {idx === 0 && (
                              <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 900, background: '#10B981', color: '#fff', padding: '2px 6px', borderRadius: 4, fontFamily: 'Outfit' }}>
                                MAIN
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imgUrl)}
                              style={{
                                position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                                background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                              title="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Section 5: Tags */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Search Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="racket, offensive, stiff, yonex, mavis"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', background: '#161622',
                      border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                      color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                    }}
                  />
                </div>

                {/* Section 6: Technical Specifications */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 15, fontWeight: 900, color: 'var(--red-vivid)', marginBottom: 12 }}>Technical Specifications Sheet</h4>
                  
                  {/* Spec editor form */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                    <input
                      type="text"
                      placeholder="Specification name (e.g. Frame Weight)"
                      value={specKey}
                      onChange={e => setSpecKey(e.target.value)}
                      style={{
                        flex: 1, minWidth: 160, padding: '10px 14px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 12,
                        color: '#FFFFFF', fontSize: 13, fontFamily: 'Outfit', outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 4U / Avg. 83g)"
                      value={specVal}
                      onChange={e => setSpecVal(e.target.value)}
                      style={{
                        flex: 1, minWidth: 160, padding: '10px 14px', background: '#161622',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 12,
                        color: '#FFFFFF', fontSize: 13, fontFamily: 'Outfit', outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      style={{
                        padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                        fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28, #8A121D)',
                        border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', cursor: 'pointer'
                      }}
                    >
                      Add Metric
                    </button>
                  </div>

                  {/* Spec items list chips */}
                  {specList.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: '#161622', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                      {specList.map((spec, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(176,28,40,0.18)', border: '1px solid rgba(176,28,40,0.35)', borderRadius: 20, fontSize: 12.5, fontFamily: 'Outfit' }}>
                          <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{spec.key}:</span>
                          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{spec.value}</span>
                          <button type="button" onClick={() => handleRemoveSpec(idx)} style={{ background: 'none', border: 'none', color: '#F87171', padding: 0, cursor: 'pointer', display: 'flex' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700,
                      fontFamily: 'Outfit', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    style={{
                      padding: '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 900,
                      fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                      border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(176,28,40,0.45)'
                    }}
                  >
                    {modalLoading ? 'Saving...' : 'Save Product Entry'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
