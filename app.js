const productsNode = document.querySelector('#products');
const countNode = document.querySelector('#product-count');
const errorNode = document.querySelector('#error');
const searchNode = document.querySelector('#product-search');
const cartItemsNode = document.querySelector('#cart-items');
const cartBadgeNode = document.querySelector('#cart-badge');
const subtotalNode = document.querySelector('#cart-subtotal');
const cartFreightNode = document.querySelector('#cart-freight');
const totalNode = document.querySelector('#cart-total');
const clearCartNode = document.querySelector('#clear-cart');
const freightInputs = [...document.querySelectorAll('input[name="freight"]')];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let products = [];
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
  const visible = products.filter(item => item.product.toLocaleLowerCase('pt-BR').includes(query));
  countNode.textContent = query
    ? `${visible.length} ${visible.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`
    : `${visible.length} ${visible.length === 1 ? 'produto' : 'produtos'}`;
  productsNode.innerHTML = visible.map((item, index) => `<article class="product-card">
    <span class="product-index">${String(index + 1).padStart(2, '0')}</span>
    <h3>${escapeHtml(item.product)}</h3>
    <div class="price-row">
      <div><span class="price-label">Valor unitário</span><span class="base-price">${money.format(item.localSale)}</span></div>
      <button class="add-cart" type="button" data-product="${escapeHtml(item.product)}">Adicionar</button>
    </div>
  </article>`).join('') || '<p class="error">Nenhum produto encontrado. Tente outro nome.</p>';
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

function changeQuantity(productName, amount) {
  const item = cart.get(productName);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart.delete(productName);
}

productsNode.addEventListener('click', event => {
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
freightInputs.forEach(input => input.addEventListener('change', renderCart));
searchNode.addEventListener('input', renderProducts);

fetch('data/produtos.json', { cache: 'no-store' })
  .then(response => { if (!response.ok) throw new Error('Falha ao carregar'); return response.json(); })
  .then(data => { products = data.products || []; renderProducts(); renderCart(); })
  .catch(() => { errorNode.hidden = false; countNode.textContent = ''; });

