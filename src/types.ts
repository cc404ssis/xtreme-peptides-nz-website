export interface Order {
  id: string;
  orderNumber: string;
  createdAt: any; // Using any for Timestamp or string
  updatedAt: any;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderTotal: number;
  subtotal: number;
  shippingCost: number;
  status: 'pending' | 'awaiting_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export interface OrderItem {
  id?: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  shippingMethod: string;
}

export interface EmailLog {
  id: string;
  sentAt: any;
  recipientEmail: string;
  orderNumber: string;
  orderId?: string;
  type: string;
  subject: string;
  body?: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  customerName?: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  source: 'contact_form' | 'email';
  createdAt: any;
  repliedAt?: any;
  replyBody?: string;
}
