import { useState, useEffect } from 'react';
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
  Search,
  DollarSign,
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

type Template = 'bank_details' | 'shipping' | 'cancelled' | 'refunded';

const TEMPLATE_LABELS: Record<Template, string> = {
  bank_details: 'Bank Transfer Details',
  shipping: 'Shipping Details (with tracking)',
  cancelled: 'Order Cancelled',
  refunded: 'Refund Processed',
};

// Map a template to the status the order should move to when sent
const TEMPLATE_STATUS_MAP: Record<Template, Order['status']> = {
  bank_details: 'awaiting_payment',
  shipping: 'shipped',
  cancelled: 'cancelled',
  refunded: 'refunded',
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 bg-bg-card border border-border rounded-none text-text-3 hover:text-cyan hover:border-cyan transition-all"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const OrderDetail = ({ order, onClose, onUpdate }: OrderDetailProps) => {
  const [status, setStatus] = useState<Order['status']>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [updating, setUpdating] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('bank_details');
  const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
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
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Check console for details.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendEmail = async () => {
    if (selectedTemplate === 'shipping' && !trackingNumber.trim()) {
      alert('Tracking number is required to send the shipping email.');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/send-status-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          recipientEmail: order.customerEmail,
          template: selectedTemplate,
          trackingNumber: selectedTemplate === 'shipping' ? trackingNumber : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      // Auto-advance order status to match the template
      const newStatus = TEMPLATE_STATUS_MAP[selectedTemplate];
      const updatePayload: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (selectedTemplate === 'shipping') updatePayload.tracking_number = trackingNumber;

      await supabase.from('orders').update(updatePayload).eq('id', order.id);

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email. Check console for details.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-bg-card border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.18)' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-bg-deep flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', borderTop: '2px solid var(--color-xp-red)' }}>
          <div className="flex items-center gap-4">
            <div>
              <div className="xp-section-label text-[9px]">— Order Details —</div>
              <h2 className="xp-display text-2xl mt-1">
                #<span style={{ color: 'var(--color-xp-red)' }}>{order.orderNumber}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-bg-input border border-border rounded-none text-text-2 hover:text-red-400 hover:border-red-400/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard icon={<Hash className="w-4 h-4" />} label="Order Number" value={order.orderNumber} mono />
            <InfoCard icon={<Calendar className="w-4 h-4" />} label="Date Placed" value={formatDatePlaced(order.createdAt)} />
            <InfoCard icon={<CreditCard className="w-4 h-4" />} label="Payment" value={order.paymentMethod || 'Bank Transfer'} />
            <InfoCard icon={<Truck className="w-4 h-4" />} label="Tracking" value={order.trackingNumber || 'Not provided'} mono={!!order.trackingNumber} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer & Shipping */}
            <div className="space-y-6">
              <section>
                <div className="xp-section-label text-[10px] mb-4 flex items-center gap-2">
                  <User className="w-3 h-3" /> Customer Information
                </div>
                <div className="bg-bg-input border border-border rounded-none p-4 space-y-3">
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
                <div className="xp-section-label text-[10px] mb-4 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Shipping Address
                </div>
                <div className="bg-bg-input border border-border rounded-none p-4">
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
                        className="p-1.5 bg-bg-card border border-border rounded-none text-text-3 hover:text-cyan hover:border-cyan transition-all"
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
                  <div className="xp-section-label text-[10px] flex items-center gap-2">
                    <Package className="w-3 h-3" /> Order Items
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-3" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full bg-bg-input border border-border rounded-none pl-8 pr-3 py-1.5 text-[10px] focus:outline-none focus:border-cyan transition-all"
                    />
                  </div>
                </div>
                <div className="bg-bg-input border border-border rounded-none overflow-hidden">
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

          {/* Email History */}
          <section className="mt-8">
            <div className="xp-section-label text-[10px] mb-4 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email History
            </div>
            <div className="bg-bg-input border border-border rounded-none overflow-hidden">
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

        {/* Modal Footer — Email actions + status update */}
        <div className="px-6 py-6 bg-bg-deep border-t border-border flex flex-col gap-6">
          {/* Send Email panel */}
          <div className="space-y-4">
            <div className="xp-section-label text-[10px] flex items-center gap-2">
              <Send className="w-3 h-3" /> Send Email to Customer
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Email Template</label>
                <div className="relative">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as Template)}
                    className="w-full appearance-none bg-bg-input border border-border rounded-none px-4 py-2 pr-10 text-sm focus:outline-none focus:border-cyan transition-all"
                  >
                    <option value="bank_details">{TEMPLATE_LABELS.bank_details}</option>
                    <option value="shipping">{TEMPLATE_LABELS.shipping}</option>
                    <option disabled>─────────────────</option>
                    <option value="cancelled">{TEMPLATE_LABELS.cancelled}</option>
                    <option value="refunded">{TEMPLATE_LABELS.refunded}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {selectedTemplate === 'shipping' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter NZ Post tracking..."
                    className="w-full bg-bg-input border border-border rounded-none px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all"
                  />
                </div>
              )}
            </div>

            <div className="bg-bg-input border border-border rounded-none p-4">
              <div className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-2">Preview</div>
              <pre className="text-xs text-text-2 whitespace-pre-wrap font-mono">{previewTemplate(selectedTemplate, order.orderNumber, trackingNumber)}</pre>
            </div>

            <button
              onClick={handleSendEmail}
              disabled={emailSending || (selectedTemplate === 'shipping' && !trackingNumber.trim())}
              className="btn-xp-primary w-full"
            >
              {emailSending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send {TEMPLATE_LABELS[selectedTemplate]} Email</>
              )}
            </button>
          </div>

          {/* Manual status update (without sending email) */}
          <div className="pt-4 border-t border-border/50">
            <div className="xp-section-label text-[10px] mb-3 flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Manual Status Update (no email)
            </div>
            <div className="flex gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order['status'])}
                className="flex-1 bg-bg-input border border-border rounded-none px-4 py-2 text-sm focus:outline-none focus:border-cyan transition-all"
              >
                <option value="pending">Pending</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={updating || (status === order.status && trackingNumber === (order.trackingNumber || ''))}
                className="px-6 py-2 bg-bg-input border border-border rounded-none text-text-1 hover:border-cyan hover:text-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Status
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function previewTemplate(template: Template, orderNumber: string, tracking: string): string {
  switch (template) {
    case 'bank_details':
      return [
        'BANK TRANSFER DETAILS',
        '',
        'Account Name: xtpnz',
        'Account Number: 02-0144-0217479-002',
        `Reference: ${orderNumber}`,
        '',
        'Please make sure to include the reference when sending payment.',
        '',
        'Your order will ship once payment is confirmed.',
      ].join('\n');
    case 'shipping':
      return [
        'Your order has shipped.',
        '',
        `Order: ${orderNumber}`,
        `Tracking: ${tracking || '<enter tracking number>'}`,
      ].join('\n');
    case 'cancelled':
      return [
        'Your order has been cancelled.',
        '',
        `Order: ${orderNumber}`,
      ].join('\n');
    case 'refunded':
      return [
        'A refund has been processed for your order.',
        '',
        `Order: ${orderNumber}`,
      ].join('\n');
  }
}

function formatDatePlaced(value: string | number | Date): string {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${hours}:${minutes}${ampm}`;
}

const InfoCard = ({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
  <div className="bg-bg-input border border-border rounded-none p-4">
    <div className="text-text-3 text-[10px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
      {icon} {label}
    </div>
    <div className={`text-sm font-bold text-text-1 ${mono ? 'font-mono text-cyan' : ''}`}>{value}</div>
  </div>
);

export default OrderDetail;
