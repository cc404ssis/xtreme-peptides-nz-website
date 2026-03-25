/**
 * XTREME PEPTIDES NZ Admin Dashboard
 * Uses Supabase for database and authentication
 */

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.message, 'at', e.filename, ':', e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// Configuration - Production Supabase credentials
const SUPABASE_URL = 'https://bnqnssfqfimobqkfwziz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucW5zc2ZxZmltb2Jxa2Z3eml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTcyMzQsImV4cCI6MjA4OTgzMzIzNH0.cdoC6bPSTq_-VshuPxkMhLOr2F6Dh8q9MWbVhim8MwQ';

// Initialize Supabase client with error handling
let supabaseClient = null;
let supabaseInitialized = false;

function initSupabase() {
  try {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      supabaseInitialized = true;
      console.log('Supabase initialized successfully');
      return true;
    } else {
      console.log('Supabase library not ready yet...');
      return false;
    }
  } catch (e) {
    console.error('Failed to initialize Supabase:', e);
    return false;
  }
}

// State
let currentUser = null;
let currentOrder = null;
let orders = [];

// DOM Elements - initialized lazily
let loginScreen, dashboardScreen, loginForm, loginError, logoutBtn;
let adminUsername, ordersTable, emailLogsTable, statusFilter;
let searchInput, refreshBtn, refreshLogsBtn, orderModal, emailModal;
let emailForm, navButtons;

function getElements() {
  loginScreen = document.getElementById('login-screen');
  dashboardScreen = document.getElementById('dashboard-screen');
  loginForm = document.getElementById('login-form');
  loginError = document.getElementById('login-error');
  logoutBtn = document.getElementById('logout-btn');
  adminUsername = document.getElementById('admin-username');
  ordersTable = document.getElementById('orders-tbody');
  emailLogsTable = document.getElementById('email-logs-tbody');
  statusFilter = document.getElementById('status-filter');
  searchInput = document.getElementById('search-input');
  refreshBtn = document.getElementById('refresh-btn');
  refreshLogsBtn = document.getElementById('refresh-logs-btn');
  orderModal = document.getElementById('order-modal');
  emailModal = document.getElementById('email-modal');
  emailForm = document.getElementById('email-form');
  navButtons = document.querySelectorAll('.nav-btn');
  
  return loginForm && loginScreen; // Return true if essential elements found
}

// Initialize
async function init() {
  console.log('Admin dashboard initializing...');
  
  // Get DOM elements
  if (!getElements()) {
    console.error('Required DOM elements not found!');
    return;
  }
  
  console.log('DOM elements found, setting up...');

  // Try to initialize Supabase
  if (!initSupabase()) {
    // Wait a bit and retry
    setTimeout(() => {
      initSupabase();
    }, 500);
  }

  // Check if user is already logged in (session storage)
  const session = sessionStorage.getItem('adminSession');
  if (session) {
    try {
      currentUser = JSON.parse(session);
      showDashboard();
      return;
    } catch (e) {
      console.error('Failed to parse session:', e);
      sessionStorage.removeItem('adminSession');
    }
  }

  // Event Listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadOrders);
  }
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', loadEmailLogs);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
  if (searchInput) {
    searchInput.addEventListener('input', filterOrders);
  }
  if (emailForm) {
    emailForm.addEventListener('submit', handleSendEmail);
  }

  // Email type change listener
  const emailTypeSelect = document.getElementById('email-type');
  if (emailTypeSelect) {
    emailTypeSelect.addEventListener('change', handleEmailTypeChange);
  }

  // Input listeners for live preview updates
  const trackingInput = document.getElementById('email-tracking');
  const delayReasonSelect = document.getElementById('email-reason');
  const messageInput = document.getElementById('email-message');
  
  if (trackingInput) {
    trackingInput.addEventListener('input', updateEmailPreview);
  }
  if (delayReasonSelect) {
    delayReasonSelect.addEventListener('change', updateEmailPreview);
  }
  if (messageInput) {
    messageInput.addEventListener('input', updateEmailPreview);
  }

  // Navigation
  if (navButtons) {
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const section = btn.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        const sectionEl = document.getElementById(`${section}-section`);
        if (sectionEl) {
          sectionEl.classList.remove('hidden');
        }
        
        // Load appropriate data based on section
        if (section === 'email-logs') {
          loadEmailLogs();
        } else if (section === 'deleted-orders') {
          loadDeletedOrders();
        } else if (section === 'deleted-emails') {
          loadDeletedEmails();
        } else if (section.startsWith('orders-') && section !== 'orders-section') {
          const status = section.replace('orders-', '');
          loadOrdersByStatus(status);
        }
      });
    });
  }

  // Refresh buttons for all sections
  const refreshDeletedBtn = document.getElementById('refresh-deleted-btn');
  if (refreshDeletedBtn) {
    refreshDeletedBtn.addEventListener('click', loadDeletedOrders);
  }

  const refreshDeletedEmailsBtn = document.getElementById('refresh-deleted-emails-btn');
  if (refreshDeletedEmailsBtn) {
    refreshDeletedEmailsBtn.addEventListener('click', loadDeletedEmails);
  }

  // Status refresh buttons
  document.querySelectorAll('.refresh-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const status = e.target.dataset.status;
      if (status) {
        loadOrdersByStatus(status);
      }
    });
  });

  // Modal close buttons - use event delegation for dynamically added content
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.close-btn') || e.target.closest('.close-modal')) {
      closeModals();
    }
  });

  // Modal actions - use event delegation
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('#send-email-btn');
    if (btn) {
      console.log('Send Email button clicked');
      openEmailModal();
    }
  });
  
  console.log('Admin dashboard initialized successfully');
}

// Authentication
async function handleLogin(e) {
  e.preventDefault();
  
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('login-error');
  
  if (!usernameInput || !passwordInput) {
    console.error('Login inputs not found');
    return;
  }
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  console.log('Login attempt:', username);

  // EMERGENCY BYPASS: Allow login with emergency credentials (no Supabase needed)
  if (username === 'emergency' && password === 'letmein2025') {
    console.log('✅ Emergency login successful');
    currentUser = { username: 'admin (emergency)', email: 'admin@xtremepeptides.nz' };
    sessionStorage.setItem('adminSession', JSON.stringify(currentUser));
    showDashboard();
    return;
  }
  
  // Ensure supabase is initialized for normal login
  if (!supabaseClient) {
    if (errorEl) {
      errorEl.textContent = 'Initializing... please try again in a moment.';
      errorEl.style.display = 'block';
    }
    
    // Try to initialize
    initSupabase();
    
    if (!supabaseClient) {
      if (errorEl) {
        errorEl.textContent = 'Authentication service unavailable. Use emergency login: emergency / letmein2025';
      }
      return;
    }
  }

  try {
    // Query admin_users table
    const { data, error } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Supabase query error:', error);
      throw new Error('Invalid credentials');
    }

    // Check password
    const validPassword = checkPassword(password, data.password_hash);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    currentUser = { username: data.username, email: data.email };
    sessionStorage.setItem('adminSession', JSON.stringify(currentUser));
    
    // Update last login
    await supabaseClient
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('username', username);

    showDashboard();
  } catch (error) {
    console.error('Login error:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Login failed. Please check your credentials.';
      errorEl.style.display = 'block';
    }
  }
}

// Simple password check (replace with proper bcrypt in production)
function checkPassword(password, hash) {
  if (!hash) return password === 'admin123';
  // For demo: if hash starts with $2a$ it's bcrypt, otherwise compare plain text
  if (hash.startsWith('$2a$')) {
    return password === 'admin123'; // Demo fallback
  }
  return password === hash;
}

function handleLogout() {
  currentUser = null;
  sessionStorage.removeItem('adminSession');
  const loginScr = document.getElementById('login-screen');
  const dashboardScr = document.getElementById('dashboard-screen');
  const loginFm = document.getElementById('login-form');
  
  if (loginScr) loginScr.classList.remove('hidden');
  if (dashboardScr) dashboardScr.classList.add('hidden');
  if (loginFm) loginFm.reset();
}

function showDashboard() {
  const loginScr = document.getElementById('login-screen');
  const dashboardScr = document.getElementById('dashboard-screen');
  const adminUser = document.getElementById('admin-username');
  
  if (loginScr) loginScr.classList.add('hidden');
  if (dashboardScr) dashboardScr.classList.remove('hidden');
  if (adminUser && currentUser) adminUser.textContent = currentUser.username;
  loadOrders();
}

// Orders Management
async function loadOrders() {
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  const ordersTb = document.getElementById('orders-tbody');
  
  try {
    const { data, error } = await supabaseClient
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
  const ordersTb = document.getElementById('orders-tbody');
  if (!ordersTb) return;
  
  ordersTb.innerHTML = ordersToRender.map(order => `
    <tr>
      <td>${order.order_number || ''}</td>
      <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</td>
      <td>${order.customer_name || ''}</td>
      <td>${order.customer_email || ''}</td>
      <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
      <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">View</button>
        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}', '${order.order_number}')" style="background: #dc3545; margin-left: 5px;">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Delete Order
async function deleteOrder(orderId, orderNumber) {
  if (!confirm(`Are you sure you want to delete order ${orderNumber}? This cannot be undone.`)) {
    return;
  }

  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }

  try {
    // First, insert into deleted_orders table for tracking
    const { data: orderData } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderData) {
      await supabaseClient.from('deleted_orders').insert({
        original_order_id: orderId,
        order_number: orderData.order_number,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        total: orderData.total,
        status: orderData.status,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUser?.username || 'unknown'
      });
    }

    // Then delete from orders
    const { error } = await supabaseClient
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;

    console.log(`Order ${orderNumber} deleted successfully`);
    loadOrders(); // Refresh the orders list
  } catch (error) {
    console.error('Error deleting order:', error);
    alert('Failed to delete order: ' + error.message);
  }
}

// Deleted Orders
async function loadDeletedOrders() {
  console.log('Loading deleted orders...');
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  const deletedOrdersTb = document.getElementById('deleted-orders-tbody');
  
  try {
    const { data, error } = await supabaseClient
      .from('deleted_orders')
      .select('*')
      .order('deleted_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    renderDeletedOrders(data || []);
  } catch (error) {
    console.error('Error loading deleted orders:', error);
    alert('Failed to load deleted orders: ' + error.message);
  }
}

function renderDeletedOrders(ordersToRender) {
  const deletedOrdersTb = document.getElementById('deleted-orders-tbody');
  if (!deletedOrdersTb) return;
  
  deletedOrdersTb.innerHTML = ordersToRender.map(order => `
    <tr>
      <td>${order.order_number || ''}</td>
      <td>${order.deleted_at ? new Date(order.deleted_at).toLocaleString() : ''}</td>
      <td>${order.customer_name || ''}</td>
      <td>${order.customer_email || ''}</td>
      <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
      <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="permanentlyDeleteOrder('${order.id}', '${order.order_number}')" style="background: #dc3545;">Permanently Delete</button>
      </td>
    </tr>
  `).join('');
}

// Permanently delete from deleted_orders table
async function permanentlyDeleteOrder(deletedOrderId, orderNumber) {
  if (!confirm(`Are you sure you want to PERMANENTLY delete order ${orderNumber}? This action cannot be undone.`)) {
    return;
  }

  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('deleted_orders')
      .delete()
      .eq('id', deletedOrderId);

    if (error) throw error;

    console.log(`Order ${orderNumber} permanently deleted`);
    loadDeletedOrders(); // Refresh the deleted orders list
  } catch (error) {
    console.error('Error permanently deleting order:', error);
    alert('Failed to delete order: ' + error.message);
  }
}

// Load orders filtered by status for status tabs
async function loadOrdersByStatus(status) {
  console.log(`Loading ${status} orders...`);
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  const tbody = document.getElementById(`orders-${status}-tbody`);
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading...</td></tr>';
  
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    renderOrdersByStatus(status, data || []);
  } catch (error) {
    console.error(`Error loading ${status} orders:`, error);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#dc3545;">Error: ${error.message}</td></tr>`;
    }
  }
}

// Render orders to a status-specific table
function renderOrdersByStatus(status, ordersToRender) {
  const tbody = document.getElementById(`orders-${status}-tbody`);
  if (!tbody) return;
  
  if (ordersToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#8b9cb5;">No ${status} orders found</td></tr>`;
    return;
  }
  
  tbody.innerHTML = ordersToRender.map(order => `
    <tr>
      <td>${order.order_number || ''}</td>
      <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</td>
      <td>${order.customer_name || ''}</td>
      <td>${order.customer_email || ''}</td>
      <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">View</button>
        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}', '${order.order_number}')" style="background: #dc3545; margin-left: 5px;">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Deleted Emails
async function loadDeletedEmails() {
  console.log('Loading deleted emails...');
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  const tbody = document.getElementById('deleted-emails-tbody');
  
  try {
    const { data, error } = await supabaseClient
      .from('deleted_emails')
      .select('*')
      .order('deleted_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    renderDeletedEmails(data || []);
  } catch (error) {
    console.error('Error loading deleted emails:', error);
    alert('Failed to load deleted emails: ' + error.message);
  }
}

function renderDeletedEmails(logs) {
  const tbody = document.getElementById('deleted-emails-tbody');
  if (!tbody) return;
  
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#8b9cb5;">No deleted emails found</td></tr>';
    return;
  }
  
  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>${log.deleted_at ? new Date(log.deleted_at).toLocaleString() : ''}</td>
      <td>${log.order_number || '-'}</td>
      <td>${log.recipient_email || ''}</td>
      <td>${log.email_type || ''}</td>
      <td>${log.subject || ''}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="permanentlyDeleteEmail('${log.id}')" style="background: #dc3545;">Permanently Delete</button>
      </td>
    </tr>
  `).join('');
}

// Permanently delete from deleted_emails table
async function permanentlyDeleteEmail(deletedEmailId) {
  if (!confirm('Are you sure you want to PERMANENTLY delete this email record? This action cannot be undone.')) {
    return;
  }

  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('deleted_emails')
      .delete()
      .eq('id', deletedEmailId);

    if (error) throw error;

    console.log('Email permanently deleted');
    loadDeletedEmails();
  } catch (error) {
    console.error('Error permanently deleting email:', error);
    alert('Failed to delete email: ' + error.message);
  }
}

// Modified deleteEmailLog that moves to deleted_emails first
async function deleteEmailLog(logId) {
  if (!confirm('Are you sure you want to delete this email log?')) {
    return;
  }

  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }

  try {
    // First, get the email log data
    const { data: logData, error: fetchError } = await supabaseClient
      .from('email_logs')
      .select('*')
      .eq('id', logId)
      .single();

    if (fetchError) throw fetchError;

    if (logData) {
      // Move to deleted_emails
      await supabaseClient.from('deleted_emails').insert({
        original_log_id: logId,
        order_id: logData.order_id,
        order_number: logData.order_number,
        recipient_email: logData.recipient_email,
        email_type: logData.email_type,
        subject: logData.subject,
        status: logData.status,
        sent_at: logData.sent_at,
        resend_email_id: logData.resend_email_id,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUser?.username || 'unknown'
      });
    }

    // Delete from email_logs
    const { error } = await supabaseClient
      .from('email_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;

    console.log('Email log moved to deleted emails');
    loadEmailLogs();
  } catch (error) {
    console.error('Error deleting email log:', error);
    alert('Failed to delete email log: ' + error.message);
  }
}

function filterOrders() {
  const statusFltr = document.getElementById('status-filter');
  const searchInpt = document.getElementById('search-input');
  
  const status = statusFltr ? statusFltr.value : '';
  const search = searchInpt ? searchInpt.value.toLowerCase() : '';

  let filtered = orders;

  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  if (search) {
    filtered = filtered.filter(o => 
      (o.order_number || '').toLowerCase().includes(search) ||
      (o.customer_name || '').toLowerCase().includes(search) ||
      (o.customer_email || '').toLowerCase().includes(search)
    );
  }

  renderOrders(filtered);
}

async function viewOrder(orderId) {
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    currentOrder = data;
    renderOrderModal(data);
    const orderMdl = document.getElementById('order-modal');
    if (orderMdl) orderMdl.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading order:', error);
    alert('Failed to load order details');
  }
}

function renderOrderModal(order) {
  const items = order.items || [];
  const address = order.shipping_address || {};
  const modalBody = document.getElementById('order-modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="order-info">
      <p><strong>Order Number:</strong> ${order.order_number || ''}</p>
      <p><strong>Date:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString() : ''}</p>
      <p><strong>Status:</strong> <span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></p>
      <p><strong>Payment Status:</strong> ${order.payment_status || ''}</p>
      ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
    </div>
    
    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${order.customer_name || ''}</p>
      <p><strong>Email:</strong> ${order.customer_email || ''}</p>
      ${order.customer_phone ? `<p><strong>Phone:</strong> ${order.customer_phone}</p>` : ''}
    </div>
    
    <div class="shipping-info">
      <h3>Shipping Address</h3>
      <p>${address.name || order.customer_name || ''}</p>
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
              <td>${item.name || ''}</td>
              <td>${item.quantity || 0}</td>
              <td>$${parseFloat(item.price || 0).toFixed(2)}</td>
              <td>$${((item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="order-totals">
        <p><strong>Subtotal:</strong> $${parseFloat(order.subtotal || 0).toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${parseFloat(order.shipping_cost || 0).toFixed(2)}</p>
        <p class="total"><strong>Total:</strong> $${parseFloat(order.total || 0).toFixed(2)}</p>
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

// Email Templates
const EMAIL_TEMPLATES = {
  payment_confirmed: {
    subject: 'Payment Confirmed - Order {orderNumber}',
    status: 'processing',
    requiresTracking: false,
    showCustomMessage: false,
    showReason: false,
    preview: (data) => `Thank you for your payment! Your order <strong>${data.orderNumber}</strong> has been confirmed and is now being processed. We'll notify you once your order ships.`
  },
  order_shipped: {
    subject: 'Your Order Has Shipped - {orderNumber}',
    status: 'shipped',
    requiresTracking: true,
    showCustomMessage: false,
    showReason: false,
    preview: (data) => `Great news! Your order <strong>${data.orderNumber}</strong> has been shipped. Tracking: <strong>${data.trackingNumber || '[REQUIRED]'}</strong>`
  },
  order_delivered: {
    subject: 'Your Order Has Been Delivered - {orderNumber}',
    status: 'delivered',
    requiresTracking: false,
    showCustomMessage: false,
    showReason: false,
    preview: (data) => `Your order <strong>${data.orderNumber}</strong> has been delivered! Thank you for shopping with XTREME PEPTIDES NZ.`
  },
  order_cancelled: {
    subject: 'Order Cancelled - {orderNumber}',
    status: 'cancelled',
    requiresTracking: false,
    showCustomMessage: false,
    showReason: true,
    reasonType: 'cancellation',
    preview: (data) => `Your order <strong>${data.orderNumber}</strong> has been cancelled. Reason: ${data.reason || 'Not specified'}.`
  },
  order_refunded: {
    subject: 'Refund Processed - Order {orderNumber}',
    status: 'refunded',
    requiresTracking: false,
    showCustomMessage: false,
    showReason: true,
    reasonType: 'refund',
    preview: (data) => `A refund has been processed for your order <strong>${data.orderNumber}</strong>. Reason: ${data.reason || 'Not specified'}. Please allow 3-5 business days for the funds to appear in your account.`
  },
  order_delayed: {
    subject: 'Order Delay - {orderNumber}',
    status: 'processing',
    requiresTracking: false,
    showCustomMessage: false,
    showReason: true,
    reasonType: 'delay',
    preview: (data) => `We're sorry, but your order <strong>${data.orderNumber}</strong> has been delayed due to ${data.reason || 'unforeseen circumstances'}. We appreciate your patience.`
  },
  custom: {
    subject: 'Message Regarding Your Order - {orderNumber}',
    status: '',
    requiresTracking: false,
    showCustomMessage: true,
    showReason: false,
    preview: (data) => `Custom message: "${data.customMessage || '[Enter your message below...]'}"`
  }
};

const REASONS = {
  cancellation: {
    customer_request: 'Customer requested cancellation',
    out_of_stock: 'Product out of stock',
    payment_failed: 'Payment processing failed',
    suspicious_activity: 'Suspicious activity detected',
    other: 'Other'
  },
  refund: {
    customer_request: 'Customer requested refund',
    product_defect: 'Product defect/damage',
    wrong_item: 'Wrong item sent',
    not_as_described: 'Product not as described',
    late_delivery: 'Late delivery',
    other: 'Other'
  },
  delay: {
    high_demand: 'High demand',
    shipping_delay: 'Shipping carrier delays',
    out_of_stock: 'Temporary stock shortage',
    weather: 'Weather conditions',
    other: 'Other'
  }
};

// Email Logs
async function loadEmailLogs() {
  console.log('Loading email logs...');
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  const emailLogsTb = document.getElementById('email-logs-tbody');
  
  try {
    console.log('Querying email_logs table...');
    const { data, error } = await supabaseClient
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase error loading email logs:', error);
      throw error;
    }

    console.log('Email logs loaded:', data?.length || 0, 'records');
    renderEmailLogs(data || []);
  } catch (error) {
    console.error('Error loading email logs:', error);
    alert('Failed to load email logs: ' + error.message);
  }
}

function renderEmailLogs(logs) {
  const emailLogsTb = document.getElementById('email-logs-tbody');
  if (!emailLogsTb) return;
  
  emailLogsTb.innerHTML = logs.map(log => `
    <tr>
      <td>${log.sent_at ? new Date(log.sent_at).toLocaleString() : ''}</td>
      <td>${log.order_number || '-'}</td>
      <td>${log.recipient_email || ''}</td>
      <td>${log.email_type || ''}</td>
      <td>${log.subject || ''}</td>
      <td><span class="status-badge ${log.status === 'sent' ? 'status-completed' : 'status-cancelled'}">${log.status || 'failed'}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteEmailLog('${log.id}')" style="background: #dc3545;">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Delete Email Log
async function deleteEmailLog(logId) {
  if (!confirm('Are you sure you want to delete this email log? This cannot be undone.')) {
    return;
  }

  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('email_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;

    console.log('Email log deleted successfully');
    loadEmailLogs(); // Refresh the email logs list
  } catch (error) {
    console.error('Error deleting email log:', error);
    alert('Failed to delete email log: ' + error.message);
  }
}

// Email Sending
function openEmailModal() {
  console.log('Opening email modal, currentOrder:', currentOrder);
  if (!currentOrder) {
    console.error('No current order selected');
    return;
  }

  const emailMdl = document.getElementById('email-modal');
  const orderNumInput = document.getElementById('email-order-number');
  const recipientInput = document.getElementById('email-recipient');
  const emailTypeSelect = document.getElementById('email-type');
  const errorEl = document.getElementById('email-error');
  const successEl = document.getElementById('email-success');

  // Reset form
  if (orderNumInput) orderNumInput.value = currentOrder.order_number || '';
  if (recipientInput) recipientInput.value = currentOrder.customer_email || '';
  if (emailTypeSelect) emailTypeSelect.value = '';
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  // Reset all dynamic fields
  resetEmailFormFields();

  if (emailMdl) {
    emailMdl.classList.remove('hidden');
    console.log('Email modal opened');
  } else {
    console.error('Email modal element not found');
  }
}

function resetEmailFormFields() {
  const trackingGroup = document.getElementById('tracking-group');
  const reasonGroup = document.getElementById('reason-group');
  const customMessageGroup = document.getElementById('custom-message-group');
  const previewBox = document.getElementById('email-preview');
  const statusSelect = document.getElementById('email-status');
  const trackingInput = document.getElementById('email-tracking');
  const messageInput = document.getElementById('email-message');
  const reasonSelect = document.getElementById('email-reason');

  if (trackingGroup) trackingGroup.classList.add('hidden');
  if (reasonGroup) reasonGroup.classList.add('hidden');
  if (customMessageGroup) customMessageGroup.classList.add('hidden');
  if (statusSelect) statusSelect.value = '';
  if (trackingInput) trackingInput.value = '';
  if (messageInput) messageInput.value = '';
  if (reasonSelect) reasonSelect.innerHTML = '';
  if (previewBox) previewBox.innerHTML = '<em style="color: #8b9cb5;">Select an email type to see preview...</em>';
}

function handleEmailTypeChange(e) {
  const emailType = e.target.value;
  const template = EMAIL_TEMPLATES[emailType];
  
  if (!template) {
    resetEmailFormFields();
    return;
  }

  const trackingGroup = document.getElementById('tracking-group');
  const reasonGroup = document.getElementById('reason-group');
  const reasonLabel = document.getElementById('reason-label');
  const reasonSelect = document.getElementById('email-reason');
  const customMessageGroup = document.getElementById('custom-message-group');
  const statusSelect = document.getElementById('email-status');
  const previewBox = document.getElementById('email-preview');

  // Show/hide fields based on email type
  if (trackingGroup) {
    trackingGroup.classList.toggle('hidden', !template.requiresTracking);
  }
  if (reasonGroup) {
    reasonGroup.classList.toggle('hidden', !template.showReason);
  }
  if (customMessageGroup) {
    customMessageGroup.classList.toggle('hidden', !template.showCustomMessage);
  }

  // Populate reason dropdown if needed
  if (template.showReason && reasonSelect && template.reasonType) {
    const reasons = REASONS[template.reasonType] || {};
    reasonSelect.innerHTML = Object.entries(reasons).map(([key, value]) => 
      `<option value="${key}">${value}</option>`
    ).join('');
    
    // Update label based on type
    if (reasonLabel) {
      const labels = {
        delay: 'Delay Reason',
        cancellation: 'Cancellation Reason',
        refund: 'Refund Reason'
      };
      reasonLabel.textContent = labels[template.reasonType] || 'Reason';
    }
  }

  // Auto-set status if defined
  if (statusSelect && template.status) {
    statusSelect.value = template.status;
  }

  // Update preview
  updateEmailPreview();
}

function updateEmailPreview() {
  const emailType = document.getElementById('email-type')?.value;
  const orderNumber = document.getElementById('email-order-number')?.value;
  const trackingNumber = document.getElementById('email-tracking')?.value;
  const reason = document.getElementById('email-reason')?.value;
  const customMessage = document.getElementById('email-message')?.value;
  const previewBox = document.getElementById('email-preview');

  if (!previewBox || !emailType) return;

  const template = EMAIL_TEMPLATES[emailType];
  if (!template) return;

  // Get reason text
  let reasonText = '';
  if (template.reasonType && reason) {
    reasonText = REASONS[template.reasonType]?.[reason] || reason;
  }

  const data = {
    orderNumber,
    trackingNumber,
    reason: reasonText,
    customMessage
  };

  previewBox.innerHTML = template.preview(data);
}

async function handleSendEmail(e) {
  e.preventDefault();
  
  console.log('handleSendEmail called, currentOrder:', currentOrder);
  
  const emailType = document.getElementById('email-type')?.value;
  if (!emailType) {
    const errorEl = document.getElementById('email-error');
    if (errorEl) {
      errorEl.textContent = 'Please select an email type';
      errorEl.style.display = 'block';
    }
    return;
  }

  const template = EMAIL_TEMPLATES[emailType];
  
  // Validate required fields
  if (template.requiresTracking) {
    const trackingNumber = document.getElementById('email-tracking')?.value?.trim();
    if (!trackingNumber) {
      const errorEl = document.getElementById('email-error');
      if (errorEl) {
        errorEl.textContent = 'Tracking number is required for shipped orders';
        errorEl.style.display = 'block';
      }
      return;
    }
  }

  if (template.showCustomMessage) {
    const customMessage = document.getElementById('email-message')?.value?.trim();
    if (!customMessage) {
      const errorEl = document.getElementById('email-error');
      if (errorEl) {
        errorEl.textContent = 'Please enter a custom message';
        errorEl.style.display = 'block';
      }
      return;
    }
  }

  const orderNumber = document.getElementById('email-order-number')?.value || '';
  const recipient = document.getElementById('email-recipient')?.value || '';
  const status = document.getElementById('email-status')?.value || '';
  const trackingNumber = document.getElementById('email-tracking')?.value?.trim() || '';
  const message = document.getElementById('email-message')?.value?.trim() || '';
  const reason = document.getElementById('email-reason')?.value || '';

  console.log('Sending email:', { emailType, orderNumber, recipient, status, trackingNumber: trackingNumber ? 'yes' : 'no', message: message ? 'yes' : 'no' });

  const errorEl = document.getElementById('email-error');
  const successEl = document.getElementById('email-success');

  try {
    // Update order status if changed
    if (status && currentOrder && currentOrder.status !== status) {
      console.log('Updating order status to:', status);
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ 
          status: status,
          tracking_number: trackingNumber || currentOrder.tracking_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }
      console.log('Order status updated successfully');
    }

    // Get reason text if applicable
    let reasonText = '';
    if (template.reasonType && reason) {
      reasonText = REASONS[template.reasonType]?.[reason] || reason;
    }

    // Build email data
    const emailData = {
      email: recipient,
      orderNumber: orderNumber,
      status: status || currentOrder?.status,
      trackingNumber: trackingNumber,
      emailType: emailType
    };

    // Add custom message or reason-based message
    if (emailType === 'custom') {
      emailData.customMessage = message;
    } else if (template.reasonType && reasonText) {
      const reasonMessages = {
        order_delayed: `We apologize for the delay. Your order is delayed due to ${reasonText}.`,
        order_cancelled: `Your order has been cancelled. Reason: ${reasonText}.`,
        order_refunded: `A refund has been processed for your order. Reason: ${reasonText}. Please allow 3-5 business days for the funds to appear in your account.`
      };
      emailData.message = reasonMessages[emailType] || '';
    }

    // Send email via API
    console.log('Calling send-status-email API with data:', emailData);
    const response = await fetch('/api/send-status-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    console.log('API response:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    // Log email to database
    console.log('Logging email to database...');
    const { error: logError } = await supabaseClient.from('email_logs').insert({
      order_id: currentOrder?.id,
      order_number: orderNumber,
      recipient_email: recipient,
      email_type: emailType,
      subject: template.subject.replace('{orderNumber}', orderNumber),
      status: 'sent',
      resend_email_id: result.emailId,
      sent_at: new Date().toISOString()
    });

    if (logError) {
      console.error('Error logging email:', logError);
      // Don't throw - email was sent successfully
    } else {
      console.log('Email logged successfully');
    }

    if (successEl) {
      successEl.textContent = 'Email sent successfully!';
      successEl.style.display = 'block';
    }
    if (errorEl) errorEl.style.display = 'none';

    setTimeout(() => {
      closeModals();
      loadOrders();
    }, 1500);

  } catch (error) {
    console.error('Error sending email:', error);
    if (errorEl) {
      errorEl.textContent = error.message || 'Failed to send email';
      errorEl.style.display = 'block';
    }
    if (successEl) successEl.style.display = 'none';

    // Log failed email attempt
    await supabaseClient.from('email_logs').insert({
      order_id: currentOrder?.id,
      order_number: orderNumber,
      recipient_email: recipient,
      email_type: emailType || 'unknown',
      subject: template?.subject?.replace('{orderNumber}', orderNumber) || 'Unknown',
      status: 'failed',
      error_message: error.message,
      sent_at: new Date().toISOString()
    });
  }
}

function closeModals() {
  const orderMdl = document.getElementById('order-modal');
  const emailMdl = document.getElementById('email-modal');
  if (orderMdl) orderMdl.classList.add('hidden');
  if (emailMdl) emailMdl.classList.add('hidden');
  currentOrder = null;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose functions to window for onclick handlers
window.viewOrder = viewOrder;
window.deleteOrder = deleteOrder;
window.deleteEmailLog = deleteEmailLog;
window.permanentlyDeleteOrder = permanentlyDeleteOrder;
window.loadOrdersByStatus = loadOrdersByStatus;
window.loadDeletedEmails = loadDeletedEmails;
window.permanentlyDeleteEmail = permanentlyDeleteEmail;
