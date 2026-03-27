import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Order, EmailLog, Product } from '../types';
import {
  LayoutDashboard,
  Package,
  Mail,
  Trash2,
  RefreshCw,
  LogOut,
  Search,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Undo2,
  Copy,
  X,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

function mapEmailLog(row: any): EmailLog {
  return {
    id: row.id,
    sentAt: row.sent_at ?? row.sentAt,
    recipientEmail: row.recipient_email ?? row.recipientEmail ?? '',
    orderNumber: row.order_number ?? row.orderNumber ?? '',
    orderId: row.order_id ?? row.orderId,
    type: row.type ?? '',
    subject: row.subject ?? '',
    body: row.body,
    status: row.status ?? '',
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

function mapMessage(row: any) {
  return {
    id: row.id,
    customerName: row.customer_name ?? row.customerName,
    customerEmail: row.customer_email ?? row.customerEmail ?? '',
    subject: row.subject ?? '',
    message: row.message ?? '',
    status: row.status ?? 'unread',
    source: row.source ?? 'contact_form',
    createdAt: row.created_at ?? row.createdAt,
    repliedAt: row.replied_at ?? row.repliedAt,
    replyBody: row.reply_body ?? row.replyBody,
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'emails' | 'deleted_orders' | 'deleted_emails' | 'products' | 'messages'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delayed: orders.filter(o => o.status === 'delayed').length,
    paid: orders.filter(o => o.status === 'paid').length,
    revenue: orders.reduce((acc, o) => acc + (o.orderTotal || 0), 0)
  };

  const seedProducts = async () => {
    const { data: existing } = await supabase.from('products').select('id').limit(1);
    if (existing && existing.length === 0) {
      const now = new Date().toISOString();
      const initialProducts = [
        { name: 'BPC-157 5mg', description: 'Body Protection Compound-157 is a pentadecapeptide composed of 15 amino acids.', price: 85.00, image_url: null, is_active: true, created_at: now, updated_at: now },
        { name: 'TB-500 10mg', description: 'Thymosin Beta-4 is a naturally occurring peptide present in almost all animal and human cells.', price: 75.00, image_url: null, is_active: true, created_at: now, updated_at: now },
        { name: 'Ipamorelin 5mg', description: 'Ipamorelin is a selective GH secretagogue and ghrelin receptor agonist.', price: 65.00, image_url: null, is_active: true, created_at: now, updated_at: now },
        { name: 'CJC-1295 5mg', description: 'Modified GRF 1-29 is a tetrasubstituted peptide analog of growth hormone-releasing hormone.', price: 70.00, image_url: null, is_active: true, created_at: now, updated_at: now },
        { name: 'Melanotan II 10mg', description: 'MT-2 is a synthetic analog of the peptide hormone alpha-melanocyte-stimulating hormone.', price: 95.00, image_url: null, is_active: true, created_at: now, updated_at: now }
      ];
      await supabase.from('products').insert(initialProducts);
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
      } else if (activeTab === 'emails') {
        const { data, error } = await supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(200);
        if (error) throw error;
        setEmails((data || []).map(mapEmailLog));
      } else if (activeTab === 'deleted_orders') {
        const { data, error } = await supabase.from('deleted_orders').select('*').order('deleted_at', { ascending: false });
        if (error) throw error;
        setOrders((data || []).map(mapOrder));
      } else if (activeTab === 'deleted_emails') {
        const { data, error } = await supabase.from('deleted_emails').select('*').order('deleted_at', { ascending: false });
        if (error) throw error;
        setEmails((data || []).map(mapEmailLog));
      } else if (activeTab === 'products') {
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
        if (error) throw error;
        const mapped = (data || []).map(mapProduct);
        setProducts(mapped);
        if (mapped.length === 0) seedProducts();
      } else if (activeTab === 'messages') {
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setMessages((data || []).map(mapMessage));
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

  const filteredEmails = emails.filter(email => {
    const isInboxEmail = ['admin_reply', 'contact_confirmation', 'general'].includes(email.type);
    if (!isInboxEmail) return false;
    return (
      email.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (email.orderNumber && email.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter(msg => {
    const search = searchTerm.toLowerCase();
    return (
      (msg.customerName || '').toLowerCase().includes(search) ||
      (msg.customerEmail || '').toLowerCase().includes(search) ||
      (msg.subject || '').toLowerCase().includes(search) ||
      (msg.message || '').toLowerCase().includes(search)
    );
  });

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await supabase.from('products').delete().eq('id', productId);
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

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

  const groupedEmails = filteredEmails.reduce((acc, email) => {
    const key = email.orderNumber || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(email);
    return acc;
  }, {} as Record<string, EmailLog[]>);

  const sortedOrderNumbers = Object.keys(groupedEmails).sort((a, b) => {
    if (a === 'General') return 1;
    if (b === 'General') return -1;
    const latestA = Math.max(...groupedEmails[a].map(e => new Date(e.sentAt).getTime()));
    const latestB = Math.max(...groupedEmails[b].map(e => new Date(e.sentAt).getTime()));
    return latestB - latestA;
  });

  return (
    <div className="min-h-screen bg-bg-deep text-text-1 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-card border-r border-border flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan rounded-lg flex items-center justify-center shadow-lg shadow-cyan/20">
            <LayoutDashboard className="text-bg-deep w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">XTREME PEPTIDES</h1>
            <p className="text-[10px] text-text-3 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="pb-2 px-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Orders</div>
          <NavButton active={activeTab === 'orders' && statusFilter === 'all'} onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }} icon={<Package className="w-4 h-4" />} label="All Orders" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'pending'} onClick={() => { setActiveTab('orders'); setStatusFilter('pending'); }} icon={<Clock className="w-4 h-4" />} label="Pending" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'paid'} onClick={() => { setActiveTab('orders'); setStatusFilter('paid'); }} icon={<CheckCircle2 className="w-4 h-4" />} label="Paid" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'shipped'} onClick={() => { setActiveTab('orders'); setStatusFilter('shipped'); }} icon={<Truck className="w-4 h-4" />} label="Shipped" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'delivered'} onClick={() => { setActiveTab('orders'); setStatusFilter('delivered'); }} icon={<CheckCircle2 className="w-4 h-4" />} label="Delivered" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'cancelled'} onClick={() => { setActiveTab('orders'); setStatusFilter('cancelled'); }} icon={<XCircle className="w-4 h-4" />} label="Cancelled" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'delayed'} onClick={() => { setActiveTab('orders'); setStatusFilter('delayed'); }} icon={<AlertTriangle className="w-4 h-4" />} label="Delayed" />
          <NavButton active={activeTab === 'orders' && statusFilter === 'refunded'} onClick={() => { setActiveTab('orders'); setStatusFilter('refunded'); }} icon={<Undo2 className="w-4 h-4" />} label="Refunded" />

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Communication</div>
          <NavButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<Mail className="w-4 h-4" />} label="Inbox" />
          <NavButton active={activeTab === 'emails'} onClick={() => setActiveTab('emails')} icon={<Mail className="w-4 h-4" />} label="Email Logs" />

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Inventory</div>
          <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package className="w-4 h-4" />} label="Products" />

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-text-3 uppercase tracking-widest">Archive</div>
          <NavButton active={activeTab === 'deleted_orders'} onClick={() => setActiveTab('deleted_orders')} icon={<Trash2 className="w-4 h-4" />} label="Deleted Orders" />
          <NavButton active={activeTab === 'deleted_emails'} onClick={() => setActiveTab('deleted_emails')} icon={<Trash2 className="w-4 h-4" />} label="Deleted Emails" />
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-3 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <input
                type="text"
                placeholder={activeTab.includes('email') ? "Search emails, orders..." : "Search orders, customers, emails..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-input border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              className="p-2 bg-bg-input border border-border rounded-xl text-text-2 hover:text-cyan hover:border-cyan transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-8">
            <StatCard label="Total Orders" value={stats.total} icon={<Package className="w-4 h-4" />} />
            <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="text-yellow-400" />
            <StatCard label="Paid" value={stats.paid} icon={<CheckCircle2 className="w-4 h-4" />} color="text-emerald-400" />
            <StatCard label="Shipped" value={stats.shipped} icon={<Truck className="w-4 h-4" />} color="text-blue-400" />
            <StatCard label="Delayed" value={stats.delayed} icon={<AlertTriangle className="w-4 h-4" />} color="text-orange-400" />
            <StatCard label="Unread Msgs" value={messages.filter(m => m.status === 'unread').length} icon={<Mail className="w-4 h-4" />} color="text-cyan" />
            <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon={<DollarSign className="w-4 h-4" />} color="text-cyan" />
          </div>

          <div className="mb-8 flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-text-1 capitalize">
                  {activeTab === 'orders' ? (statusFilter === 'all' ? 'All Orders' : `${statusFilter} Orders`) : activeTab.replace('_', ' ')}
                </h2>
                <p className="text-text-3 text-sm">Manage and monitor your peptide business operations.</p>
              </div>
              <div className="text-xs font-mono text-cyan bg-cyan/5 border border-cyan/20 px-3 py-1 rounded-full">
                {activeTab.includes('email') ? filteredEmails.length : filteredOrders.length} {activeTab} found
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

              <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-deep/50 text-text-3 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Visibility</th>
                        <th className="px-6 py-4 text-right">Actions</th>
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
                                  <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-border" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-bg-input border border-border flex items-center justify-center text-text-3">
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
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all"
                                  title="Delete Product"
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
              </div>
            </div>
          ) : activeTab === 'messages' ? (
            <div className="space-y-6">
              <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-deep/50 text-text-3 text-[10px] uppercase font-bold tracking-widest border-b border-border">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <LoadingRow />
                      ) : filteredMessages.length === 0 ? (
                        <EmptyRow />
                      ) : (
                        filteredMessages.map((msg) => (
                          <tr key={msg.id} className="hover:bg-cyan/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-1">{new Date(msg.createdAt).toLocaleDateString('en-NZ')}</div>
                              <div className="text-[10px] text-text-3 uppercase">{new Date(msg.createdAt).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-text-1">{msg.customerName || 'N/A'}</div>
                              <div className="text-xs text-text-3">{msg.customerEmail}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-1 font-medium">{msg.subject}</div>
                              <div className="text-xs text-text-3 line-clamp-1">{msg.message}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.source === 'email' ? 'text-blue-400' : 'text-purple-400'}`}>
                                {msg.source.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                msg.status === 'unread' ? 'bg-yellow-400/10 text-yellow-400' :
                                msg.status === 'replied' ? 'bg-green-400/10 text-green-400' : 'bg-bg-input text-text-3'
                              }`}>
                                {msg.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedMessage(msg)}
                                  className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-cyan hover:border-cyan transition-all"
                                  title="View & Reply"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm('Are you sure you want to delete this message?')) return;
                                    await supabase.from('messages').delete().eq('id', msg.id);
                                    fetchData();
                                  }}
                                  className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all"
                                  title="Delete"
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
              </div>
            </div>
          ) : (
            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {activeTab.includes('email') ? (
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <LoadingRow />
                      ) : filteredEmails.length === 0 ? (
                        <EmptyRow />
                      ) : (
                        sortedOrderNumbers.map((orderNum) => (
                          <React.Fragment key={orderNum}>
                            <tr className="bg-bg-deep/30">
                              <td colSpan={5} className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-cyan" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-3">Order</span>
                                  <span className="text-xs font-mono font-bold text-cyan">#{orderNum}</span>
                                  <span className="text-[10px] text-text-3 ml-2">({groupedEmails[orderNum].length} emails)</span>
                                  {orderNum !== 'General' && (
                                    <button
                                      onClick={() => {
                                        const order = orders.find(o => o.orderNumber === orderNum);
                                        if (order) setSelectedOrder(order);
                                      }}
                                      className="ml-auto p-1.5 bg-bg-input border border-border rounded-lg text-text-3 hover:text-cyan hover:border-cyan transition-all flex items-center gap-1.5"
                                      title="View Order Details"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">View Order</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {groupedEmails[orderNum].map((email) => (
                              <tr
                                key={email.id}
                                className="hover:bg-cyan/5 transition-colors group cursor-pointer"
                                onClick={() => setSelectedEmail(email)}
                              >
                                <td className="px-6 py-4 pl-10">
                                  <div className="text-sm text-text-1">{new Date(email.sentAt).toLocaleDateString('en-NZ')}</div>
                                  <div className="text-[10px] text-text-3 uppercase">{new Date(email.sentAt).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-text-1">{email.recipientEmail}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-xs font-mono text-text-2">{email.type}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-text-2 line-clamp-1">{email.subject}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {email.status}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  ) : (
                    <>
                      <thead>
                        <tr className="bg-bg-deep/50 text-text-3 text-[10px] uppercase font-bold tracking-widest border-b border-border">
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
                                  <span className="font-mono text-cyan font-bold">#{order.orderNumber}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(order.orderNumber); }}
                                    className="p-1 text-text-3 hover:text-cyan transition-colors"
                                    title="Copy Order Number"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-text-1">{new Date(order.createdAt).toLocaleDateString('en-NZ')}</div>
                                <div className="text-[10px] text-text-3 uppercase">{new Date(order.createdAt).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-text-1">{order.customerName}</div>
                                <div className="text-xs text-text-3">{order.customerEmail}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-text-1">${(order.orderTotal || 0).toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-cyan hover:border-cyan transition-all"
                                    title="View Details"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setActiveTab('emails'); setSearchTerm(order.orderNumber); }}
                                    className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-cyan hover:border-cyan transition-all"
                                    title="View Email Logs"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrder(order)}
                                    className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all"
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
                    </>
                  )}
                </table>
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

      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEmail(null)}
              className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-card border border-border-hi rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 bg-bg-deep border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-cyan" />
                  <h2 className="text-lg font-bold text-text-1">Email Details</h2>
                </div>
                <button onClick={() => setSelectedEmail(null)} className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Recipient</div>
                    <div className="text-sm text-text-1">{selectedEmail.recipientEmail}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Sent At</div>
                    <div className="text-sm text-text-1">{new Date(selectedEmail.sentAt).toLocaleString('en-NZ')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Type</div>
                    <div className="text-sm text-cyan font-mono">{selectedEmail.type}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Order #</div>
                    <div className="text-sm text-text-1">#{selectedEmail.orderNumber || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-1">Subject</div>
                  <div className="text-sm text-text-1 font-bold">{selectedEmail.subject}</div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3">Message Body</div>
                  <div
                    className="bg-bg-deep border border-border rounded-xl p-4 text-sm text-text-2 leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body || 'No body content logged.' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-bg-deep/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-1">Message Details</h3>
                    <p className="text-xs text-text-3 uppercase tracking-widest font-bold">From: {selectedMessage.customerEmail}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-bg-input rounded-xl text-text-3 hover:text-text-1 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-text-3 uppercase tracking-widest mb-1">Subject</h4>
                      <p className="text-lg font-bold text-text-1">{selectedMessage.subject}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-text-3 uppercase tracking-widest mb-1">Received</h4>
                      <p className="text-sm text-text-2">{new Date(selectedMessage.createdAt).toLocaleString('en-NZ')}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-bg-deep/50 rounded-2xl border border-border">
                    <h4 className="text-sm font-bold text-text-3 uppercase tracking-widest mb-3">Message</h4>
                    <p className="text-text-1 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                  </div>
                </div>

                {selectedMessage.status === 'replied' && (
                  <div className="p-6 bg-green-400/5 rounded-2xl border border-green-400/20">
                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3">Your Reply</h4>
                    <p className="text-text-2 whitespace-pre-wrap italic">{selectedMessage.replyBody}</p>
                    <p className="text-[10px] text-text-3 mt-4 uppercase tracking-widest">
                      Replied on: {new Date(selectedMessage.repliedAt).toLocaleString('en-NZ')}
                    </p>
                  </div>
                )}

                {selectedMessage.status !== 'replied' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text-3 uppercase tracking-widest">Send a Reply</h4>
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full h-40 bg-bg-input border border-border rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan transition-all resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        disabled={isReplying || !replyBody.trim()}
                        onClick={async () => {
                          setIsReplying(true);
                          try {
                            const response = await fetch('/api/reply-message', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                messageId: selectedMessage.id,
                                recipientEmail: selectedMessage.customerEmail,
                                subject: selectedMessage.subject,
                                body: replyBody
                              })
                            });
                            if (response.ok) {
                              alert('Reply sent successfully!');
                              setSelectedMessage(null);
                              setReplyBody('');
                              fetchData();
                            } else {
                              alert('Failed to send reply.');
                            }
                          } catch (err) {
                            console.error('Error replying:', err);
                            alert('An error occurred.');
                          } finally {
                            setIsReplying(false);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-cyan text-bg-deep rounded-xl font-bold hover:shadow-lg hover:shadow-cyan/20 transition-all disabled:opacity-50"
                      >
                        {isReplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadingRow: React.FC = () => (
  <tr>
    <td colSpan={6} className="px-6 py-20 text-center">
      <RefreshCw className="w-8 h-8 text-cyan animate-spin mx-auto mb-4" />
      <p className="text-text-3 animate-pulse">Synchronizing with database...</p>
    </td>
  </tr>
);

const EmptyRow: React.FC = () => (
  <tr>
    <td colSpan={6} className="px-6 py-20 text-center">
      <AlertCircle className="w-8 h-8 text-text-3 mx-auto mb-4" />
      <p className="text-text-3">No records found matching your criteria.</p>
    </td>
  </tr>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ label, value, icon, color = "text-text-1" }) => (
  <div className="bg-bg-card border border-border p-4 rounded-2xl">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-bg-input ${color}`}>{icon}</div>
      <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">{label}</span>
    </div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
    pending:   { bg: 'bg-yellow-400/10',  text: 'text-yellow-400',  icon: <Clock className="w-3 h-3" /> },
    shipped:   { bg: 'bg-blue-400/10',    text: 'text-blue-400',    icon: <Truck className="w-3 h-3" /> },
    delivered: { bg: 'bg-green-400/10',   text: 'text-green-400',   icon: <CheckCircle2 className="w-3 h-3" /> },
    cancelled: { bg: 'bg-red-400/10',     text: 'text-red-400',     icon: <XCircle className="w-3 h-3" /> },
    refunded:  { bg: 'bg-purple-400/10',  text: 'text-purple-400',  icon: <AlertCircle className="w-3 h-3" /> },
    delayed:   { bg: 'bg-orange-400/10',  text: 'text-orange-400',  icon: <Clock className="w-3 h-3" /> },
    paid:      { bg: 'bg-emerald-400/10', text: 'text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  const style = styles[status] || styles.pending;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.bg} ${style.text} text-[10px] font-bold uppercase tracking-wider`}>
      {style.icon}
      {status}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
      active ? 'bg-cyan text-bg-deep shadow-lg shadow-cyan/20' : 'text-text-3 hover:text-text-1 hover:bg-bg-input'
    }`}
  >
    <div className={`${active ? 'text-bg-deep' : 'text-text-3 group-hover:text-cyan'} transition-colors`}>{icon}</div>
    <span className="text-sm font-bold">{label}</span>
  </button>
);

export default AdminDashboard;
