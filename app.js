// ===== STORAGE HELPERS =====
const KEYS = { games: 'yoloo_games', blogs: 'yoloo_blogs', products: 'yoloo_products' };

function getGames() {
    try { return JSON.parse(localStorage.getItem(KEYS.games)) || []; }
    catch { return []; }
}

function getBlogs() {
    try { return JSON.parse(localStorage.getItem(KEYS.blogs)) || []; }
    catch { return []; }
}

function saveGames(data) { localStorage.setItem(KEYS.games, JSON.stringify(data)); }
function saveBlogs(data) { localStorage.setItem(KEYS.blogs, JSON.stringify(data)); }

function addGame(game) {
    const games = getGames();
    game.id = Date.now();
    game.createdAt = new Date().toISOString();
    games.unshift(game);
    saveGames(games);
    return game;
}

function addBlog(blog) {
    const blogs = getBlogs();
    blog.id = Date.now();
    blog.createdAt = new Date().toISOString();
    blogs.unshift(blog);
    saveBlogs(blogs);
    return blog;
}

function deleteGame(id) { saveGames(getGames().filter(g => g.id !== id)); }
function deleteBlog(id) { saveBlogs(getBlogs().filter(b => b.id !== id)); }

// ===== DATE FORMATTER =====
function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ===== TOAST =====
function showToast(msg, isError = false) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => toast.classList.remove('toast-show'), 3000);
}

// ===== MODAL HELPERS =====
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    const form = document.querySelector('#' + id + ' form');
    if (form) form.reset();
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('yl-modal-overlay')) {
        e.target.classList.remove('active');
        const form = e.target.querySelector('form');
        if (form) form.reset();
    }
});

// ===== ESCAPE HTML =====
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ===== GAME CARD RENDERER (Yoloo style: blog-preview-card layout) =====
function renderGameCard(game, showDelete = false) {
    const imgHtml = game.image
        ? `<img src="${escHtml(game.image)}" alt="${escHtml(game.title)}" onerror="this.style.display='none'">`
        : `<div class="yl-card-placeholder">🎮</div>`;

    const deleteBtn = showDelete
        ? `<button class="yl-delete-btn" onclick="handleDeleteGame(${game.id})">🗑 Hapus</button>`
        : '';

    return `
    <div class="blog-preview-card" data-id="${game.id}" style="cursor:default;">
        <div class="blog-preview-image">
            ${imgHtml}
        </div>
        <div class="blog-preview-content">
            <span class="yl-genre-tag">${escHtml(game.genre)}</span>
            <h3>${escHtml(game.title)}</h3>
            <p>${escHtml(game.synopsis)}</p>
            ${deleteBtn}
        </div>
    </div>`;
}

// ===== BLOG CARD RENDERER (Yoloo style: blog-preview-card layout) =====
function renderBlogCard(blog, showDelete = false) {
    const imgHtml = blog.image
        ? `<img src="${escHtml(blog.image)}" alt="${escHtml(blog.title)}" onerror="this.style.display='none'">`
        : `<div class="yl-card-placeholder">📝</div>`;

    const deleteBtn = showDelete
        ? `<button class="yl-delete-btn" onclick="handleDeleteBlog(${blog.id})">🗑 Hapus</button>`
        : '';

    return `
    <div class="blog-preview-card" data-id="${blog.id}" style="cursor:default;">
        <div class="blog-preview-image">
            ${imgHtml}
        </div>
        <div class="blog-preview-content">
            <div class="yl-date-tag">${formatDate(blog.createdAt)}</div>
            <h3>${escHtml(blog.title)}</h3>
            <p>${escHtml(blog.content)}</p>
            ${deleteBtn}
        </div>
    </div>`;
}

// ===== EMPTY STATE =====
function emptyState(icon, msg) {
    return `<div class="yl-empty-state"><div>${icon}</div><p>${msg}</p></div>`;
}

// ===== INDEX PAGE =====
function initIndex() {
    renderIndexGamesShowcase();
    renderIndexBlogs();
}

function renderIndexGamesShowcase() {
    const track = document.getElementById('gamesTrack');
    const emptyEl = document.getElementById('gamesShowcaseEmpty');
    if (!track) return;
    const games = getGames().slice(0, 5);
    if (games.length === 0) {
        track.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    track.innerHTML = games.map((g, i) => {
        const imgHtml = g.image
            ? `<img src="${escHtml(g.image)}" alt="${escHtml(g.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : '';
        const placeholder = `<div class="game-showcase-placeholder" ${g.image ? 'style="display:none"' : ''}>\uD83C\uDFAE</div>`;
        return `
        <div class="game-showcase-item${i === 0 ? ' active-game' : ''}" data-index="${i}">
            <div class="game-showcase-img-wrap">
                ${imgHtml}${placeholder}
            </div>
            <div class="game-showcase-info">
                <span class="yl-genre-tag">${escHtml(g.genre)}</span>
                <h3>${escHtml(g.title)}</h3>
                <p>${escHtml(g.synopsis)}</p>
            </div>
        </div>`;
    }).join('');
    if (typeof updateGames === 'function') {
        gameActive = 0;
        updateGames();
    }
}

function renderIndexBlogs() {
    const container = document.getElementById('indexBlogs');
    if (!container) return;
    const blogs = getBlogs().slice(0, 3);
    if (blogs.length === 0) {
        container.innerHTML = emptyState('📝', 'Belum ada artikel. Tambahkan melalui halaman Blog!');
        return;
    }
    container.innerHTML = blogs.map(b => renderBlogCard(b, false)).join('');
}

// ===== GAME PAGE =====
function initGame() {
    renderAllGames();

    const form = document.getElementById('addGameForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const game = {
                title: this.gameTitle.value.trim(),
                genre: this.gameGenre.value.trim(),
                synopsis: this.gameSynopsis.value.trim(),
                image: this.gameImage.value.trim(),
            };
            if (!game.title || !game.genre || !game.synopsis) {
                showToast('Harap isi semua field wajib!', true); return;
            }
            addGame(game);
            closeModal('gameModal');
            renderAllGames();
            showToast('✅ Game berhasil ditambahkan!');
        });
    }
}

function renderAllGames() {
    const container = document.getElementById('allGames');
    if (!container) return;
    const games = getGames();
    const count = document.getElementById('gameCount');
    if (count) count.textContent = games.length + ' game';
    if (games.length === 0) {
        container.innerHTML = emptyState('🎮', 'Belum ada game. Klik tombol di atas untuk menambahkan!');
        return;
    }
    container.innerHTML = games.map(g => renderGameCard(g, true)).join('');
}

function handleDeleteGame(id) {
    if (!confirm('Hapus game ini?')) return;
    deleteGame(id);
    renderAllGames();
    showToast('🗑 Game dihapus.');
}

// ===== BLOG PAGE =====
function initBlog() {
    renderAllBlogs();

    const form = document.getElementById('addBlogForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const blog = {
                title: this.blogTitle.value.trim(),
                content: this.blogContent.value.trim(),
                image: this.blogImage.value.trim(),
            };
            if (!blog.title || !blog.content) {
                showToast('Harap isi semua field wajib!', true); return;
            }
            addBlog(blog);
            closeModal('blogModal');
            renderAllBlogs();
            showToast('✅ Artikel berhasil ditambahkan!');
        });
    }
}

function renderAllBlogs() {
    const container = document.getElementById('allBlogs');
    if (!container) return;
    const blogs = getBlogs();
    const count = document.getElementById('blogCount');
    if (count) count.textContent = blogs.length + ' artikel';
    if (blogs.length === 0) {
        container.innerHTML = emptyState('📝', 'Belum ada artikel. Klik tombol di atas untuk menambahkan!');
        return;
    }
    container.innerHTML = blogs.map(b => renderBlogCard(b, true)).join('');
}

function handleDeleteBlog(id) {
    if (!confirm('Hapus artikel ini?')) return;
    deleteBlog(id);
    renderAllBlogs();
    showToast('🗑 Artikel dihapus.');
}

// ===== STORE STORAGE =====
const KEYS_STORE = 'yoloo_products';

function getProducts() {
    try { return JSON.parse(localStorage.getItem(KEYS_STORE)) || []; }
    catch { return []; }
}

function saveProducts(data) { localStorage.setItem(KEYS_STORE, JSON.stringify(data)); }

function addProduct(product) {
    const products = getProducts();
    product.id = Date.now();
    product.createdAt = new Date().toISOString();
    products.unshift(product);
    saveProducts(products);
    return product;
}

function deleteProduct(id) { saveProducts(getProducts().filter(p => p.id !== id)); }

// ===== PRICE FORMATTER =====
function formatPrice(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// ===== PRODUCT CARD RENDERER =====
function renderProductCard(product, showDelete = false) {
    const imgHtml = product.image
        ? `<img src="${escHtml(product.image)}" alt="${escHtml(product.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
    const placeholder = `<div class="store-card-placeholder" ${product.image ? 'style="display:none"' : ''}>🛒</div>`;

    const categoryTag = product.category
        ? `<span class="yl-genre-tag">${escHtml(product.category)}</span>`
        : '';

    const deleteBtn = showDelete
        ? `<button class="yl-delete-btn" onclick="handleDeleteProduct(${product.id})">🗑 Hapus</button>`
        : '';

    return `
    <div class="store-card" data-id="${product.id}">
        <div class="store-card-image">
            ${imgHtml}${placeholder}
        </div>
        <div class="store-card-body">
            ${categoryTag}
            <h3 class="store-card-name">${escHtml(product.name)}</h3>
            ${product.desc ? `<p class="store-card-desc">${escHtml(product.desc)}</p>` : ''}
            <div class="store-card-price">${formatPrice(product.price)}</div>
            <div class="store-card-actions">
                <a href="${escHtml(product.marketplace)}" target="_blank" rel="noopener" class="store-order-btn">🛍 Pesan Sekarang</a>
                ${deleteBtn}
            </div>
        </div>
    </div>`;
}

// ===== STORE PAGE =====
function initStore() {
    renderAllProducts();

    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const product = {
                name:        this.productName.value.trim(),
                price:       this.productPrice.value.trim(),
                category:    this.productCategory.value.trim(),
                desc:        this.productDesc.value.trim(),
                image:       this.productImage.value.trim(),
                marketplace: this.productMarketplace.value.trim(),
            };
            if (!product.name || !product.price || !product.marketplace) {
                showToast('Harap isi nama, harga, dan link marketplace!', true); return;
            }
            addProduct(product);
            closeModal('storeModal');
            renderAllProducts();
            showToast('✅ Produk berhasil ditambahkan!');
        });
    }
}

function renderAllProducts() {
    const container = document.getElementById('allProducts');
    if (!container) return;
    const products = getProducts();
    const count = document.getElementById('storeCount');
    if (count) count.textContent = products.length + ' produk';
    if (products.length === 0) {
        container.innerHTML = emptyState('🛒', 'Belum ada produk. Klik tombol di atas untuk menambahkan!');
        return;
    }
    container.innerHTML = products.map(p => renderProductCard(p, true)).join('');
}

function handleDeleteProduct(id) {
    if (!confirm('Hapus produk ini?')) return;
    deleteProduct(id);
    renderAllProducts();
    showToast('🗑 Produk dihapus.');
}
