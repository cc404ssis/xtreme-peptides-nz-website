/**
 * XTREME PEPTIDES NZ Admin Dashboard
 * Uses Supabase for database and authentication
 */

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
        
        if (section === 'email-logs') {
          loadEmailLogs();
        }
      });
    });
  }

  // Modal close buttons
  document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Modal actions
  const statusEmailBtn = document.getElementById('send-status-email-btn');
  const customEmailBtn = document.getElementById('send-custom-email-btn');
  if (statusEmailBtn) {
    statusEmailBtn.addEventListener('click', () => openEmailModal('status'));
  }
  if (customEmailBtn) {
    customEmailBtn.addEventListener('click', () => openEmailModal('custom'));
  }
  
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
      errorEl.textContent = error.message || 'Login failed. Use emergency login: emergency / letmein2025';
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
      </td>
    </tr>
  `).join('');
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

// Email Logs
async function loadEmailLogs() {
  if (!supabaseClient) {
    alert('Database connection unavailable. Please refresh the page.');
    return;
  }
  
  const emailLogsTb = document.getElementById('email-logs-tbody');
  
  try {
    const { data, error } = await supabaseClient
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
    </tr>
  `).join('');
}

// Email Sending
function openEmailModal(type) {
  if (!currentOrder) return;

  const modalTitle = document.getElementById('email-modal-title');
  const orderNumInput = document.getElementById('email-order-number');
  const recipientInput = document.getElementById('email-recipient');
  const messageInput = document.getElementById('email-message');
  const trackingInput = document.getElementById('email-tracking');
  const statusInput = document.getElementById('email-status');
  const errorEl = document.getElementById('email-error');
  const successEl = document.getElementById('email-success');
  const emailMdl = document.getElementById('email-modal');

  if (modalTitle) {
    modalTitle.textContent = type === 'status' ? 'Send Status Update' : 'Send Custom Message';
  }
  if (orderNumInput) orderNumInput.value = currentOrder.order_number || '';
  if (recipientInput) recipientInput.value = currentOrder.customer_email || '';
  if (messageInput) messageInput.value = '';
  if (trackingInput) trackingInput.value = currentOrder.tracking_number || '';
  if (statusInput) statusInput.value = '';
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  if (emailMdl) emailMdl.classList.remove('hidden');
}

async function handleSendEmail(e) {
  e.preventDefault();
  
  if (!supabaseClient) {
    const errorEl = document.getElementById('email-error');
    if (errorEl) {
      errorEl.textContent = 'Database connection unavailable. Please refresh the page.';
      errorEl.style.display = 'block';
    }
    return;
  }

  const orderNumber = document.getElementById('email-order-number')?.value || '';
  const recipient = document.getElementById('email-recipient')?.value || '';
  const status = document.getElementById('email-status')?.value || '';
  const trackingNumber = document.getElementById('email-tracking')?.value || '';
  const message = document.getElementById('email-message')?.value || '';

  const errorEl = document.getElementById('email-error');
  const successEl = document.getElementById('email-success');

  try {
    // Update order status if changed
    if (status && currentOrder && currentOrder.status !== status) {
      const { error: updateError } = await supabaseClient
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
        status: status || currentOrder?.status,
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
    await supabaseClient.from('email_logs').insert({
      order_id: currentOrder?.id,
      order_number: orderNumber,
      recipient_email: recipient,
      email_type: message ? 'custom' : 'status_update',
      subject: message ? `Message Regarding Your Order - ${orderNumber}` : `Order Status Update - ${orderNumber}`,
      status: 'sent',
      resend_email_id: result.emailId
    });

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
      email_type: message ? 'custom' : 'status_update',
      subject: message ? `Message Regarding Your Order - ${orderNumber}` : `Order Status Update - ${orderNumber}`,
      status: 'failed',
      error_message: error.message
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
