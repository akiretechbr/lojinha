const productsNode = document.querySelector('#products');
const countNode = document.querySelector('#product-count');
const errorNode = document.querySelector('#error');
const searchNode = document.querySelector('#product-search');
const freightInputs = [...document.querySelectorAll('input[name="freight"]')];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let products = [];

function selectedFreight() {
  return Number(freightInputs.find(input => input.checked)?.value || 0);
}

function render() {
  const freight = selectedFreight();
  const query = searchNode.value.trim().toLocaleLowerCase('pt-BR');
  const visibleProducts = products.filter(item => item.product.toLocaleLowerCase('pt-BR').includes(query));
  countNode.textContent = query
    ? `${visibleProducts.length} ${visibleProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`
    : `${visibleProducts.length} ${visibleProducts.length === 1 ? 'produto' : 'produtos'}`;
  productsNode.innerHTML = visibleProducts.map((item, index) => {
    const total = item.localSale + freight;
    return `<article class="product-card">
      <span class="product-index">${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(item.product)}</h3>
      <div class="price-row">
        <div><span class="price-label">Produto</span><span class="base-price">${money.format(item.localSale)}</span></div>
        <div><span class="price-label">Total${freight ? ' com frete' : ''}</span><span class="total-price">${money.format(total)}</span></div>
      </div>
    </article>`;
  }).join('') || '<p class="error">Nenhum produto encontrado. Tente outro nome.</p>';
}

function escapeHtml(value) {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

freightInputs.forEach(input => input.addEventListener('change', render));
searchNode.addEventListener('input', render);

fetch('data/produtos.json', { cache: 'no-store' })
  .then(response => { if (!response.ok) throw new Error('Falha ao carregar'); return response.json(); })
  .then(data => { products = data.products || []; render(); })
  .catch(() => { errorNode.hidden = false; countNode.textContent = ''; });

