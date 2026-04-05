
    // ----- NAVBAR SCROLL -----
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // ----- MOBILE MENU -----
    function toggleMobile() {
      document.getElementById('hamburger').classList.toggle('open');
      document.getElementById('mobileMenu').classList.toggle('open');
    }
    function closeMobile() {
      document.getElementById('hamburger').classList.remove('open');
      document.getElementById('mobileMenu').classList.remove('open');
    }

    // ----- SCROLL REVEAL -----
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ----- NEWSLETTER -----
    function subscribeNewsletter() {
      const email = document.getElementById('nlEmail').value.trim();
      const msg = document.getElementById('nlMsg');
      if (!email || !email.includes('@')) {
        document.getElementById('nlEmail').style.borderColor = 'var(--orange)';
        return;
      }
      document.getElementById('nlEmail').value = '';
      document.getElementById('nlEmail').style.borderColor = '';
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 4000);
    }

    // Enter key for newsletter
    document.getElementById('nlEmail').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') subscribeNewsletter();
    });

    // ----- SMOOTH ANCHOR SCROLL -----
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    /* ================================================================
       ADMIN DASHBOARD — Full System
    ================================================================ */

    const ADMIN_PASS = 'chuzenlubes36';
    const LS_PRODUCTS = 'cl_products';
    const LS_ORDERS   = 'cl_orders';
    const LS_CONTACT  = 'cl_contact';

    // ---- Login ----
    function openAdminLogin() {
      document.getElementById('adminLoginOverlay').classList.add('active');
      document.getElementById('adminPassInput').value = '';
      document.getElementById('adminLoginError').style.display = 'none';
      setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
    }
    function closeAdminLogin() {
      document.getElementById('adminLoginOverlay').classList.remove('active');
    }
    function checkAdminPass() {
      const val = document.getElementById('adminPassInput').value;
      if (val === ADMIN_PASS) {
        closeAdminLogin();
        openAdminDashboard();
      } else {
        document.getElementById('adminLoginError').style.display = 'block';
        document.getElementById('adminPassInput').value = '';
        document.getElementById('adminPassInput').focus();
      }
    }
    document.getElementById('adminPassInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAdminPass();
    });

    // ---- Dashboard open/close ----
    function openAdminDashboard() {
      document.getElementById('adminDashboard').classList.add('active');
      document.body.style.overflow = 'hidden';
      refreshDashboard();
      renderProductsTable();
      renderOrdersTable();
      loadContactFieldsFromStorage();
    }
    function adminLogout() {
      document.getElementById('adminDashboard').classList.remove('active');
      document.body.style.overflow = '';
      admShowPanel('dash');
      showToast('Logged out successfully.', 'default');
    }

    // ---- Panel navigation ----
    function admShowPanel(name) {
      document.querySelectorAll('.adm-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.adm-nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('panel-' + name).classList.add('active');
      const items = document.querySelectorAll('.adm-nav-item');
      const map = { dash:'Dashboard', addProduct:'Add Product', manageProducts:'Manage Products', orders:'View Orders', contact:'Contact Info' };
      items.forEach(item => {
        if (item.textContent.trim().startsWith(map[name] ? map[name].slice(0,5) : '!!!')) item.classList.add('active');
      });
      // re-activate by onclick match
      items.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'"+name+"'")) {
          item.classList.add('active');
        }
      });
      if (name === 'manageProducts') renderProductsTable();
      if (name === 'orders') renderOrdersTable();
      if (name === 'dash') refreshDashboard();
    }

    // ---- Toast ----
    let toastTimer;
    function showToast(msg, type='default') {
      const t = document.getElementById('adminToast');
      t.textContent = msg;
      t.className = type;
      t.style.display = 'block';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    /* ----------- PRODUCTS ----------- */
    function getProducts() {
      return JSON.parse(localStorage.getItem(LS_PRODUCTS) || '[]');
    }
    function saveProducts(arr) {
      localStorage.setItem(LS_PRODUCTS, JSON.stringify(arr));
    }

    function previewImg(url) {
      const img = document.getElementById('imgPreview');
      if (url && url.startsWith('http')) {
        img.src = url;
        img.style.display = 'block';
        img.onerror = () => { img.style.display = 'none'; };
      } else {
        img.style.display = 'none';
      }
    }

    function addProduct() {
      const name  = document.getElementById('newProdName').value.trim();
      const price = document.getElementById('newProdPrice').value.trim();
      const img   = document.getElementById('newProdImg').value.trim();
      const desc  = document.getElementById('newProdDesc').value.trim();
      const type  = document.getElementById('newProdType').value;
      if (!name || !price) { showToast('⚠ Name and price are required.', 'error'); return; }
      const products = getProducts();
      const newProd = { id: Date.now(), name, price: Number(price), img, desc, type };
      products.push(newProd);
      saveProducts(products);
      renderWebsiteProducts();
      clearProductForm();
      showToast('✓ Product added successfully!', 'success');
      refreshDashboard();
    }

    function clearProductForm() {
      ['newProdName','newProdPrice','newProdImg','newProdDesc'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('newProdType').value = 'product';
      document.getElementById('imgPreview').style.display = 'none';
    }

    function renderProductsTable() {
      const products = getProducts();
      const tbody = document.getElementById('productsTableBody');
      const empty = document.getElementById('productsEmptyState');
      if (!products.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      empty.style.display = 'none';
      tbody.innerHTML = products.map((p, i) => `
        <tr id="prodrow-${p.id}">
          <td>
            ${p.img ? `<img class="prod-thumb" src="${p.img}" alt="" onerror="this.style.display='none'" />` : `<div style="width:44px;height:44px;background:#1a3a5c;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🛢</div>`}
          </td>
          <td style="font-weight:600;">${escHtml(p.name)}</td>
          <td><span class="adm-badge ${p.type==='service'?'adm-badge-blue':'adm-badge-yellow'}">${p.type}</span></td>
          <td id="price-cell-${p.id}">TSh ${Number(p.price).toLocaleString()}</td>
          <td style="display:flex;gap:0.4rem;flex-wrap:wrap;padding-top:0.85rem;">
            <button class="adm-action-btn adm-action-edit" onclick="editProdPrice(${p.id})">Edit Price</button>
            <button class="adm-action-btn adm-action-del" onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    function editProdPrice(id) {
      const cell = document.getElementById('price-cell-'+id);
      const products = getProducts();
      const prod = products.find(p => p.id === id);
      cell.innerHTML = `
        <input class="adm-inline-input" type="number" id="priceInput-${id}" value="${prod.price}" min="0" style="width:100px;" />
        <button class="adm-action-btn adm-action-save" style="margin-left:4px;" onclick="saveProdPrice(${id})">Save</button>
      `;
      document.getElementById('priceInput-'+id).focus();
    }

    function saveProdPrice(id) {
      const newPrice = Number(document.getElementById('priceInput-'+id).value);
      if (isNaN(newPrice) || newPrice < 0) { showToast('⚠ Invalid price.', 'error'); return; }
      const products = getProducts();
      const idx = products.findIndex(p => p.id === id);
      products[idx].price = newPrice;
      saveProducts(products);
      renderProductsTable();
      renderWebsiteProducts();
      showToast('✓ Price updated!', 'success');
      refreshDashboard();
    }

    function deleteProduct(id) {
      if (!confirm('Delete this product? This cannot be undone.')) return;
      let products = getProducts();
      products = products.filter(p => p.id !== id);
      saveProducts(products);
      renderProductsTable();
      renderWebsiteProducts();
      showToast('Product deleted.', 'default');
      refreshDashboard();
    }

    /* --- Render admin products dynamically into website grid --- */
    function renderWebsiteProducts() {
      const products = getProducts();
      const grid = document.getElementById('adminProductsGrid');
      if (!grid) return;
      if (!products.length) { grid.innerHTML = ''; return; }
      grid.innerHTML = products.map(p => `
        <div class="product-card reveal visible">
          <div class="card-icon" style="background:linear-gradient(135deg,rgba(10,22,40,0.8),rgba(26,58,92,0.6));">
            <div class="card-icon-bg"></div>
            ${p.img
              ? `<img src="${escHtml(p.img)}" alt="${escHtml(p.name)}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;" onerror="this.style.display='none'" />`
              : `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:80px;"><rect x="28" y="8" width="24" height="8" rx="4" fill="#f97316"/><rect x="24" y="14" width="32" height="52" rx="8" fill="#1e4976" stroke="#f97316" stroke-width="2"/><circle cx="40" cy="56" r="4" fill="#f97316"/></svg>`
            }
          </div>
          <span class="card-tag ${p.type==='service'?'tag-service':'tag-product'}">${p.type}</span>
          <div class="card-body">
            <div class="card-title">${escHtml(p.name)}</div>
            <div class="card-desc">${escHtml(p.desc || 'Quality product available at Chuzen Lubes.')}</div>
            <div class="card-footer">
              <div class="card-price">TSh ${Number(p.price).toLocaleString()}</div>
              <a href="https://wa.me/${getContact().whatsapp||'255783623842'}" target="_blank" class="card-action">
                Order Now
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
              </a>
            </div>
          </div>
        </div>
      `).join('');
    }

    /* ----------- ORDERS ----------- */
    function getOrders() {
      return JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    }
    function saveOrders(arr) {
      localStorage.setItem(LS_ORDERS, JSON.stringify(arr));
    }

    function addOrder() {
      const customer = document.getElementById('orderCustomer').value.trim();
      const phone    = document.getElementById('orderPhone').value.trim();
      const product  = document.getElementById('orderProduct').value.trim();
      const amount   = document.getElementById('orderAmount').value.trim();
      const status   = document.getElementById('orderStatus').value;
      const notes    = document.getElementById('orderNotes').value.trim();
      if (!customer || !product || !amount) { showToast('⚠ Customer, product and amount are required.', 'error'); return; }
      const orders = getOrders();
      orders.unshift({
        id: Date.now(),
        customer, phone, product,
        amount: Number(amount),
        status, notes,
        date: new Date().toLocaleDateString('en-GB')
      });
      saveOrders(orders);
      renderOrdersTable();
      clearOrderForm();
      showToast('✓ Order added!', 'success');
      refreshDashboard();
    }

    function clearOrderForm() {
      ['orderCustomer','orderPhone','orderProduct','orderAmount','orderNotes'].forEach(id => document.getElementById(id).value='');
      document.getElementById('orderStatus').value = 'pending';
    }

    const statusColors = { pending:'adm-badge-yellow', confirmed:'adm-badge-blue', completed:'adm-badge-green', cancelled:'adm-badge-red' };

    function renderOrdersTable() {
      const orders = getOrders();
      const tbody = document.getElementById('ordersTableBody');
      const empty = document.getElementById('ordersEmptyState');
      // also update recent orders on dash
      const recentBody = document.getElementById('recentOrdersBody');
      if (!orders.length) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        recentBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#b0bec5;padding:1.5rem;">No orders yet.</td></tr>`;
        return;
      }
      empty.style.display = 'none';
      tbody.innerHTML = orders.map((o, i) => `
        <tr>
          <td style="color:#b0bec5;">#${orders.length - i}</td>
          <td style="font-weight:600;">${escHtml(o.customer)}</td>
          <td>${escHtml(o.phone||'-')}</td>
          <td>${escHtml(o.product)}</td>
          <td>TSh ${Number(o.amount).toLocaleString()}</td>
          <td>
            <select class="adm-inline-input" style="width:120px;padding:0.25rem 0.4rem;" onchange="updateOrderStatus(${o.id}, this.value)">
              ${['pending','confirmed','completed','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
            </select>
          </td>
          <td style="color:#b0bec5;white-space:nowrap;">${o.date}</td>
          <td>
            <button class="adm-action-btn adm-action-del" onclick="deleteOrder(${o.id})">Delete</button>
          </td>
        </tr>
      `).join('');

      // Recent orders (first 5)
      recentBody.innerHTML = orders.slice(0,5).map((o,i) => `
        <tr>
          <td style="color:#b0bec5;">#${orders.length - i}</td>
          <td style="font-weight:600;">${escHtml(o.customer)}</td>
          <td>${escHtml(o.product)}</td>
          <td>TSh ${Number(o.amount).toLocaleString()}</td>
          <td><span class="adm-badge ${statusColors[o.status]||'adm-badge-yellow'}">${o.status}</span></td>
          <td style="color:#b0bec5;">${o.date}</td>
        </tr>
      `).join('');
    }

    function updateOrderStatus(id, newStatus) {
      const orders = getOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx !== -1) { orders[idx].status = newStatus; saveOrders(orders); }
      showToast('✓ Status updated.', 'success');
      refreshDashboard();
    }

    function deleteOrder(id) {
      if (!confirm('Delete this order?')) return;
      saveOrders(getOrders().filter(o => o.id !== id));
      renderOrdersTable();
      showToast('Order deleted.', 'default');
      refreshDashboard();
    }

    /* ----------- CONTACT INFO ----------- */
    function getContact() {
      return JSON.parse(localStorage.getItem(LS_CONTACT) || JSON.stringify({
        phone1:'0783 623 842', phone2:'0741 476 594',
        whatsapp:'255783623842', locations:'Mwanza, Sahara, Mitimirefu',
        facebook:'#', instagram:'#'
      }));
    }
    function saveContact(obj) { localStorage.setItem(LS_CONTACT, JSON.stringify(obj)); }

    function loadContactFieldsFromStorage() {
      const c = getContact();
      document.getElementById('ci_phone1').value    = c.phone1    || '';
      document.getElementById('ci_phone2').value    = c.phone2    || '';
      document.getElementById('ci_whatsapp').value  = c.whatsapp  || '';
      document.getElementById('ci_locations').value = c.locations || '';
      document.getElementById('ci_facebook').value  = c.facebook  || '';
      document.getElementById('ci_instagram').value = c.instagram || '';
      document.getElementById('contactSaveNote').style.display = 'none';
    }

    function saveContactInfo() {
      const c = {
        phone1:    document.getElementById('ci_phone1').value.trim(),
        phone2:    document.getElementById('ci_phone2').value.trim(),
        whatsapp:  document.getElementById('ci_whatsapp').value.trim(),
        locations: document.getElementById('ci_locations').value.trim(),
        facebook:  document.getElementById('ci_facebook').value.trim(),
        instagram: document.getElementById('ci_instagram').value.trim(),
      };
      saveContact(c);
      applyContactToWebsite(c);
      document.getElementById('contactSaveNote').style.display = 'block';
      showToast('✓ Contact info saved and applied!', 'success');
    }

    function applyContactToWebsite(c) {
      // Phone numbers in contact cards
      const phoneCards = document.querySelectorAll('.contact-card-value');
      phoneCards.forEach(el => {
        if (el.querySelector('a[href^="tel"]')) {
          el.innerHTML = `<a href="tel:+${c.whatsapp}">${escHtml(c.phone1)}</a> &nbsp;·&nbsp; <a href="tel:+${c.whatsapp}">${escHtml(c.phone2)}</a>`;
        }
      });

      // Footer contact items
      const footerItems = document.querySelectorAll('.footer-contact-item');
      if (footerItems[0]) footerItems[0].lastChild.textContent = ' ' + c.phone1;
      if (footerItems[1]) footerItems[1].lastChild.textContent = ' ' + c.phone2;
      if (footerItems[2]) footerItems[2].lastChild.textContent = ' ' + c.locations;

      // WhatsApp links
      const waNum = c.whatsapp || '255783623842';
      document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        a.href = `https://wa.me/${waNum}`;
      });

      // // Social media
      // document.querySelectorAll('.social-link').forEach(a => {
      //   if (a.getAttribute('aria-label') === 'Facebook' && c.facebook) a.href = c.facebook;
      //   if (a.getAttribute('aria-label') === 'Instagram' && c.instagram) a.href = c.instagram;
      // });
    }

    /* ----------- DASHBOARD STATS ----------- */
    function refreshDashboard() {
      const products = getProducts();
      const orders   = getOrders();
      const newOrders = orders.filter(o => o.status === 'pending').length;
      const revenue   = orders.filter(o => o.status === 'completed').reduce((s,o) => s + Number(o.amount), 0);
      document.getElementById('statProducts').textContent = products.length;
      document.getElementById('statOrders').textContent   = orders.length;
      document.getElementById('statNewOrders').textContent = newOrders;
      document.getElementById('statRevenue').textContent  = 'TSh ' + revenue.toLocaleString();
    }

    /* ----------- HTML escape ----------- */
    function escHtml(str) {
      return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ----------- Seed demo orders if none ----------- */
    (function seedDemoData() {
      if (!localStorage.getItem(LS_ORDERS)) {
        const demo = [
          { id:1001, customer:'James Mwakasege', phone:'0712111222', product:'Engine Oil Change', amount:35000, status:'completed', notes:'', date:'02/04/2025' },
          { id:1002, customer:'Fatuma Ally',      phone:'0783456789', product:'Premium Engine Oil (5L)', amount:28000, status:'confirmed', notes:'Pick up today', date:'03/04/2025' },
          { id:1003, customer:'Peter Kyaruzi',    phone:'0754321098', product:'Filter Replacement', amount:15000, status:'pending', notes:'Needs air + oil filter', date:'04/04/2025' },
        ];
        saveOrders(demo);
      }
      // Apply saved contact on page load
      applyContactToWebsite(getContact());
      // Render any saved products
      renderWebsiteProducts();
    })();

  

//    Admin Products Grid injection target — placed at end of products section -->
  
    // Inject the admin products sub-grid below the hardcoded cards
    (function() {
      const grid = document.getElementById('adminProductsGrid');
      if (!grid) {
        // Create and inject the admin grid container after the products-grid
        const existing = document.querySelector('.products-grid');
        if (existing) {
          const adminDiv = document.createElement('div');
          adminDiv.id = 'adminProductsGrid';
          adminDiv.className = 'products-grid';
          adminDiv.style.marginTop = '1.5rem';
          existing.parentNode.insertBefore(adminDiv, existing.nextSibling);
          renderWebsiteProducts();
        }
      }
    })();