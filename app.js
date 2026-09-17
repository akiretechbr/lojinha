const productsNode = document.querySelector('#products');
const filterNode = document.querySelector('#product-filters');
const errorNode = document.querySelector('#error');
const searchNode = document.querySelector('#product-search');
const cartItemsNode = document.querySelector('#cart-items');
const cartBadgeNode = document.querySelector('#cart-badge');
const subtotalNode = document.querySelector('#cart-subtotal');
const cartFreightNode = document.querySelector('#cart-freight');
const totalNode = document.querySelector('#cart-total');
const clearCartNode = document.querySelector('#clear-cart');
const checkoutCartNode = document.querySelector('#checkout-cart');
const checkoutDialog = document.querySelector('#checkout-dialog');
const closeCheckoutNode = document.querySelector('#close-checkout');
const checkoutItemsNode = document.querySelector('#checkout-items');
const checkoutSubtotalNode = document.querySelector('#checkout-subtotal');
const checkoutFreightNode = document.querySelector('#checkout-freight');
const checkoutTotalNode = document.querySelector('#checkout-total');
const checkoutSavingsNode = document.querySelector('#checkout-savings');
const whatsappOrderNode = document.querySelector('#whatsapp-order');
const freightInputs = [...document.querySelectorAll('input[name="freight"]')];
const photoDialog = document.querySelector('#photo-dialog');
const photoImageNode = document.querySelector('#photo-image');
const photoTitleNode = document.querySelector('#photo-title');
const closePhotoNode = document.querySelector('#close-photo');
const photoStageNode = document.querySelector('#photo-stage');
const photoPrevNode = document.querySelector('#photo-prev');
const photoNextNode = document.querySelector('#photo-next');
const photoDotsNode = document.querySelector('#photo-dots');
let currentPhotoImages = [];
let currentPhotoIndex = 0;
let photoTouchStartX = 0;
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let products = [];
let selectedProductType = 'TODOS';
const cart = new Map();

function selectedFreight() {
  return Number(freightInputs.find(input => input.checked)?.value || 0);
}

function escapeHtml(value) {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

function renderProducts() {
  const query = searchNode.value.trim().toLocaleLowerCase('pt-BR');
  const visible = products.filter(item =>
    item.product.toLocaleLowerCase('pt-BR').includes(query) &&
    (selectedProductType === 'TODOS' || item.productType === selectedProductType)
  );
  productsNode.innerHTML = visible.map(item => `<article class="product-card">
    <h3>${escapeHtml(item.product)}</h3>
    ${item.thumbnail ? `<button class="product-thumbnail" type="button" data-photo-product="${escapeHtml(item.product)}" aria-label="Ver fotos de ${escapeHtml(item.product)}"><img src="${item.thumbnail}" alt="" loading="lazy"></button>` : ''}
    <div class="price-row">
      <div><span class="price-label">Valor unitário</span><span class="base-price">${money.format(item.localSale)}</span></div>
      <div class="product-actions">
        <button class="add-cart" type="button" data-product="${escapeHtml(item.product)}" aria-label="Adicionar ${escapeHtml(item.product)} ao carrinho"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7"></path><circle cx="10" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg><span>Adicionar</span></button>
      </div>
    </div>
  </article>`).join('') || '<p class="error">Nenhum produto encontrado. Tente outro nome.</p>';
}

function renderProductFilters() {
  const types = [...new Set(products.map(item => item.productType).filter(Boolean))];
  filterNode.innerHTML = ['TODOS', ...types].map(type =>
    `<button type="button" data-product-type="${escapeHtml(type)}" class="${type === selectedProductType ? 'active' : ''}">${type === 'TODOS' ? 'Todos' : escapeHtml(type)}</button>`
  ).join('');
}

function renderCart() {
  const items = [...cart.values()];
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.localSale * item.quantity, 0);
  const freight = items.length ? selectedFreight() : 0;
  cartBadgeNode.textContent = quantity;
  subtotalNode.textContent = money.format(subtotal);
  cartFreightNode.textContent = money.format(freight);
  totalNode.textContent = money.format(subtotal + freight);
  clearCartNode.disabled = !items.length;
  checkoutCartNode.disabled = !items.length;
  cartItemsNode.innerHTML = items.length ? items.map(item => `<div class="cart-item">
    <p class="cart-item-name">${escapeHtml(item.product)}</p>
    <div class="cart-item-bottom">
      <div class="qty-control" aria-label="Quantidade de ${escapeHtml(item.product)}">
        <button type="button" data-action="decrease" data-product="${escapeHtml(item.product)}" aria-label="Diminuir quantidade">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" data-product="${escapeHtml(item.product)}" aria-label="Aumentar quantidade">+</button>
      </div>
      <span class="cart-item-price">${money.format(item.localSale * item.quantity)}</span>
    </div>
    <button class="remove-item" type="button" data-action="remove" data-product="${escapeHtml(item.product)}">Remover</button>
  </div>`).join('') : '<p class="cart-empty">Procure um produto e adicione à sua lista.</p>';
}

function openCheckout() {
  const items = [...cart.values()];
  if (!items.length) return;
  const subtotal = items.reduce((sum, item) => sum + item.localSale * item.quantity, 0);
  const freight = selectedFreight();
  const total = subtotal + freight;
  const ecommerceTotal = items.reduce((sum, item) => sum + (item.marketplaceSale || 0) * item.quantity, 0);
  const savings = ecommerceTotal - total;
  const savingsPercent = ecommerceTotal > 0 ? (savings / ecommerceTotal) * 100 : 0;
  checkoutItemsNode.innerHTML = items.map(item => `<div class="checkout-line">
    <div><p class="checkout-line-name">${escapeHtml(item.product)}</p><span class="checkout-line-meta">${item.quantity} × ${money.format(item.localSale)}</span></div>
    <strong class="checkout-line-value">${money.format(item.localSale * item.quantity)}</strong>
  </div>`).join('');
  checkoutSubtotalNode.textContent = money.format(subtotal);
  checkoutFreightNode.textContent = money.format(freight);
  checkoutTotalNode.textContent = money.format(total);
  checkoutSavingsNode.hidden = !(ecommerceTotal > 0 && savings > 0);
  if (!checkoutSavingsNode.hidden) {
    checkoutSavingsNode.innerHTML = `Parabéns! Nesta compra você economizou <strong>${savingsPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong> comparado ao valor no e-commerce.`;
  }
  const lines = items.map(item => `• ${item.quantity}x ${item.product} — ${money.format(item.localSale * item.quantity)}`);
  const message = ['Olá! Segue o resumo do pedido:', '', ...lines, '', `Subtotal: ${money.format(subtotal)}`, `Frete: ${money.format(freight)}`, `Total: ${money.format(total)}`].filter(Boolean).join('\n');
  whatsappOrderNode.href = `https://wa.me/5541998474731?text=${encodeURIComponent(message)}`;
  checkoutDialog.showModal();
}

function changeQuantity(productName, amount) {
  const item = cart.get(productName);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart.delete(productName);
}

productsNode.addEventListener('click', event => {
  const photoButton = event.target.closest('[data-photo-product]');
  if (photoButton) {
    const selected = products.find(item => item.product === photoButton.dataset.photoProduct);
    if (!selected?.images?.length) return;
    currentPhotoImages = selected.images;
    currentPhotoIndex = 0;
    photoImageNode.alt = selected.product;
    photoTitleNode.textContent = selected.product;
    renderPhoto();
    photoDialog.showModal();
    return;
  }
  const button = event.target.closest('.add-cart');
  if (!button) return;
  const product = products.find(item => item.product === button.dataset.product);
  if (!product) return;
  const current = cart.get(product.product);
  cart.set(product.product, { ...product, quantity: (current?.quantity || 0) + 1 });
  renderCart();
});

cartItemsNode.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  if (button.dataset.action === 'remove') cart.delete(button.dataset.product);
  if (button.dataset.action === 'increase') changeQuantity(button.dataset.product, 1);
  if (button.dataset.action === 'decrease') changeQuantity(button.dataset.product, -1);
  renderCart();
});

clearCartNode.addEventListener('click', () => { cart.clear(); renderCart(); });
checkoutCartNode.addEventListener('click', openCheckout);
closeCheckoutNode.addEventListener('click', () => checkoutDialog.close());
checkoutDialog.addEventListener('click', event => { if (event.target === checkoutDialog) checkoutDialog.close(); });
function renderPhoto() {
  photoImageNode.src = currentPhotoImages[currentPhotoIndex] || '';
  photoPrevNode.hidden = currentPhotoImages.length < 2;
  photoNextNode.hidden = currentPhotoImages.length < 2;
  photoDotsNode.hidden = currentPhotoImages.length < 2;
  photoDotsNode.innerHTML = currentPhotoImages.map((_, index) =>
    `<button type="button" data-photo-index="${index}" class="${index === currentPhotoIndex ? 'active' : ''}" aria-label="Abrir foto ${index + 1}"></button>`
  ).join('');
}
function changePhoto(amount) {
  if (currentPhotoImages.length < 2) return;
  currentPhotoIndex = (currentPhotoIndex + amount + currentPhotoImages.length) % currentPhotoImages.length;
  renderPhoto();
}
closePhotoNode.addEventListener('click', () => photoDialog.close());
photoPrevNode.addEventListener('click', () => changePhoto(-1));
photoNextNode.addEventListener('click', () => changePhoto(1));
photoDotsNode.addEventListener('click', event => {
  const dot = event.target.closest('[data-photo-index]');
  if (!dot) return;
  currentPhotoIndex = Number(dot.dataset.photoIndex);
  renderPhoto();
});
photoStageNode.addEventListener('touchstart', event => { photoTouchStartX = event.changedTouches[0].clientX; }, { passive: true });
photoStageNode.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - photoTouchStartX;
  if (Math.abs(distance) > 45) changePhoto(distance < 0 ? 1 : -1);
}, { passive: true });
photoDialog.addEventListener('click', event => { if (event.target === photoDialog) photoDialog.close(); });
freightInputs.forEach(input => input.addEventListener('change', renderCart));
searchNode.addEventListener('input', renderProducts);
filterNode.addEventListener('click', event => {
  const button = event.target.closest('[data-product-type]');
  if (!button) return;
  selectedProductType = button.dataset.productType;
  renderProductFilters();
  renderProducts();
});

Promise.all([
  fetch(`data/produtos.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('Falha ao carregar produtos');
    return response.json();
  }),
  fetch(`data/fotos.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : { photos: [] }),
  fetch(`data/fotos-novos.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : { photos: [] }),
  fetch(`data/fotos-novos-2.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : { photos: [] }),
  fetch(`data/miniaturas.json?v=${Date.now()}`, { cache: 'no-store' }).then(response => response.ok ? response.json() : { thumbnails: [] })
])
  .then(([data, photoData, newPhotoData, newPhotoData2, thumbnailData]) => {
    const allPhotos = [...(photoData.photos || []), ...(newPhotoData.photos || []), ...(newPhotoData2.photos || [])];
    const photoByProduct = new Map(allPhotos.map(item => [
      item.product.toLocaleLowerCase('pt-BR'),
      item.images || (item.image ? [item.image] : [])
    ]));
    const thumbnailByProduct = new Map((thumbnailData.thumbnails || []).map(item => [item.product.toLocaleLowerCase('pt-BR'), item.image]));
    products = (data.products || []).map(item => ({
      ...item,
      images: photoByProduct.get(item.product.toLocaleLowerCase('pt-BR')) || [],
      thumbnail: thumbnailByProduct.get(item.product.toLocaleLowerCase('pt-BR')) || ''
    }));
    renderProductFilters();
    renderProducts();
    renderCart();
  })
  .catch(() => { errorNode.hidden = false; });

