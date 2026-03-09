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

// ===== INLINE IMAGE PICKER (for add forms) =====
// Stores pending base64 data per form
const _formImgPending = {};

function initFormImagePicker(formId, inputGroupId, fileInputId, dropzoneId, previewWrapperId, previewImgId, urlInputId, tabBtnFile, tabBtnUrl) {
    const fileInput = document.getElementById(fileInputId);
    const dropzone  = document.getElementById(dropzoneId);
    const urlInput  = document.getElementById(urlInputId);
    const previewWrap = document.getElementById(previewWrapperId);
    const previewImg  = document.getElementById(previewImgId);

    function setPreview(src) {
        _formImgPending[formId] = src;
        previewImg.src = src;
        previewWrap.style.display = 'block';
    }

    // Tab switching
    document.querySelectorAll(`#${inputGroupId} .fip-tab-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll(`#${inputGroupId} .fip-tab-btn`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll(`#${inputGroupId} .fip-panel`).forEach(p => p.classList.remove('active'));
            document.getElementById(btn.dataset.panel).classList.add('active');
        });
    });

    // File input
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = e => setPreview(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    // Drag & drop
    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput && fileInput.click());
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('fip-drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('fip-drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault(); dropzone.classList.remove('fip-drag-over');
            const file = e.dataTransfer.files[0];
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = ev => setPreview(ev.target.result);
            reader.readAsDataURL(file);
        });
    }

    // URL input with debounce
    if (urlInput) {
        let debounce;
        urlInput.addEventListener('input', function() {
            clearTimeout(debounce);
            const val = this.value.trim();
            if (!val) { previewWrap.style.display = 'none'; _formImgPending[formId] = ''; return; }
            debounce = setTimeout(() => {
                const img = new Image();
                img.onload  = () => setPreview(val);
                img.onerror = () => { previewWrap.style.display = 'none'; _formImgPending[formId] = ''; };
                img.src = val;
            }, 500);
        });
    }
}

function getFormImage(formId) {
    return _formImgPending[formId] || '';
}

function clearFormImage(formId) {
    _formImgPending[formId] = '';
}

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
    initFormImagePicker('addGameForm', 'gameImgGroup', 'gameFileInput', 'gameDropzone', 'gamePreviewWrap', 'gamePreviewImg', 'gameUrlInput');

    const form = document.getElementById('addGameForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const game = {
                title: this.gameTitle.value.trim(),
                genre: this.gameGenre.value.trim(),
                synopsis: this.gameSynopsis.value.trim(),
                image: getFormImage('addGameForm'),
            };
            if (!game.title || !game.genre || !game.synopsis) {
                showToast('Harap isi semua field wajib!', true); return;
            }
            addGame(game);
            clearFormImage('addGameForm');
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
    initFormImagePicker('addBlogForm', 'blogImgGroup', 'blogFileInput', 'blogDropzone', 'blogPreviewWrap', 'blogPreviewImg', 'blogUrlInput');

    const form = document.getElementById('addBlogForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const blog = {
                title: this.blogTitle.value.trim(),
                content: this.blogContent.value.trim(),
                image: getFormImage('addBlogForm'),
            };
            if (!blog.title || !blog.content) {
                showToast('Harap isi semua field wajib!', true); return;
            }
            addBlog(blog);
            clearFormImage('addBlogForm');
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
    initFormImagePicker('addProductForm', 'productImgGroup', 'productFileInput', 'productDropzone', 'productPreviewWrap', 'productPreviewImg', 'productUrlInput');

    const form = document.getElementById('addProductForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const product = {
                name:        this.productName.value.trim(),
                price:       this.productPrice.value.trim(),
                category:    this.productCategory.value.trim(),
                desc:        this.productDesc.value.trim(),
                image:       getFormImage('addProductForm'),
                marketplace: this.productMarketplace.value.trim(),
            };
            if (!product.name || !product.price || !product.marketplace) {
                showToast('Harap isi nama, harga, dan link marketplace!', true); return;
            }
            addProduct(product);
            clearFormImage('addProductForm');
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

// ===== PAGE HERO BANNER =====
// storageKey: unique key per page, e.g. 'banner_games'
function initPageBanner(storageKey, defaultLabel, defaultTitle, defaultDesc) {
    const bgEl = document.getElementById('pageBannerBg');
    const placeholderEl = document.getElementById('pageBannerPlaceholder');
    if (!bgEl) return;

    // Load saved banner
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        applyBannerImage(bgEl, placeholderEl, saved);
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.banner-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.banner-tab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // File upload
    const fileInput = document.getElementById('bannerFileInput');
    const dropzone = document.getElementById('bannerDropzone');
    const filePreviewWrap = document.getElementById('bannerFilePreview');
    const filePreviewImg = document.getElementById('bannerFilePreviewImg');
    let pendingFileDataUrl = null;

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                pendingFileDataUrl = e.target.result;
                filePreviewImg.src = pendingFileDataUrl;
                filePreviewWrap.classList.add('visible');
            };
            reader.readAsDataURL(file);
        });
    }

    // Drag and drop
    if (dropzone) {
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                pendingFileDataUrl = ev.target.result;
                filePreviewImg.src = pendingFileDataUrl;
                filePreviewWrap.classList.add('visible');
            };
            reader.readAsDataURL(file);
        });
    }

    // URL preview
    const urlInput = document.getElementById('bannerUrlInput');
    const urlPreviewWrap = document.getElementById('bannerUrlPreview');
    const urlPreviewImg = document.getElementById('bannerUrlPreviewImg');

    if (urlInput) {
        let urlDebounce;
        urlInput.addEventListener('input', function() {
            clearTimeout(urlDebounce);
            const val = this.value.trim();
            if (!val) { urlPreviewWrap.classList.remove('visible'); return; }
            urlDebounce = setTimeout(() => {
                urlPreviewImg.src = val;
                urlPreviewImg.onload = () => urlPreviewWrap.classList.add('visible');
                urlPreviewImg.onerror = () => urlPreviewWrap.classList.remove('visible');
            }, 500);
        });
    }

    // Apply button
    const applyBtn = document.getElementById('bannerApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.banner-tab-btn.active');
            let imgSrc = null;

            if (activeTab && activeTab.dataset.tab === 'tabFile') {
                imgSrc = pendingFileDataUrl;
            } else if (activeTab && activeTab.dataset.tab === 'tabUrl') {
                imgSrc = urlInput ? urlInput.value.trim() : null;
            }

            if (!imgSrc) { showToast('Pilih gambar terlebih dahulu!', true); return; }

            localStorage.setItem(storageKey, imgSrc);
            applyBannerImage(bgEl, placeholderEl, imgSrc);
            closeBannerModal();
            showToast('✅ Banner berhasil diubah!');
        });
    }

    // Reset button
    const resetBtn = document.getElementById('bannerResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (!confirm('Hapus gambar banner?')) return;
            localStorage.removeItem(storageKey);
            bgEl.style.backgroundImage = '';
            bgEl.classList.remove('has-image');
            if (placeholderEl) placeholderEl.style.display = '';
            closeBannerModal();
            showToast('🗑 Banner direset.');
        });
    }
}

function applyBannerImage(bgEl, placeholderEl, src) {
    bgEl.style.backgroundImage = `url('${src}')`;
    bgEl.classList.add('has-image');
    if (placeholderEl) placeholderEl.style.display = 'none';
}

function openBannerModal() {
    const overlay = document.getElementById('bannerModalOverlay');
    if (overlay) overlay.classList.add('active');
}

function closeBannerModal() {
    const overlay = document.getElementById('bannerModalOverlay');
    if (overlay) overlay.classList.remove('active');
    // Reset pending state
    const filePreview = document.getElementById('bannerFilePreview');
    const urlPreview = document.getElementById('bannerUrlPreview');
    const urlInput = document.getElementById('bannerUrlInput');
    const fileInput = document.getElementById('bannerFileInput');
    if (filePreview) filePreview.classList.remove('visible');
    if (urlPreview) urlPreview.classList.remove('visible');
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
}

// Close banner modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.id === 'bannerModalOverlay') closeBannerModal();
});

// ==========================================
// INDEX PAGE – SLIDE IMAGE MODAL
// ==========================================
let currentSlideIndex = null;
let slidePendingDataUrl = null;

const SLIDE_DEFAULTS = [
    './Asset/Image/Game1.png',
    './Asset/Image/hk.png',
    './Asset/Image/hks.png',
    './Asset/Image/News1.png',
    './Asset/Image/News1.png'
];

function openSlideModal(idx) {
    currentSlideIndex = idx;
    slidePendingDataUrl = null;
    const numEl = document.getElementById('slideModalNum');
    if (numEl) numEl.textContent = idx + 1;
    _resetModalState('slideModalOverlay', 'slideTabFile', 'slideTabUrl',
        'slideTabs', 'slideFilePreview', 'slideUrlPreview', 'slideUrlInput', 'slideFileInput');
    document.getElementById('slideModalOverlay').classList.add('active');
}

function closeSlideModal() {
    document.getElementById('slideModalOverlay').classList.remove('active');
    _resetModalState('slideModalOverlay', 'slideTabFile', 'slideTabUrl',
        'slideTabs', 'slideFilePreview', 'slideUrlPreview', 'slideUrlInput', 'slideFileInput');
}

// Load saved slide images on boot (call this after DOM ready)
function loadSavedSlideImages() {
    for (let i = 0; i < 5; i++) {
        const saved = localStorage.getItem('slide_img_' + i);
        if (saved) {
            const bg = document.getElementById('slideBg' + i);
            const th = document.getElementById('slideThumb' + i);
            if (bg) bg.style.backgroundImage = `url('${saved}')`;
            if (th) th.src = saved;
        }
    }
}

// ==========================================
// INDEX PAGE – GENERIC IMAGE MODAL
// ==========================================
let imgModalKey      = null;
let imgModalImgId    = null;
let imgPendingDataUrl = null;

function openImgModal(storageKey, imgElementId, titleLabel) {
    imgModalKey      = storageKey;
    imgModalImgId    = imgElementId;
    imgPendingDataUrl = null;
    const titleEl = document.getElementById('imgModalTitle');
    if (titleEl) titleEl.textContent = '🖼️ Ubah ' + titleLabel;
    _resetModalState('imgModalOverlay', 'imgTabFile', 'imgTabUrl',
        'imgModalTabs', 'imgFilePreview', 'imgUrlPreview', 'imgUrlInput', 'imgFileInput');
    document.getElementById('imgModalOverlay').classList.add('active');
}

function closeImgModal() {
    document.getElementById('imgModalOverlay').classList.remove('active');
    _resetModalState('imgModalOverlay', 'imgTabFile', 'imgTabUrl',
        'imgModalTabs', 'imgFilePreview', 'imgUrlPreview', 'imgUrlInput', 'imgFileInput');
}

function _resetModalState(overlayId, tabFileId, tabUrlId, tabsId, filePrevId, urlPrevId, urlInputId, fileInputId) {
    const fp = document.getElementById(filePrevId);
    const up = document.getElementById(urlPrevId);
    const ui = document.getElementById(urlInputId);
    const fi = document.getElementById(fileInputId);
    if (fp) fp.classList.remove('visible');
    if (up) up.classList.remove('visible');
    if (ui) ui.value = '';
    if (fi) fi.value = '';
    // Reset tabs: first tab active
    const tabsEl = document.getElementById(tabsId);
    if (tabsEl) {
        tabsEl.querySelectorAll('.img-modal-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
    }
    // Reset panels
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.querySelectorAll('.img-modal-panel').forEach((p, i) => p.classList.toggle('active', i === 0));
    }
}

// Load saved generic images on boot
function loadSavedIndexImages() {
    const map = [
        { key: 'motto_gif',     imgId: 'mottoGifImg'   },
        { key: 'about_img',     imgId: 'aboutImg'      },
        { key: 'maskot_img',    imgId: 'maskotImg'     },
        { key: 'community_img', imgId: 'communityImg'  },
    ];
    map.forEach(m => {
        const saved = localStorage.getItem(m.key);
        if (saved) {
            const el = document.getElementById(m.imgId);
            if (el) el.src = saved;
        }
    });
}

// Wire up all index-page modals – call once after DOM ready
function initIndexImageModals() {
    // ── Shared helper: wire tabs for a modal ──
    function wireTabs(tabsId, overlayId) {
        const tabsEl = document.getElementById(tabsId);
        if (!tabsEl) return;
        tabsEl.querySelectorAll('.img-modal-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                tabsEl.querySelectorAll('.img-modal-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(overlayId).querySelectorAll('.img-modal-panel')
                    .forEach(p => p.classList.remove('active'));
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });
    }

    // ── Shared helper: wire file input + dropzone ──
    function wireFile(fileInputId, dropzoneId, previewWrapId, previewImgId, onReady) {
        const fi = document.getElementById(fileInputId);
        const dz = document.getElementById(dropzoneId);
        if (fi) {
            fi.addEventListener('change', function () {
                const file = this.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = e => {
                    onReady(e.target.result);
                    document.getElementById(previewImgId).src = e.target.result;
                    document.getElementById(previewWrapId).classList.add('visible');
                };
                reader.readAsDataURL(file);
            });
        }
        if (dz) {
            dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
            dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
            dz.addEventListener('drop', e => {
                e.preventDefault(); dz.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (!file || !file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    onReady(ev.target.result);
                    document.getElementById(previewImgId).src = ev.target.result;
                    document.getElementById(previewWrapId).classList.add('visible');
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // ── Shared helper: wire URL input ──
    function wireUrl(urlInputId, previewWrapId, previewImgId) {
        const ui = document.getElementById(urlInputId);
        if (!ui) return;
        let debounce;
        ui.addEventListener('input', function () {
            clearTimeout(debounce);
            const val = this.value.trim();
            if (!val) { document.getElementById(previewWrapId).classList.remove('visible'); return; }
            debounce = setTimeout(() => {
                const img = document.getElementById(previewImgId);
                img.src = val;
                img.onload  = () => document.getElementById(previewWrapId).classList.add('visible');
                img.onerror = () => document.getElementById(previewWrapId).classList.remove('visible');
            }, 500);
        });
    }

    // ========== SLIDE MODAL ==========
    wireTabs('slideTabs', 'slideModalOverlay');
    wireFile('slideFileInput', 'slideDropzone', 'slideFilePreview', 'slideFilePreviewImg',
        val => { slidePendingDataUrl = val; });
    wireUrl('slideUrlInput', 'slideUrlPreview', 'slideUrlPreviewImg');

    const slideApply = document.getElementById('slideApplyBtn');
    if (slideApply) {
        slideApply.addEventListener('click', () => {
            const activeTab = document.querySelector('#slideTabs .img-modal-tab.active');
            let src = activeTab && activeTab.dataset.tab === 'slideTabFile'
                ? slidePendingDataUrl
                : (document.getElementById('slideUrlInput') || {}).value?.trim();
            if (!src) { showToast('Pilih gambar terlebih dahulu!', true); return; }
            localStorage.setItem('slide_img_' + currentSlideIndex, src);
            const bg = document.getElementById('slideBg' + currentSlideIndex);
            const th = document.getElementById('slideThumb' + currentSlideIndex);
            if (bg) bg.style.backgroundImage = `url('${src}')`;
            if (th) th.src = src;
            closeSlideModal();
            showToast('✅ Foto slide ' + (currentSlideIndex + 1) + ' berhasil diubah!');
        });
    }

    const slideReset = document.getElementById('slideResetBtn');
    if (slideReset) {
        slideReset.addEventListener('click', () => {
            if (!confirm('Reset foto slide ' + (currentSlideIndex + 1) + ' ke default?')) return;
            localStorage.removeItem('slide_img_' + currentSlideIndex);
            const src = SLIDE_DEFAULTS[currentSlideIndex];
            const bg = document.getElementById('slideBg' + currentSlideIndex);
            const th = document.getElementById('slideThumb' + currentSlideIndex);
            if (bg) bg.style.backgroundImage = `url('${src}')`;
            if (th) th.src = src;
            closeSlideModal();
            showToast('🗑 Foto slide direset.');
        });
    }

    const slideOverlay = document.getElementById('slideModalOverlay');
    if (slideOverlay) slideOverlay.addEventListener('click', e => { if (e.target === slideOverlay) closeSlideModal(); });

    // ========== GENERIC IMAGE MODAL ==========
    wireTabs('imgModalTabs', 'imgModalOverlay');
    wireFile('imgFileInput', 'imgDropzone', 'imgFilePreview', 'imgFilePreviewImg',
        val => { imgPendingDataUrl = val; });
    wireUrl('imgUrlInput', 'imgUrlPreview', 'imgUrlPreviewImg');

    const imgApply = document.getElementById('imgApplyBtn');
    if (imgApply) {
        imgApply.addEventListener('click', () => {
            const activeTab = document.querySelector('#imgModalTabs .img-modal-tab.active');
            let src = activeTab && activeTab.dataset.tab === 'imgTabFile'
                ? imgPendingDataUrl
                : (document.getElementById('imgUrlInput') || {}).value?.trim();
            if (!src) { showToast('Pilih gambar terlebih dahulu!', true); return; }
            localStorage.setItem(imgModalKey, src);
            const el = document.getElementById(imgModalImgId);
            if (el) el.src = src;
            closeImgModal();
            showToast('✅ Gambar berhasil diubah!');
        });
    }

    const imgReset = document.getElementById('imgResetBtn');
    if (imgReset) {
        imgReset.addEventListener('click', () => {
            if (!confirm('Reset gambar ini ke default?')) return;
            localStorage.removeItem(imgModalKey);
            const el = document.getElementById(imgModalImgId);
            if (el && el.dataset.original) el.src = el.dataset.original;
            closeImgModal();
            showToast('🗑 Gambar direset.');
        });
    }

    const imgOverlay = document.getElementById('imgModalOverlay');
    if (imgOverlay) imgOverlay.addEventListener('click', e => { if (e.target === imgOverlay) closeImgModal(); });

    // ── Load saved data on boot ──
    loadSavedSlideImages();
    loadSavedIndexImages();
}
