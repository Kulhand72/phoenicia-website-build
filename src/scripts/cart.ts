export interface CartItem {
  id: string;
  name: string;
  price: string;
  qty: number;
}

const STORAGE_KEY = 'phoenicia-cart';

type Listener = (items: CartItem[]) => void;
const listeners = new Set<Listener>();

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn(items));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addItem(id: string, name: string, price: string) {
  const items = readCart();
  const existing = items.find((i) => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({ id, name, price, qty: 1 });
  }
  writeCart(items);
}

export function setQty(id: string, qty: number) {
  let items = readCart();
  if (qty <= 0) {
    items = items.filter((i) => i.id !== id);
  } else {
    const existing = items.find((i) => i.id === id);
    if (existing) existing.qty = qty;
  }
  writeCart(items);
}

export function removeItem(id: string) {
  writeCart(readCart().filter((i) => i.id !== id));
}

export function getCount(): number {
  return readCart().reduce((sum, i) => sum + i.qty, 0);
}

function basePrice(price: string): number {
  const match = price.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function getEstimatedTotal(): number {
  return readCart().reduce((sum, i) => sum + basePrice(i.price) * i.qty, 0);
}

export function onChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) listeners.forEach((fn) => fn(readCart()));
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-add-to-cart]');
    if (!btn) return;

    const id = btn.dataset.itemId;
    const name = btn.dataset.itemName;
    const price = btn.dataset.itemPrice;
    if (!id || !name || !price) return;

    addItem(id, name, price);

    if (btn.dataset.addedTimer) window.clearTimeout(Number(btn.dataset.addedTimer));
    const label = btn.querySelector<HTMLElement>('.add-cart-label');
    const originalLabel = btn.dataset.originalLabel ?? label?.textContent ?? 'Add';
    if (!btn.dataset.originalLabel) btn.dataset.originalLabel = originalLabel;
    if (label) label.textContent = 'Added';
    btn.classList.add('added');
    const timer = window.setTimeout(() => {
      if (label) label.textContent = originalLabel;
      btn.classList.remove('added');
    }, 1200);
    btn.dataset.addedTimer = String(timer);
  });
}
