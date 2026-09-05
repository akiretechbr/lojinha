const productsNode = document.querySelector('#products');
const countNode = document.querySelector('#product-count');
const errorNode = document.querySelector('#error');
const freightInputs = [...document.querySelectorAll('input[name="freight"]')];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let products = [];

function selectedFreight() {
  return Number(freightInputs.find(input => input.checked)?.value || 0);
}

function render() {
  const freight = selectedFreight();
  countNode.textContent = `${products.length} ${products.length === 1 ? 'produto' : 'produtos'}`;
  productsNode.innerHTML = products.map((item, index) => {
    const total = item.localSale + freight;
    const message = encodeURIComponent(`Olá! Tenho interesse em ${item.product}. Valor do produto: ${money.format(item.localSale)}. Frete: ${freight ? money.format(freight) : 'sem frete'}. Total: ${money.format(total)}.`);
    return `<article class="product-card">
      <span class="product-index">${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(item.product)}</h3>
      <div class="price-row">
        <div><span class="price-label">Produto</span><span class="base-price">${money.format(item.localSale)}</span></div>
        <div><span class="price-label">Total${freight ? ' com frete' : ''}</span><span class="total-price">${money.format(total)}</span></div>
      </div>
      <a class="buy-button" href="https://wa.me/5541998474731?text=${message}" target="_blank" rel="noopener">Pedir pelo WhatsApp</a>
    </article>`;
  }).join('');
}

function escapeHtml(value) {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

freightInputs.forEach(input => input.addEventListener('change', render));

fetch('data/produtos.json', { cache: 'no-store' })
  .then(response => { if (!response.ok) throw new Error('Falha ao carregar'); return response.json(); })
  .then(data => { products = data.products || []; render(); })
  .catch(() => { errorNode.hidden = false; countNode.textContent = ''; });

