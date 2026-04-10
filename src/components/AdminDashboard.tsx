import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Order, Product } from '../types';
import type { ReactNode } from 'react';
import {
  Package,
  Trash2,
  RefreshCw,
  LogOut,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Undo2,
  Copy,
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import OrderDetail from './OrderDetail';

// Map Supabase snake_case rows to camelCase TypeScript types
function mapOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number ?? row.orderNumber ?? '',
    customerName: row.customer_name ?? row.customerName ?? '',
    customerEmail: row.customer_email ?? row.customerEmail ?? '',
    customerPhone: row.customer_phone ?? row.customerPhone,
    orderTotal: row.order_total ?? row.orderTotal ?? 0,
    subtotal: row.subtotal ?? 0,
    shippingCost: row.shipping_cost ?? row.shippingCost ?? 0,
    status: row.status ?? 'pending',
    paymentMethod: row.payment_method ?? row.paymentMethod,
    paymentStatus: row.payment_status ?? row.paymentStatus,
    trackingNumber: row.tracking_number ?? row.trackingNumber,
    items: row.items ?? [],
    shippingAddress: row.shipping_address ?? row.shippingAddress ?? { name: '', address: '', city: '', region: '', postalCode: '', shippingMethod: '' },
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description ?? '',
    price: row.price ?? 0,
    imageUrl: row.image_url ?? row.imageUrl,
    isActive: row.is_active ?? row.isActive ?? true,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'deleted_orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    awaitingPayment: orders.filter(o => o.status === 'awaiting_payment').length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((acc, o) => acc + (o.orderTotal || 0), 0)
  };

  const seedProducts = async () => {
    const { data: existing } = await supabase.from('products').select('name');
    const existingNames = new Set((existing || []).map((p: any) => p.name?.toLowerCase()));
    const now = new Date().toISOString();

    // All storefront products — names must match "Name Size" format for visibility sync
    const allStorefrontProducts = [
      { name: 'BAC Water 3ml', description: 'Bacteriostatic water for reconstitution of lyophilized peptide compounds.', price: 19.00, image_url: '/product_bac_water_3ml.png', is_active: true, created_at: now, updated_at: now },
      { name: 'BAC Water 10ml', description: 'Bacteriostatic water for reconstitution of lyophilized peptide compounds.', price: 29.00, image_url: '/product_bac_water_10ml.png', is_active: true, created_at: now, updated_at: now },
      { name: 'BPC-157 10mg', description: 'Synthetic pentadecapeptide for tissue repair research.', price: 99.00, image_url: '/product_bpc157_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'TB-500 10mg', description: 'Synthetic peptide fragment of thymosin beta-4 protein.', price: 139.00, image_url: '/product_tb500_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'GHK-CU 50mg', description: 'Copper peptide complex for cellular communication research.', price: 149.00, image_url: '/product_ghkcu_50mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'GHK-CU 100mg', description: 'Copper peptide complex for cellular communication research.', price: 229.00, image_url: '/product_ghkcu_50mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'CJC-1295 w/ DAC 5mg', description: 'Synthetic analog of growth hormone-releasing hormone with DAC.', price: 179.00, image_url: '/product_cjc1295_5mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Ipamorelin 5mg', description: 'Synthetic pentapeptide growth hormone secretagogue.', price: 159.00, image_url: '/product_ipamorelin_5mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'GHRP-6 5mg', description: 'Growth Hormone Releasing Peptide-6.', price: 119.00, image_url: '/product_ghrp6_5mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Sermorelin 10mg', description: 'Synthetic peptide analog of GHRH 1-29.', price: 199.00, image_url: '/product_sermorelin_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Tesamorelin 10mg', description: 'Synthetic analog of growth hormone-releasing factor.', price: 219.00, image_url: '/product_tesamorelin_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'DSIP 15mg', description: 'Delta Sleep-Inducing Peptide for sleep cycle research.', price: 149.00, image_url: '/product_dsip_15mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Epitalon 50mg', description: 'Synthetic tetrapeptide for telomerase activity research.', price: 189.00, image_url: '/product_epitalon_50mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Retatrutide 10mg', description: 'Triple agonist peptide targeting GLP-1, GIP, and glucagon receptors.', price: 249.00, image_url: '/product_retatrutide_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'MOTS-c 40mg', description: 'Mitochondrial-derived peptide for metabolic regulation research.', price: 199.00, image_url: '/product_motsc_40mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Thymosin Alpha-1 10mg', description: 'Synthetic thymic peptide for immune modulation research.', price: 179.00, image_url: '/product_thymosin_a1_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'SS-31 10mg', description: 'Mitochondrial-targeted peptide (Elamipretide).', price: 199.00, image_url: '/product_ss31_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'NAD+ 100mg', description: 'Nicotinamide adenine dinucleotide for cellular energy research.', price: 169.00, image_url: '/product_nad_100mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'NAD+ 500mg', description: 'Nicotinamide adenine dinucleotide for cellular energy research.', price: 399.00, image_url: '/product_nad_500mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Melanotan II 10mg', description: 'Synthetic analog of alpha-melanocyte stimulating hormone.', price: 89.00, image_url: '/product_melanotan2_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'PT-141 10mg', description: 'Synthetic melanocortin receptor agonist (Bremelanotide).', price: 169.00, image_url: '/product_pt141_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'Kisspeptin-10 10mg', description: 'Synthetic fragment of the kisspeptin neuropeptide.', price: 189.00, image_url: '/product_kisspeptin_10mg.png', is_active: true, created_at: now, updated_at: now },
      { name: 'SNAP-8 10mg', description: 'Synthetic octapeptide for SNARE complex research.', price: 159.00, image_url: '/product_snap8_10mg.png', is_active: true, created_at: now, updated_at: now },
    ];

    // Only insert products that don't already exist
    const toInsert = allStorefrontProducts.filter(p => !existingNames.has(p.name.toLowerCase()));
    if (toInsert.length > 0) {
      await supabase.from('products').insert(toInsert);
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setOrders((data || []).map(mapOrder));
      } else if (activeTab === 'deleted_orders') {
        const { data, error } = await supabase.from('deleted_orders').select('*').order('deleted_at', { ascending: false });
        if (error) throw error;
        setOrders((data || []).map(mapOrder));
      } else if (activeTab === 'products') {
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
        if (error) throw error;
        const mapped = (data || []).map(mapProduct);
        setProducts(mapped);
        if (mapped.length === 0) seedProducts();
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`Are you sure you want to delete order #${order.orderNumber}?`)) return;
    try {
      await supabase.from('deleted_orders').insert({
        original_order_id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        total: order.orderTotal,
        status: order.status,
        deleted_at: new Date().toISOString(),
        deleted_by: 'admin'
      });
      await supabase.from('orders').delete().eq('id', order.id);
      fetchData();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-text-1 flex font-sans relative">
      {/* Corner brackets — desktop only */}
      <div className="xp-corner xp-corner-tl hidden lg:block" />
      <div className="xp-corner xp-corner-tr hidden lg:block" />
      <div className="xp-corner xp-corner-bl hidden lg:block" />
      <div className="xp-corner xp-corner-br hidden lg:block" />

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile/tablet, sticky on desktop */}
      <aside
        className={`fixed lg:sticky inset-y-0 left-0 lg:top-0 w-64 bg-bg-card border-r border-border flex flex-col h-screen z-50 transform transition-transform duration-200 ease-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ borderTop: '2px solid var(--color-xp-red)' }}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="xp-wordmark">
            <div>
              <div className="xp-wordmark-text">Xtreme Peptides</div>
              <div className="xp-wordmark-sub">Admin Panel</div>
            </div>
          </div>
          <button
            className="lg:hidden p-1 text-text-2 hover:text-xp-red"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          className="flex-1 p-4 space-y-1 overflow-y-auto"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="pb-2 px-4 xp-section-label text-[11px]">— Orders —</div>
          <NavButton active={activeTab === 'orders' && statusFilter === 'all'} onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }} icon={<Package className="w-4 h-4" />} label="All Orders" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'pending'} onClick={() => { setActiveTab('orders'); setStatusFilter('pending'); }} icon={<Clock className="w-4 h-4" />} label="Pending" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'awaiting_payment'} onClick={() => { setActiveTab('orders'); setStatusFilter('awaiting_payment'); }} icon={<DollarSign className="w-4 h-4" />} label="Awaiting Payment" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'paid'} onClick={() => { setActiveTab('orders'); setStatusFilter('paid'); }} icon={<CheckCircle2 className="w-4 h-4" />} label="Paid" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'shipped'} onClick={() => { setActiveTab('orders'); setStatusFilter('shipped'); }} icon={<Truck className="w-4 h-4" />} label="Shipped" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'delivered'} onClick={() => { setActiveTab('orders'); setStatusFilter('delivered'); }} icon={<CheckCircle2 className="w-4 h-4" />} label="Delivered" />
          <div className="my-2 mx-4 border-t border-border" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'cancelled'} onClick={() => { setActiveTab('orders'); setStatusFilter('cancelled'); }} icon={<XCircle className="w-4 h-4" />} label="Cancelled" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'refunded'} onClick={() => { setActiveTab('orders'); setStatusFilter('refunded'); }} icon={<Undo2 className="w-4 h-4" />} label="Refunded" />

          <div className="pt-4 pb-2 px-4 xp-section-label text-[11px]">— Inventory —</div>
          <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package className="w-4 h-4" />} label="Products" />

          <div className="pt-4 pb-2 px-4 xp-section-label text-[11px]">— Archive —</div>
          <NavButton active={activeTab === 'deleted_orders'} onClick={() => setActiveTab('deleted_orders')} icon={<Trash2 className="w-4 h-4" />} label="Deleted Orders" />
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-text-3 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-16 bg-bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 lg:px-8 flex items-center gap-3 lg:gap-4">
          <button
            className="lg:hidden p-2 -ml-2 text-text-2 hover:text-[var(--color-xp-red)] transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 flex-1 min-w-0 max-w-xl">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <input
                type="text"
                placeholder="SEARCH ORDERS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-input border border-border pl-10 pr-3 py-2.5 text-sm text-text-1 focus:outline-none focus:border-cyan transition-all font-mono tracking-[0.1em] placeholder:text-text-3"
              />
            </div>
          </div>

          <button
            onClick={fetchData}
            className="p-2 bg-bg-input border border-border rounded-none text-text-2 hover:text-cyan hover:border-cyan transition-all flex-shrink-0"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <div className="p-4 md:p-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
            <StatCard label="Total Orders" value={stats.total} icon={<Package className="w-4 h-4" />} />
            <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="text-yellow-400" />
            <StatCard label="Awaiting Pmt" value={stats.awaitingPayment} icon={<DollarSign className="w-4 h-4" />} color="text-orange-400" />
            <StatCard label="Paid" value={stats.paid} icon={<CheckCircle2 className="w-4 h-4" />} color="text-cyan" />
            <StatCard label="Shipped" value={stats.shipped} icon={<Truck className="w-4 h-4" />} color="text-blue-400" />
            <StatCard label="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-4 h-4" />} color="text-green-400" />
            <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon={<DollarSign className="w-4 h-4" />} color="text-cyan" />
          </div>

          <div className="mb-6 md:mb-8 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div className="min-w-0">
                <div className="xp-section-label mb-2">— Dashboard —</div>
                <h2 className="xp-display text-2xl sm:text-3xl md:text-4xl break-words">
                  {activeTab === 'orders'
                    ? (statusFilter === 'all' ? <>All <span style={{ color: 'var(--color-xp-red)' }}>Orders</span></> : <>{statusFilter.replace('_', ' ')} <span style={{ color: 'var(--color-xp-red)' }}>Orders</span></>)
                    : <span>{activeTab.replace('_', ' ')}</span>}
                </h2>
                <p className="text-text-2 text-base mt-3 font-sans">Manage and monitor your peptide business operations.</p>
              </div>
              <div className="font-mono text-xs font-bold tracking-[0.15em] uppercase text-cyan border border-cyan/30 px-3 py-2 self-start md:self-auto whitespace-nowrap">
                {filteredOrders.length} {activeTab} found
              </div>
            </div>
          </div>

          {activeTab === 'products' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div />
                <div className="text-xs font-mono text-cyan bg-cyan/5 border border-cyan/20 px-3 py-1 rounded-full">
                  {filteredProducts.length} Products found
                </div>
              </div>

              <div className="bg-bg-card border border-border rounded-none overflow-hidden shadow-xl shadow-black/20">
                {/* Desktop / tablet table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-deep/50 text-text-3 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Visibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <LoadingRow />
                      ) : filteredProducts.length === 0 ? (
                        <EmptyRow />
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-cyan/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-none object-cover border border-border" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-10 h-10 rounded-none bg-bg-input border border-border flex items-center justify-center text-text-3">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-bold text-text-1">{product.name}</div>
                                  <div className="text-[10px] text-text-3 line-clamp-1 max-w-[200px]">{product.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-text-1">${product.price.toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={async () => {
                                  try {
                                    await supabase.from('products').update({
                                      is_active: !product.isActive,
                                      updated_at: new Date().toISOString()
                                    }).eq('id', product.id);
                                    fetchData();
                                  } catch (err) {
                                    console.error('Error toggling visibility:', err);
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  product.isActive ? 'bg-green-400/10 text-green-400 hover:bg-green-400/20' : 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
                                }`}
                              >
                                {product.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {product.isActive ? 'Visible' : 'Hidden'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="lg:hidden divide-y divide-border">
                  {loading ? (
                    <div className="px-6 py-16 text-center">
                      <RefreshCw className="w-8 h-8 text-cyan animate-spin mx-auto mb-4" />
                      <p className="text-text-3 text-sm animate-pulse">Synchronizing with database...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <AlertCircle className="w-8 h-8 text-text-3 mx-auto mb-4" />
                      <p className="text-text-3 text-sm">No products found.</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="p-4 flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-none object-cover border border-border flex-shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-12 h-12 rounded-none bg-bg-input border border-border flex items-center justify-center text-text-3 flex-shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-text-1 truncate">{product.name}</div>
                          <div className="text-[10px] text-text-3 line-clamp-1">{product.description}</div>
                          <div className="text-sm font-bold text-text-1 mt-1">${product.price.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await supabase.from('products').update({
                                is_active: !product.isActive,
                                updated_at: new Date().toISOString()
                              }).eq('id', product.id);
                              fetchData();
                            } catch (err) {
                              console.error('Error toggling visibility:', err);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                            product.isActive ? 'bg-green-400/10 text-green-400 border border-green-400/30' : 'bg-red-400/10 text-red-400 border border-red-400/30'
                          }`}
                        >
                          {product.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {product.isActive ? 'On' : 'Off'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg-card border border-border rounded-none overflow-hidden shadow-xl shadow-black/20">
              {/* Desktop / tablet table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-deep/50 text-text-2 text-xs uppercase font-bold tracking-[0.1em] border-b border-border">
                      <th className="px-6 py-4">Order #</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <LoadingRow />
                    ) : filteredOrders.length === 0 ? (
                      <EmptyRow />
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-cyan/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-cyan font-bold text-base">#{order.orderNumber}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.orderNumber); }}
                                className="p-1 text-text-3 hover:text-cyan transition-colors"
                                title="Copy Order Number"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-text-1">{new Date(order.createdAt).toLocaleDateString('en-NZ')}</div>
                            <div className="text-xs text-text-2 uppercase mt-0.5">{new Date(order.createdAt).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-text-1">{order.customerName}</div>
                            <div className="text-sm text-text-2">{order.customerEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-base font-bold text-text-1">${(order.orderTotal || 0).toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 bg-bg-input border border-border rounded-none text-text-2 hover:text-cyan hover:border-cyan transition-all"
                                title="View Details"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order)}
                                className="p-2 bg-bg-input border border-border rounded-none text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="lg:hidden divide-y divide-border">
                {loading ? (
                  <div className="px-6 py-16 text-center">
                    <RefreshCw className="w-8 h-8 text-cyan animate-spin mx-auto mb-4" />
                    <p className="text-text-3 text-sm animate-pulse">Synchronizing with database...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <AlertCircle className="w-8 h-8 text-text-3 mx-auto mb-4" />
                    <p className="text-text-3 text-sm">No records found matching your criteria.</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 hover:bg-cyan/5 active:bg-cyan/10 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan font-bold text-base">#{order.orderNumber}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.orderNumber); }}
                              className="p-1 text-text-3 hover:text-cyan transition-colors"
                              aria-label="Copy order number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-xs text-text-2 uppercase mt-1 font-mono tracking-wider">
                            {new Date(order.createdAt).toLocaleDateString('en-NZ')} · {new Date(order.createdAt).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="mb-4 min-w-0">
                        <div className="text-base font-bold text-text-1 truncate">{order.customerName}</div>
                        <div className="text-sm text-text-2 truncate">{order.customerEmail}</div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xl font-bold text-text-1">${(order.orderTotal || 0).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                            className="p-2.5 bg-bg-input border border-border rounded-none text-text-1 hover:text-cyan hover:border-cyan transition-all"
                            aria-label="View details"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order); }}
                            className="p-2.5 bg-bg-input border border-border rounded-none text-text-1 hover:text-red-500 hover:border-red-400/30 transition-all"
                            aria-label="Delete order"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdate={fetchData}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

const LoadingRow = () => (
  <tr>
    <td colSpan={6} className="px-6 py-20 text-center">
      <RefreshCw className="w-8 h-8 text-cyan animate-spin mx-auto mb-4" />
      <p className="text-text-2 text-base animate-pulse">Synchronizing with database...</p>
    </td>
  </tr>
);

const EmptyRow = () => (
  <tr>
    <td colSpan={6} className="px-6 py-20 text-center">
      <AlertCircle className="w-8 h-8 text-text-2 mx-auto mb-4" />
      <p className="text-text-2 text-base">No records found matching your criteria.</p>
    </td>
  </tr>
);

const StatCard = ({ label, value, icon, color = "text-text-1" }: { label: string; value: string | number; icon: ReactNode; color?: string }) => (
  <div className="xp-card p-4 sm:p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 ${color}`} style={{ border: '1px solid var(--color-xp-border-red)' }}>{icon}</div>
      <span className="font-mono text-xs tracking-[0.15em] text-text-2 uppercase font-bold">{label}</span>
    </div>
    <div className={`xp-display text-3xl sm:text-4xl ${color}`}>{value}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { color: string, icon: ReactNode, label: string }> = {
    pending:           { color: '#b45309', icon: <Clock className="w-3 h-3" />,        label: 'Pending' },
    awaiting_payment:  { color: '#c2410c', icon: <DollarSign className="w-3 h-3" />,   label: 'Awaiting Payment' },
    paid:              { color: '#cc0000', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Paid' },
    shipped:           { color: '#1d4ed8', icon: <Truck className="w-3 h-3" />,        label: 'Shipped' },
    delivered:         { color: '#15803d', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Delivered' },
    cancelled:         { color: '#9ca3af', icon: <XCircle className="w-3 h-3" />,      label: 'Cancelled' },
    refunded:          { color: '#7c3aed', icon: <Undo2 className="w-3 h-3" />,        label: 'Refunded' },
  };
  const style = styles[status] || styles.pending;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] whitespace-nowrap"
      style={{ border: `1px solid ${style.color}`, color: style.color }}
    >
      {style.icon}
      {style.label}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all group font-heading font-semibold uppercase tracking-[0.06em] text-[15px] ${
      active
        ? 'bg-[var(--color-xp-red-dim)] text-[var(--color-xp-red)]'
        : 'text-text-1 hover:text-text-1 hover:bg-bg-input'
    }`}
    style={active ? { borderLeft: '2px solid var(--color-xp-red)' } : { borderLeft: '2px solid transparent' }}
  >
    <div className={`${active ? 'text-[var(--color-xp-red)]' : 'text-text-2 group-hover:text-[var(--color-xp-red)]'} transition-colors`}>{icon}</div>
    <span>{label}</span>
  </button>
);

export default AdminDashboard;
