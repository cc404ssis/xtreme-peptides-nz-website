import React, { useState } from 'react';
import { Order, EmailLog } from '../types';
import { 
  X, 
  Mail, 
  MapPin, 
  CreditCard, 
  Truck, 
  Package, 
  Calendar,
  Hash,
  User,
  Phone,
  ExternalLink,
  ChevronDown,
  Send,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 bg-bg-card border border-border rounded-lg text-text-3 hover:text-cyan hover:border-cyan transition-all"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onClose, onUpdate }) => {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [updating, setUpdating] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(order.status);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  React.useEffect(() => {
    const fetchEmailHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from('email_logs')
          .select('*')
          .eq('order_number', order.orderNumber)
          .order('sent_at', { ascending: false });
        if (error) throw error;
        const logs = (data || []).map((row: any) => ({
          id: row.id,
          orderId: row.order_id,
          orderNumber: row.order_number,
          recipientEmail: row.recipient_email,
          subject: row.subject,
          type: row.type,
          status: row.status,
          sentAt: row.sent_at,
          body: row.body,
        } as EmailLog));
        setEmailHistory(logs);
      } catch (err) {
        console.error('Error fetching email history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchEmailHistory();
  }, [order.orderNumber]);

  const templates: Record<string, { subject: string, body: (order: Order, tracking?: string) => string }> = {
    pending: {
      subject: `Order #${order.orderNumber} is Pending Payment`,
      body: (o) => `Hi ${o.customerName},<br><br>Your order #${o.orderNumber} is currently pending payment. Once payment is received, we will begin preparing your order.<br><br>Thank you for shopping with XTREME PEPTIDES NZ.`
    },
    shipped: {
      subject: `Your Order #${order.orderNumber} has been shipped!`,
      body: (o, t) => `Hi ${o.customerName},<br><br>Great news! Your order #${o.orderNumber} has been shipped.<br><br><b>Tracking Number:</b> ${t || 'Available soon'}<br><br>You can track your package using this number on the NZ Post website.<br><br>Thank you for shopping with XTREME PEPTIDES NZ.`
    },
    delivered: {
      subject: `Your Order #${order.orderNumber} has been delivered`,
      body: (o) => `Hi ${o.customerName},<br><br>Your order #${o.orderNumber} has been marked as delivered.<br><br>We hope you enjoy your purchase!<br><br>Thank you for shopping with XTREME PEPTIDES NZ.`
    },
    cancelled: {
      subject: `Your Order #${order.orderNumber} has been cancelled`,
      body: (o) => `Hi ${o.customerName},<br><br>Your order #${order.orderNumber} has been cancelled.<br><br>If you have any questions, please contact our support team.<br><br>Thank you.`
    },
    delayed: {
      subject: `Update regarding your Order #${order.orderNumber}`,
      body: (o) => `Hi ${o.customerName},<br><br>There has been a slight delay with your order #${o.orderNumber}. We are working hard to get it to you as soon as possible.<br><br>Thank you for your patience.`
    },
    refunded: {
      subject: `Refund processed for Order #${order.orderNumber}`,
      body: (o) => `Hi ${o.customerName},<br><br>A refund has been processed for your order #${o.orderNumber}. It may take a few business days to appear in your account.<br><br>Thank you.`
    },
    custom: {
      subject: '',
      body: () => ''
    }
  };

  const filteredItems = order.items.filter(item => 
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (item.size && item.size.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, tracking_number: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', order.id);
      if (error) throw error;

      if (sendEmail) {
        await handleSendStatusEmail();
      }

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Check console for details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendStatusEmail = async () => {
    setEmailSending(true);
    try {
      let subject = '';
      let body = '';

      if (selectedTemplate === 'custom') {
        subject = customSubject || `Update regarding your Order #${order.orderNumber}`;
        body = customBody || `Hi ${order.customerName},<br><br>There has been an update to your order #${order.orderNumber}.`;
      } else {
        const template = templates[selectedTemplate] || templates.pending;
        subject = template.subject;
        body = template.body(order, trackingNumber);
      }

      const response = await fetch('/api/send-status-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          recipientEmail: order.customerEmail,
          subject,
          body,
          type: `status_${status}`,
          trackingNumber
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
    } catch (err) {
      console.error('Error sending status email:', err);
      alert('Status updated, but failed to send email notification.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-bg-card border border-border-hi rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan/10"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-bg-deep border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-cyan rounded-full" />
            <h2 className="text-lg font-bold text-text-1">Order Details</h2>
            <span className="text-text-3 font-mono text-sm">#{order.orderNumber}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-bg-input border border-border rounded-lg text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard icon={<Hash className="w-4 h-4" />} label="Order Number" value={order.orderNumber} mono />
            <InfoCard icon={<Calendar className="w-4 h-4" />} label="Date Placed" value={new Date(order.createdAt).toLocaleString('en-NZ')} />
            <InfoCard icon={<CreditCard className="w-4 h-4" />} label="Payment" value={order.paymentMethod || 'TBC'} />
            <InfoCard icon={<Truck className="w-4 h-4" />} label="Tracking" value={order.trackingNumber || 'Not provided'} mono={!!order.trackingNumber} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer & Shipping */}
            <div className="space-y-6">
              <section>
                <div className="text-cyan text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User className="w-3 h-3" /> Customer Information
                </div>
                <div className="bg-bg-input border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center text-cyan">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-1">{order.customerName}</div>
                      <div className="text-xs text-text-3">Customer Name</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center text-cyan">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-text-1 flex items-center justify-between">
                        {order.customerEmail}
                        <CopyButton text={order.customerEmail} />
                      </div>
                      <div className="text-xs text-text-3">Email Address</div>
                    </div>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center text-cyan">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-text-1 flex items-center justify-between">
                          {order.customerPhone}
                          <CopyButton text={order.customerPhone} />
                        </div>
                        <div className="text-xs text-text-3">Phone Number</div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="text-cyan text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Shipping Address
                </div>
                <div className="bg-bg-input border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-text-1 leading-relaxed">
                      {order.shippingAddress.name || order.customerName}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.region}<br />
                      {order.shippingAddress.postalCode}<br />
                      New Zealand
                    </div>
                    <div className="flex flex-col gap-2">
                      <CopyButton text={`${order.shippingAddress.name || order.customerName}\n${order.shippingAddress.address}\n${order.shippingAddress.city}, ${order.shippingAddress.region}\n${order.shippingAddress.postalCode}\nNew Zealand`} />
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress.address}, ${order.shippingAddress.city}, New Zealand`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-bg-card border border-border rounded-lg text-text-3 hover:text-cyan hover:border-cyan transition-all"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <div className="text-xs text-text-3">Shipping Method</div>
                    <div className="text-sm font-bold text-cyan">{order.shippingAddress.shippingMethod || 'Standard'}</div>
                  </div>
                </div>
              </section>
            </div>

            {/* Items & Totals */}
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-cyan text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Package className="w-3 h-3" /> Order Items
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-3" />
                    <input 
                      type="text"
                      placeholder="Search items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full bg-bg-input border border-border rounded-lg pl-8 pr-3 py-1.5 text-[10px] focus:outline-none focus:border-cyan transition-all"
                    />
                  </div>
                </div>
                <div className="bg-bg-input border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-bg-deep text-text-3 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-text-3 text-xs italic">
                            No items found matching "{itemSearch}"
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-cyan/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-bold text-text-1">{item.name}</div>
                              <div className="text-xs text-text-3">{item.size}</div>
                            </td>
                            <td className="px-4 py-3 text-center text-text-2">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-bold text-text-1">${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="p-4 bg-bg-deep border-t border-border space-y-2">
                    <div className="flex justify-between text-xs text-text-3">
                      <span>Subtotal</span>
                      <span>${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-text-3">
                      <span>Shipping</span>
                      <span>${(order.shippingCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-cyan pt-2 border-t border-border/50">
                      <span>Total</span>
                      <span>${(order.orderTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Email History Section */}
          <section className="mt-8">
            <div className="text-cyan text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email History
            </div>
            <div className="bg-bg-input border border-border rounded-xl overflow-hidden">
              {loadingHistory ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan" />
                </div>
              ) : emailHistory.length === 0 ? (
                <div className="p-8 text-center text-text-3 text-sm italic">
                  No emails sent for this order yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {emailHistory.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-cyan/5 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-sm font-bold text-text-1">{log.subject}</div>
                        <div className="text-[10px] font-mono text-text-3">
                          {new Date(log.sentAt).toLocaleString('en-NZ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan">{log.type.replace('_', ' ')}</span>
                        <span className="text-[10px] text-text-3">{log.recipientEmail}</span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-6 bg-bg-deep border-t border-border flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Update Order Status</label>
                <select 
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    setStatus(newStatus);
                    if (templates[newStatus]) {
                      setSelectedTemplate(newStatus);
                    }
                  }}
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex justify-between">
                  Tracking Number
                  {order.trackingNumber && (
                    <a 
                      href={`https://www.nzpost.co.nz/tools/tracking?track=${order.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan hover:underline flex items-center gap-1"
                    >
                      Track on NZ Post <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number..."
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all pr-10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <CopyButton text={trackingNumber} />
                  </div>
                </div>
                {sendEmail && selectedTemplate === 'shipped' && !trackingNumber.trim() && (
                  <p className="text-[10px] text-red-400 font-bold animate-pulse">
                    Tracking number is required for shipping notification
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Email Template</label>
                <select 
                  value={selectedTemplate}
                  onChange={(e) => {
                    const newTemplate = e.target.value;
                    console.log(`Email template changed to: ${newTemplate}`);
                    setSelectedTemplate(newTemplate);
                    // If it's a standard status template, update the order status as well
                    if (newTemplate !== 'custom' && ['pending', 'shipped', 'delivered', 'cancelled', 'delayed', 'refunded'].includes(newTemplate)) {
                      console.log(`Updating order status to match template: ${newTemplate}`);
                      setStatus(newTemplate as any);
                    }
                  }}
                  disabled={!sendEmail}
                  className="w-full bg-bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all disabled:opacity-50"
                >
                  <option value="pending">Pending Payment</option>
                  <option value="shipped">Order Shipped</option>
                  <option value="delivered">Order Delivered</option>
                  <option disabled>─────────────────</option>
                  <option value="cancelled">Order Cancelled</option>
                  <option value="delayed">Order Delayed</option>
                  <option value="refunded">Order Refunded</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              {selectedTemplate === 'custom' && sendEmail && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <input 
                    type="text"
                    placeholder="Email Subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all"
                  />
                  <textarea 
                    placeholder="Email Body (HTML supported)"
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={3}
                    className="w-full bg-bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-10 h-5 bg-bg-input border border-border rounded-full transition-all group-hover:border-cyan/50">
                <input 
                  type="checkbox" 
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-all ${sendEmail ? 'translate-x-5 bg-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]' : 'bg-text-3'}`} />
              </div>
              <span className="text-sm font-bold text-text-2 group-hover:text-text-1 transition-colors">Send notification email to customer</span>
            </label>

            <button 
              onClick={handleUpdateStatus}
              disabled={
                updating || 
                (status === order.status && trackingNumber === order.trackingNumber && !sendEmail) ||
                (sendEmail && selectedTemplate === 'shipped' && !trackingNumber.trim())
              }
              className="px-8 py-3 bg-cyan text-bg-deep font-bold rounded-xl hover:bg-cyan/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan/20"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({ icon, label, value, mono }) => (
  <div className="bg-bg-input border border-border rounded-xl p-4">
    <div className="text-text-3 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
      {icon} {label}
    </div>
    <div className={`text-sm font-bold text-text-1 ${mono ? 'font-mono text-cyan' : ''}`}>{value}</div>
  </div>
);

export default OrderDetail;
