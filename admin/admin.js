/**
 * XTREME PEPTIDES NZ Admin Dashboard
 * Uses Supabase for database and authentication
 */

// Configuration - Production Supabase credentials
const SUPABASE_URL = 'https://bnqnsqfimobqkfwziz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucW5zc2ZxZmltb2Jxa2Z3eml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTcyMzQsImV4cCI6MjA5ODgzMzIzNH0.cdoC6bPSTq_-VshuPxkMhLOr2F6Dh8q9MWbVhim8MwQ';

// Initialize Supabase client with error handling
let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('Supabase library not loaded');
  }
} catch (e) {
  console.error('Failed to initialize Supabase:', e);
}

// Alias for backward compatibility (Safari strict mode fix)
let supabase = supabaseClient;

// State
let currentUser = null;
let currentOrder = null;
let orders = [];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const adminUsername = document.getElementById('admin-username');
const ordersTable = document.getElementById('orders-tbody');
const emailLogsTable = document.getElementById('email-logs-tbody');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');
const refreshBtn = document.getElementById('refresh-btn');
const refreshLogsBtn = document.getElementById('refresh-logs-btn');
const orderModal = document.getElementById('order-modal');
const emailModal = document.getElementById('email-modal');
const emailForm = document.getElementById('email-form');
const navButtons = document.querySelectorAll('.nav-btn');

// Initialize
async function init() {
  // Check if user is already logged in (session storage)
  const session = sessionStorage.getItem('adminSession');
  if (session) {
    currentUser = JSON.parse(session);
    showDashboard();
  }

  // Event Listeners
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  refreshBtn.addEventListener('click', loadOrders);
  refreshLogsBtn.addEventListener('click', loadEmailLogs);
  statusFilter.addEventListener('change', filterOrders);
  searchInput.addEventListener('input', filterOrders);
  emailForm.addEventListener('submit', handleSendEmail);

  // Navigation
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const section = btn.dataset.section;
      document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
      document.getElementById(`${section}-section`).classList.remove('hidden');
      
      if (section === 'email-logs') {
        loadEmailLogs();
      }
    });
  });

  // Modal close buttons
  document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Modal actions
  document.getElementById('send-status-email-btn').addEventListener('click', () => openEmailModal('status'));
  document.getElementById('send-custom-email-btn').addEventListener('click', () => openEmailModal('custom'));
}

// Authentication
async function handleLogin(e) {
  e.preventDefault();
  
  // Check if Supabase is initialized
  if (!supabase) {
    loginError.textContent = 'Authentication service unavailable. Please refresh the page.';
    loginError.style.display = 'block';
    return;
  }
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    // Simple password check - in production, use proper hashing
    // For now, we'll check against the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      throw new Error('Invalid credentials');
    }

    // Simple password comparison (in production, use bcrypt)
    // For demo purposes, we'll use a simple comparison
    // In production: const validPassword = await bcrypt.compare(password, data.password_hash);
    const validPassword = checkPassword(password, data.password_hash);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    currentUser = { username: data.username, email: data.email };
    sessionStorage.setItem('adminSession', JSON.stringify(currentUser));
    
    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('username', username);

    showDashboard();
  } catch (error) {
    loginError.textContent = error.message || 'Login failed';
    loginError.style.display = 'block';
  }
}

// Simple password check (replace with proper bcrypt in production)
function checkPassword(password, hash) {
  // For demo: if hash starts with $2a$ it's bcrypt, otherwise compare plain text
  if (hash.startsWith('$2a$')) {
    // In production, use bcrypt library
    // For now, we'll accept a demo password
    return password === 'admin123'; // Demo only - change in production!
  }
  return password === hash;
}

function handleLogout() {
  currentUser = null;
  sessionStorage.removeItem('adminSession');
  loginScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
  loginForm.reset();
}

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  adminUsername.textContent = currentUser.username;
  loadOrders();
}

// Orders Management
async function loadOrders() {
  if (!supabase) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    orders = data || [];
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Failed to load orders: ' + error.message);
  }
}

function renderOrders(ordersToRender) {
  ordersTable.innerHTML = ordersToRender.map(order => `
    <tr>
      <td>${order.order_number}</td>
      <td>${new Date(order.created_at).toLocaleDateString()}</td>
      <td>${order.customer_name}</td>
      <td>${order.customer_email}</td>
      <td>$${parseFloat(order.total).toFixed(2)}</td>
      <td><span class="status-badge status-${order.status}">${order.status}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">View</button>
      </td>
    </tr>
  `).join('');
}

function filterOrders() {
  const status = statusFilter.value;
  const search = searchInput.value.toLowerCase();

  let filtered = orders;

  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  if (search) {
    filtered = filtered.filter(o => 
      o.order_number.toLowerCase().includes(search) ||
      o.customer_name.toLowerCase().includes(search) ||
      o.customer_email.toLowerCase().includes(search)
    );
  }

  renderOrders(filtered);
}

async function viewOrder(orderId) {
  if (!supabase) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    currentOrder = data;
    renderOrderModal(data);
    orderModal.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading order:', error);
    alert('Failed to load order details');
  }
}

function renderOrderModal(order) {
  const items = order.items || [];
  const address = order.shipping_address || {};

  document.getElementById('order-modal-body').innerHTML = `
    <div class="order-info">
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
      <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
      <p><strong>Payment Status:</strong> ${order.payment_status}</p>
      ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
    </div>
    
    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      ${order.customer_phone ? `<p><strong>Phone:</strong> ${order.customer_phone}</p>` : ''}
    </div>
    
    <div class="shipping-info">
      <h3>Shipping Address</h3>
      <p>${address.name || order.customer_name}</p>
      <p>${address.address || ''}</p>
      <p>${address.city || ''}, ${address.postcode || ''}</p>
      <p>${address.country || 'New Zealand'}</p>
    </div>
    
    <div class="order-items">
      <h3>Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$${parseFloat(item.price).toFixed(2)}</td>
              <td>$${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="order-totals">
        <p><strong>Subtotal:</strong> $${parseFloat(order.subtotal).toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${parseFloat(order.shipping_cost).toFixed(2)}</p>
        <p class="total"><strong>Total:</strong> $${parseFloat(order.total).toFixed(2)}</p>
      </div>
    </div>
    
    ${order.notes ? `
    <div class="order-notes">
      <h3>Notes</h3>
      <p>${order.notes}</p>
    </div>
    ` : ''}
  `;
}

// Email Logs
async function loadEmailLogs() {
  if (!supabase) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    renderEmailLogs(data || []);
  } catch (error) {
    console.error('Error loading email logs:', error);
    alert('Failed to load email logs');
  }
}

function renderEmailLogs(logs) {
  emailLogsTable.innerHTML = logs.map(log => `
    <tr>
      <td>${new Date(log.sent_at).toLocaleString()}</td>
      <td>${log.order_number || '-'}</td>
      <td>${log.recipient_email}</td>
      <td>${log.email_type}</td>
      <td>${log.subject}</td>
      <td><span class="status-badge ${log.status === 'sent' ? 'status-completed' : 'status-cancelled'}">${log.status}</span></td>
    </tr>
  `).join('');
}

// Email Sending
function openEmailModal(type) {
  if (!currentOrder) return;

  document.getElementById('email-modal-title').textContent = 
    type === 'status' ? 'Send Status Update' : 'Send Custom Message';
  
  document.getElementById('email-order-number').value = currentOrder.order_number;
  document.getElementById('email-recipient').value = currentOrder.customer_email;
  document.getElementById('email-message').value = '';
  document.getElementById('email-tracking').value = currentOrder.tracking_number || '';
  document.getElementById('email-status').value = '';
  document.getElementById('email-error').style.display = 'none';
  document.getElementById('email-success').style.display = 'none';

  emailModal.classList.remove('hidden');
}

async function handleSendEmail(e) {
  e.preventDefault();
  
  // Check if Supabase is initialized
  if (!supabase) {
    document.getElementById('email-error').textContent = 'Database connection unavailable. Please refresh the page.';
    document.getElementById('email-error').style.display = 'block';
    return;
  }

  const orderNumber = document.getElementById('email-order-number').value;
  const recipient = document.getElementById('email-recipient').value;
  const status = document.getElementById('email-status').value;
  const trackingNumber = document.getElementById('email-tracking').value;
  const message = document.getElementById('email-message').value;

  const errorEl = document.getElementById('email-error');
  const successEl = document.getElementById('email-success');

  try {
    // Update order status if changed
    if (status && currentOrder && currentOrder.status !== status) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: status,
          tracking_number: trackingNumber || currentOrder.tracking_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (updateError) throw updateError;
    }

    // Send email via API
    const response = await fetch('/api/send-status-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: recipient,
        orderNumber: orderNumber,
        status: status || currentOrder.status,
        message: message,
        trackingNumber: trackingNumber,
        customMessage: message,
        emailType: message ? 'custom' : 'status'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    // Log email to database
    await supabase.from('email_logs').insert({
      order_id: currentOrder.id,
      order_number: orderNumber,
      recipient_email: recipient,
      email_type: message ? 'custom' : 'status_update',
      subject: message ? `Message Regarding Your Order - ${orderNumber}` : `Order Status Update - ${orderNumber}`,
      status: 'sent',
      resend_email_id: result.emailId
    });

    successEl.textContent = 'Email sent successfully!';
    successEl.style.display = 'block';
    errorEl.style.display = 'none';

    // Refresh orders and close modal after a delay
    setTimeout(() => {
      closeModals();
      loadOrders();
    }, 1500);

  } catch (error) {
    errorEl.textContent = error.message || 'Failed to send email';
    errorEl.style.display = 'block';
    successEl.style.display = 'none';

    // Log failed email attempt
    await supabase.from('email_logs').insert({
      order_id: currentOrder?.id,
      order_number: orderNumber,
      recipient_email: recipient,
      email_type: message ? 'custom' : 'status_update',
      subject: message ? `Message Regarding Your Order - ${orderNumber}` : `Order Status Update - ${orderNumber}`,
      status: 'failed',
      error_message: error.message
    });
  }
}

function closeModals() {
  orderModal.classList.add('hidden');
  emailModal.classList.add('hidden');
  currentOrder = null;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Expose functions to window for onclick handlers
window.viewOrder = viewOrder;
