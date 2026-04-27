import prisma from '../config/database.js';
import { getLlmClient } from './ai/text/llmClient.js';

const CHAT_HISTORY_MAX = 8;
const PRODUCT_LIMIT = 5;
const ORDER_LIMIT = 3;

function normalizeText(value) {
  return String(value || '').trim();
}

function toSlugTokens(message) {
  return normalizeText(message)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 10);
}

function parseBudgetVnd(message) {
  const text = normalizeText(message).toLowerCase();
  const rangeRegex = /(\d+[\d.,]*)\s*(k|ngh[iì]n|tr|tri[eệ]u|m|vnd|đ)?\s*(?:-|đến|toi|tới|to)\s*(\d+[\d.,]*)\s*(k|ngh[iì]n|tr|tri[eệ]u|m|vnd|đ)?/i;
  const singleRegex = /(dưới|toi da|tối đa|khoảng|tầm|~)?\s*(\d+[\d.,]*)\s*(k|ngh[iì]n|tr|tri[eệ]u|m|vnd|đ)/i;

  function convert(raw, unit) {
    const base = Number(String(raw).replace(/,/g, '').replace(/\./g, ''));
    if (!Number.isFinite(base) || base <= 0) return null;
    const u = String(unit || '').toLowerCase();
    if (u === 'k' || u.includes('ngh')) return base * 1000;
    if (u === 'tr' || u.includes('tri')) return base * 1000000;
    if (u === 'm') return base * 1000000;
    return base;
  }

  const rangeMatch = text.match(rangeRegex);
  if (rangeMatch) {
    const min = convert(rangeMatch[1], rangeMatch[2]);
    const max = convert(rangeMatch[3], rangeMatch[4] || rangeMatch[2]);
    if (min && max) {
      return {
        budgetMin: Math.min(min, max),
        budgetMax: Math.max(min, max),
      };
    }
  }

  const singleMatch = text.match(singleRegex);
  if (singleMatch) {
    const value = convert(singleMatch[2], singleMatch[3]);
    if (!value) return {};
    const prefix = String(singleMatch[1] || '').toLowerCase();
    if (prefix.includes('dưới') || prefix.includes('toi da') || prefix.includes('tối đa')) {
      return { budgetMax: value };
    }
    return { budgetMin: Math.floor(value * 0.7), budgetMax: value };
  }

  return {};
}

function detectIntent(message) {
  const text = normalizeText(message).toLowerCase();
  const product = /(sản phẩm|product|giá|gợi ý|recommend|mua|compare|so sánh)/i.test(text);
  const compare = /(so sánh|compare|khác gì|nên chọn)/i.test(text);
  const order = /(đơn hàng|order|mã đơn|vận chuyển|giao hàng|hoàn tiền|thanh toán|ord\d+)/i.test(text);
  const support = /(báo lỗi|report|hỗ trợ|khiếu nại|không nhận được|không hoạt động)/i.test(text);
  if (compare) return 'compare';
  if (order) return 'order_support';
  if (product) return 'product_advice';
  if (support) return 'support';
  return 'general';
}

function extractOrderNumber(message) {
  const match = normalizeText(message).match(/\bORD\d{6,}\b/i);
  return match ? match[0].toUpperCase() : null;
}

function formatPriceVnd(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildProductWhere(tokens, memory = {}) {
  const ors = [];
  for (const token of tokens) {
    ors.push({ title: { contains: token, mode: 'insensitive' } });
    ors.push({ description: { contains: token, mode: 'insensitive' } });
    ors.push({ metaKeywords: { has: token } });
  }

  const priceFilter = {};
  if (Number.isFinite(Number(memory.budgetMin))) {
    priceFilter.gte = Number(memory.budgetMin);
  }
  if (Number.isFinite(Number(memory.budgetMax))) {
    priceFilter.lte = Number(memory.budgetMax);
  }

  return {
    deletedAt: null,
    status: 'ACTIVE',
    ...(ors.length > 0 ? { OR: ors } : {}),
    ...(Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {}),
  };
}

function normalizeMemory(previousMemory = {}, extracted = {}, intent) {
  return {
    ...previousMemory,
    ...extracted,
    lastIntent: intent,
  };
}

function buildQuickActions({ products, orders, intent, orderNumber }) {
  const actions = [];
  if (products.length > 0) {
    const top = products[0];
    actions.push({
      type: 'view_product',
      label: `Xem ${top.title}`,
      productId: top.id,
      route: `/products/${top.id}`,
    });
    actions.push({
      type: 'add_to_cart',
      label: 'Thêm vào giỏ',
      productId: top.id,
    });
  }

  if (orders.length > 0) {
    const latest = orders[0];
    actions.push({
      type: 'view_order_detail',
      label: `Xem đơn ${latest.orderNumber}`,
      orderId: latest.id,
      route: `/orders/${latest.id}`,
    });
  } else if (intent === 'order_support' || orderNumber) {
    actions.push({
      type: 'view_orders',
      label: 'Xem danh sách đơn',
      route: '/orders',
    });
  }

  actions.push({
    type: 'open_marketplace',
    label: 'Mở Marketplace',
    route: '/marketplace',
  });

  if (intent === 'support') {
    actions.push({
      type: 'open_messages',
      label: 'Liên hệ hỗ trợ',
      route: '/messages',
    });
  }

  return actions.slice(0, 4);
}

function summarizeProducts(products) {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    price: Number(product.price || 0),
    priceText: formatPriceVnd(product.price),
    stockQuantity: product.trackInventory ? product.stockQuantity : null,
    category: product.categories?.[0]?.name || null,
    sellerName: product.seller?.fullName || product.seller?.username || null,
    imageUrl: product.images?.[0]?.imageUrl || null,
    slug: product.slug,
  }));
}

function summarizeOrders(orders) {
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total || 0),
    totalText: formatPriceVnd(order.total),
    createdAt: order.createdAt,
  }));
}

function buildPrompt({ message, history, intent, memory, productContext, orderContext }) {
  const compactHistory = history
    .slice(-CHAT_HISTORY_MAX)
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
    .join('\n');

  return `You are SoCo Shopping Assistant for a Vietnamese social commerce platform.
Respond in natural Vietnamese, concise and practical.
Never invent data not in context. If data is missing, say it clearly and ask a follow-up.

Current intent: ${intent}
Session memory: ${JSON.stringify(memory)}

Recent chat:
${compactHistory || 'No previous history.'}

User message:
${message}

Product context (JSON):
${JSON.stringify(productContext)}

Order context (JSON):
${JSON.stringify(orderContext)}

Return STRICT JSON object only with this shape:
{
  "reply": "string",
  "followUps": ["string", "string"],
  "memoryPatch": {
    "budgetMin": "number or null",
    "budgetMax": "number or null",
    "preferredCategory": "string or null",
    "shoppingGoal": "string or null"
  }
}`;
}

function parseAssistantJson(rawText) {
  const text = String(rawText || '').trim();

  const directTry = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const stripCodeFence = (value) => {
    const fenced = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fenced ? fenced[1].trim() : value;
  };

  const pickLikelyJsonObject = (value) => {
    const start = value.indexOf('{');
    const end = value.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return value.slice(start, end + 1);
    }
    return value;
  };

  const parsedCandidate =
    directTry(text) ||
    directTry(stripCodeFence(text)) ||
    directTry(pickLikelyJsonObject(stripCodeFence(text)));

  try {
    const parsed = parsedCandidate;
    if (parsed && typeof parsed === 'object') {
      return {
        reply: typeof parsed.reply === 'string' ? parsed.reply : text,
        followUps: Array.isArray(parsed.followUps)
          ? parsed.followUps.filter((item) => typeof item === 'string').slice(0, 3)
          : [],
        memoryPatch:
          parsed.memoryPatch && typeof parsed.memoryPatch === 'object'
            ? parsed.memoryPatch
            : {},
      };
    }
  } catch {
    // fallthrough
  }
  return {
    reply: text,
    followUps: [],
    memoryPatch: {},
  };
}

class AiAssistantService {
  async chat({ userId, message, history = [], memory = {} }) {
    const safeMessage = normalizeText(message);
    if (!safeMessage) {
      throw new Error('Message is required');
    }

    const intent = detectIntent(safeMessage);
    const orderNumber = extractOrderNumber(safeMessage);
    const extractedBudget = parseBudgetVnd(safeMessage);
    const nextMemory = normalizeMemory(memory, extractedBudget, intent);

    const tokens = toSlugTokens(safeMessage);
    const productsRaw = await prisma.product.findMany({
      where: buildProductWhere(tokens, nextMemory),
      include: {
        images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        categories: { select: { id: true, name: true } },
        seller: { select: { id: true, username: true, fullName: true } },
      },
      orderBy: [{ salesCount: 'desc' }, { createdAt: 'desc' }],
      take: PRODUCT_LIMIT,
    });

    const orderWhere = {
      buyerId: userId,
      ...(orderNumber ? { orderNumber } : {}),
    };

    const ordersRaw = await prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: 'desc' },
      take: ORDER_LIMIT,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
      },
    });

    const products = summarizeProducts(productsRaw);
    const orders = summarizeOrders(ordersRaw);

    const llm = getLlmClient();
    const prompt = buildPrompt({
      message: safeMessage,
      history,
      intent,
      memory: nextMemory,
      productContext: products,
      orderContext: orders,
    });

    let generated = '';
    try {
      const result = await llm.generate({ text: prompt });
      generated = String(result?.text || '').trim();
    } catch (error) {
      generated = `Mình chưa truy cập được AI lúc này. Đây là thông tin nhanh: ${
        products[0]
          ? `${products[0].title} giá ${products[0].priceText}.`
          : 'Hiện chưa có sản phẩm phù hợp theo yêu cầu.'
      }`;
    }

    const parsed = parseAssistantJson(generated);
    const mergedMemory = {
      ...nextMemory,
      ...(parsed.memoryPatch || {}),
    };

    return {
      reply: parsed.reply,
      followUps: parsed.followUps,
      quickActions: buildQuickActions({ products, orders, intent, orderNumber }),
      memory: mergedMemory,
      cards: {
        products,
        orders,
      },
      meta: {
        intent,
        matchedProducts: products.length,
        matchedOrders: orders.length,
      },
    };
  }
}

export default new AiAssistantService();
