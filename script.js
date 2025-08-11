// Sample product data
const products = [
    { id: 1, name: "Wireless Headphones Pro", category: "Audio", price: 299.99, icon: "🎧" },
    { id: 2, name: "Smart Watch Ultra", category: "Wearables", price: 399.99, icon: "⌚" },
    { id: 3, name: "Gaming Laptop X1", category: "Computers", price: 1299.99, icon: "💻" },
    { id: 4, name: "Wireless Mouse Elite", category: "Accessories", price: 79.99, icon: "🖱️" },
    { id: 5, name: "4K Monitor Pro", category: "Monitors", price: 549.99, icon: "🖥️" },
    { id: 6, name: "Mechanical Keyboard", category: "Accessories", price: 149.99, icon: "⌨️" },
    { id: 7, name: "Smartphone Max", category: "Mobile", price: 899.99, icon: "📱" },
    { id: 8, name: "Tablet Pro 12", category: "Mobile", price: 699.99, icon: "📲" },
    { id: 9, name: "Wireless Earbuds", category: "Audio", price: 199.99, icon: "🎵" },
    { id: 10, name: "Gaming Chair Pro", category: "Furniture", price: 449.99, icon: "💺" },
    { id: 11, name: "USB-C Hub", category: "Accessories", price: 89.99, icon: "🔌" },
    { id: 12, name: "External SSD 1TB", category: "Storage", price: 179.99, icon: "💾" }
];

// App state
let cart = [];
let filteredProducts = [...products];
let currentSection = 'products';

// Initialize cart from localStorage with error handling
try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (error) {
    console.log('LocalStorage not available, using memory storage');
    cart = [];
}

// DOM elements
const elements = {
    productsGrid: document.getElementById('productsGrid'),
    cartIcon: document.getElementById('cartIcon'),
    cartCount: document.getElementById('cartCount'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    overlay: document.getElementById('overlay'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    minPrice: document.getElementById('minPrice'),
    maxPrice: document.getElementById('maxPrice'),
    sidebarCategories: document.getElementById('sidebarCategories'),
    themeToggle: document.getElementById('themeToggle'),
    checkoutSection: document.getElementById('checkoutSection'),
    orderSummary: document.getElementById('orderSummary'),
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText'),
    successMessage: document.getElementById('successMessage')
};

// Initialize app
function init() {
    renderProducts();
    renderCategories();
    updateCartUI();
    setupEventListeners();
    updateCartCount();
}

// Render products
function renderProducts() {
    if (filteredProducts.length === 0) {
        elements.productsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    elements.productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.icon}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Render categories
function renderCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    
    // Populate filter dropdown
    elements.categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    // Populate sidebar categories
    elements.sidebarCategories.innerHTML = 
        '<button class="category-item active" onclick="filterByCategory(\'\')">All Products</button>' +
        categories.map(cat => 
            `<button class="category-item" onclick="filterByCategory('${cat}')">${cat}</button>`
        ).join('');
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    updateCartCount();
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    updateCartCount();
}

// Update cart UI
function updateCartUI() {
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="empty-state">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
            </div>
        `;
        elements.cartTotal.textContent = 'Total: $0.00';
        return;
    }

    elements.cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    elements.cartTotal.textContent = `Total: ${total.toFixed(2)}`;
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = count;
    elements.cartCount.style.display = count > 0 ? 'flex' : 'none';
}

// Save cart to localStorage with error handling
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.log('LocalStorage not available, using memory storage');
    }
}

// Filter products
function filterProducts() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const selectedCategory = elements.categoryFilter.value;
    const minPrice = parseFloat(elements.minPrice.value) || 0;
    const maxPrice = parseFloat(elements.maxPrice.value) || Infinity;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    renderProducts();
}

// Filter by category (sidebar)
function filterByCategory(category) {
    elements.categoryFilter.value = category;
    
    // Update active category in sidebar
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    filterProducts();
}

// Toggle cart drawer
function toggleCart() {
    elements.cartDrawer.classList.toggle('open');
    elements.overlay.classList.toggle('active');
}

// Close cart drawer
function closeCart() {
    elements.cartDrawer.classList.remove('open');
    elements.overlay.classList.remove('active');
}

// Show checkout
function showCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    currentSection = 'checkout';
    elements.checkoutSection.classList.add('active');
    document.querySelector('.main-content').style.display = 'none';
    document.querySelector('.filters').style.display = 'none';
    closeCart();
    renderOrderSummary();
}

// Show products section
function showProducts() {
    currentSection = 'products';
    elements.checkoutSection.classList.remove('active');
    document.querySelector('.main-content').style.display = 'grid';
    document.querySelector('.filters').style.display = 'block';
}

// Render order summary
function renderOrderSummary() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    elements.orderSummary.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--accent-blue);">Order Summary</h3>
        ${cart.map(item => `
            <div class="order-item">
                <div>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Quantity: ${item.quantity}</div>
                </div>
                <div style="font-weight: 600; color: var(--accent-blue);">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('')}
        <div class="order-item order-total">
            <div>Total</div>
            <div>${total.toFixed(2)}</div>
        </div>
    `;
}

// Process payment (demo)
function processPayment() {
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Simulate payment processing
    elements.successMessage.classList.add('show');
    elements.overlay.classList.add('active');
    
    // Clear cart after successful order
    setTimeout(() => {
        clearCart();
    }, 1000);
}

// Close success message
function closeSuccessMessage() {
    elements.successMessage.classList.remove('show');
    elements.overlay.classList.remove('active');
    showProducts();
}

// Show notification
function showNotification(message) {
    elements.notificationText.textContent = message;
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.body.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.dataset.theme = newTheme;
    elements.themeToggle.textContent = newTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
    
    try {
        localStorage.setItem('theme', newTheme);
    } catch (error) {
        console.log('LocalStorage not available for theme storage');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Cart controls
    elements.cartIcon.addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('clearCart').addEventListener('click', clearCart);
    document.getElementById('proceedCheckout').addEventListener('click', showCheckout);
    
    // Checkout controls
    document.getElementById('backToShop').addEventListener('click', showProducts);
    document.getElementById('payButton').addEventListener('click', processPayment);
    
    // Search and filters
    elements.searchInput.addEventListener('input', filterProducts);
    elements.categoryFilter.addEventListener('change', filterProducts);
    elements.minPrice.addEventListener('input', filterProducts);
    elements.maxPrice.addEventListener('input', filterProducts);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Overlay click to close
    elements.overlay.addEventListener('click', () => {
        closeCart();
        if (elements.successMessage.classList.contains('show')) {
            closeSuccessMessage();
        }
    });

    // Load saved theme with error handling
    try {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.dataset.theme = savedTheme;
        elements.themeToggle.textContent = savedTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
    } catch (error) {
        console.log('LocalStorage not available, using default theme');
        document.body.dataset.theme = 'dark';
        elements.themeToggle.textContent = '🌙 Dark';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.filterByCategory = filterByCategory;
window.closeSuccessMessage = closeSuccessMessage;
window.showProducts = showProducts;