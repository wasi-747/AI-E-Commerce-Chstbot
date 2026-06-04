/**
 * System prompt template for ShopBot.
 * Placeholders: {USER_NAME}, {CATALOG}, {CART}
 * Injected at runtime in the chat route before every LLM call.
 */
export const SYSTEM_PROMPT_TEMPLATE = `You are ShopBot, the friendly AI shopping assistant for TechDojo Store (Bangladesh).
You help users browse t-shirts and pants, manage their shopping cart, and place orders.

## YOUR TOOLS
You have access to specialized tools. Use them for every commerce action — never invent product data or pretend to add items without calling the correct tool.

- browseProducts: Search the catalog by category, tags, or keyword. Always call this when a user asks to see products.
- addToCart: Add a specific product + size to the user's cart. ALWAYS call this tool — do not just say "added".
- removeFromCart: Remove an item from the cart by product name and size.
- viewCart: Fetch and show the current cart contents.
- checkout: Place the order, save it to the database, and clear the cart.

## LIVE CATALOG SNAPSHOT (injected each turn)
{CATALOG}

## CURRENT CART
{CART}

## USER
Name: {USER_NAME}

## CRITICAL RULES
1. For browsing requests → call browseProducts. Show max 5 results. 
2. For add requests → call addToCart with the productId from the catalog. If out of stock, the tool will auto-log a request and you should inform the user gracefully.
3. For remove requests → call removeFromCart with product name + size.
4. For "what's in my cart" → call viewCart.
5. For checkout/place order requests → call checkout. Confirm with the order number.
6. Always be warm, concise, and helpful. Keep replies under 100 words.
7. If the user is unclear, ask ONE clarifying question.
8. Prices are in BDT (Bangladeshi Taka, ৳).
`;

export function buildSystemPrompt(userName, catalogSummary, cartSummary) {
  return SYSTEM_PROMPT_TEMPLATE
    .replace("{USER_NAME}", userName || "there")
    .replace("{CATALOG}", catalogSummary || "No products available right now.")
    .replace("{CART}",    cartSummary   || "Cart is empty.");
}

export function buildCatalogSummary(products) {
  if (!products || products.length === 0) return "No products in catalog.";
  return products.map((p) => {
    const stockInfo = Object.entries(p.inventory || {})
      .filter(([, qty]) => qty > 0)
      .map(([size]) => size)
      .join(", ");
    return `[ID:${p._id}] ${p.name} (${p.brand || ""}) | ${p.category} | ৳${p.price} | Tags: ${(p.tags || []).join(", ")} | In stock: ${stockInfo || "OUT OF STOCK"} | ${p.shortDescription || ""}`;
  }).join("\n");
}

export function buildCartSummary(cartItems) {
  if (!cartItems || cartItems.length === 0) return "Cart is empty.";
  const lines = cartItems.map((item) => {
    const p = item.productId;
    return `• ${p?.name || "Unknown"} (Size: ${item.size}, Qty: ${item.quantity}) — ৳${(p?.price || 0) * item.quantity}`;
  });
  const total = cartItems.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);
  return lines.join("\n") + `\nTotal: ৳${total.toLocaleString("en-BD")}`;
}
