// Estado do carrinho: array de itens { name, price, quantity }
const cart = [];

// Formata preço em moeda BRL
function formatPrice(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Função única para alterar quantidade com limites
function changeQuantity(produto, delta) {
  const input = document.getElementById(`qty-${produto}`);
  if (!input) return;
  let value = parseInt(input.value, 10) || 0;
  value += delta;
  value = Math.min(Math.max(value, ), 99);
  input.value = value;
}

// Obtém a quantidade atual de um item
function getQuantity(produto) {
  return parseInt(document.getElementById(`qty-${produto}`).value, 10);
}

// Atualiza a exibição do carrinho
function updateCartUI() {
  const cartItemsUl = document.getElementById('cart-items');
  const totalP = document.getElementById('total');
  const whatsappLink = document.getElementById('whatsapp-link');
  const pixButton = document.getElementById('pix-button');

  cartItemsUl.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const li = document.createElement('li');
    li.textContent = `${item.name} - ${item.quantity} x ${formatPrice(item.price)}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.className = 'remove-btn';
    removeBtn.setAttribute('aria-label', `Remover ${item.name} do carrinho`);
    removeBtn.onclick = () => {
      removeFromCart(index);
    };

    li.appendChild(removeBtn);
    cartItemsUl.appendChild(li);
  });

  totalP.textContent = `Total: ${formatPrice(total)}`;

  // Link WhatsApp
  if (cart.length === 0) {
    whatsappLink.href = '#';
    whatsappLink.classList.add('disabled');
    whatsappLink.setAttribute('aria-disabled', 'true');
    whatsappLink.textContent = 'Carrinho vazio';
  } else {
    whatsappLink.classList.remove('disabled');
    whatsappLink.removeAttribute('aria-disabled');
    whatsappLink.textContent = 'Enviar Pedido no WhatsApp';

    let message = 'Olá, gostaria de fazer o pedido:\n';
    cart.forEach(item => {
      message += `- ${item.quantity} x ${item.name} (${formatPrice(item.price)})\n`;
    });
    message += `Total: ${formatPrice(total)}`;

    const phoneNumber = '5511999999999';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    whatsappLink.href = url;
  }

  // Botão Pix
  if (cart.length === 0) {
    pixButton.disabled = true;
    pixButton.setAttribute('aria-disabled', 'true');
    pixButton.title = 'Faça seu pedido antes de pagar via Pix';
  } else {
    pixButton.disabled = false;
    pixButton.removeAttribute('aria-disabled');
    pixButton.title = 'Ir para pagamento via Pix';
  }

  // Salva carrinho no localStorage
  saveCart();
}

// Adiciona item ao carrinho e aplica animação visual
function addToCart(name, price, quantity = 1, button = null) {
  const existingIndex = cart.findIndex(item => item.name === name);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ name, price, quantity });
  }

  updateCartUI();

  // Aplica animação de feedback visual no botão, se fornecido
  if (button) {
    button.classList.add('added-to-cart');

    // Remove a classe após a animação para permitir reuso
    button.addEventListener('animationend', () => {
      button.classList.remove('added-to-cart');
    }, { once: true });
  }
}

// Remove item do carrinho
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// Salva o carrinho localmente
function saveCart() {
  localStorage.setItem('cartData', JSON.stringify(cart));
}

// Carrega carrinho salvo
function loadCart() {
  const saved = localStorage.getItem('cartData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.forEach(item => cart.push(item));
    } catch (e) {
      console.error('Erro ao carregar carrinho:', e);
    }
  }
  updateCartUI();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadCart();

  // Liga animação em todos os botões de adicionar
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function (event) {
      // Passa o botão clicado para aplicar a animação no addToCart
      const button = event.currentTarget;

      // Chama addToCart com nome, preço e quantidade, e botão para animação
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));
      const produtoId = button.getAttribute('data-produto-id');

      // Se não tiver esses atributos, tenta extrair da função, mas o ideal é ajustar HTML (vou explicar abaixo)
      if (!name || !price || !produtoId) {
        console.warn('Botão add-btn deve ter atributos data-name, data-price e data-produto-id');
        return;
      }

      const quantityInput = document.getElementById(`qty-${produtoId}`);
      const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

      addToCart(name, price, quantity, button);
    });
  });

  // Botão Pix com redirecionamento
  const pixButton = document.getElementById('pix-button');
  if (pixButton) {
    pixButton.addEventListener('click', () => {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      window.location.href = `pix.html?valor=${total.toFixed(2)}`;
    });
  }
});
function showSuccessMessage(text) {
  const existingMsg = document.querySelector('.success-message');
  if (existingMsg) {
    existingMsg.remove();
  }

  const msg = document.createElement('div');
  msg.className = 'success-message';
  msg.textContent = text;

  // Estilo para canto superior direito
  msg.style.position = 'fixed';
  msg.style.top = '20px';
  msg.style.right = '20px';
  msg.style.backgroundColor = '#27ae60';
  msg.style.color = '#fff';
  msg.style.padding = '12px 24px';
  msg.style.borderRadius = '8px';
  msg.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  msg.style.fontSize = '1rem';
  msg.style.zIndex = '9999';
  msg.style.opacity = '0';
  msg.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(msg);

  requestAnimationFrame(() => {
    msg.style.opacity = '1';
  });

  setTimeout(() => {
    msg.style.opacity = '0';
    msg.addEventListener('transitionend', () => {
      msg.remove();
    });
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', () => {
      showSuccessMessage('Item adicionado ao carrinho com sucesso!');
    });
  });
});
