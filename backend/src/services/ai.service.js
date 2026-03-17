import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemma-3-1b-it';

const normalizeSuggestions = (text) => {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cleaned = lines
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter((line) => line.length >= 10);

  const uniq = [];
  for (const line of cleaned) {
    if (!uniq.includes(line)) {
      uniq.push(line);
    }
  }

  if (uniq.length >= 3) {
    return uniq.slice(0, 3);
  }

  if (text?.trim()) {
    return [text.trim()];
  }

  return [];
};

const buildPrompt = ({ idea, productDescription, tone, goal, productImageUrls, productContext }) => {
  return [
    'Bạn là copywriter cho social commerce tại Việt Nam.',
    'Hãy tạo 3 phiên bản caption bán hàng bằng tiếng Việt, tự nhiên, không thổi phồng sai sự thật.',
    'Mỗi caption 1-3 câu, có CTA rõ ràng.',
    'Không dùng markdown, không dùng emoji quá nhiều (toi da 2 emoji/caption).',
    'Tra ve dung dinh dang:',
    '1) ...',
    '2) ...',
    '3) ...',
    '',
    `Y tuong chinh: ${idea}`,
    productDescription ? `Mo ta san pham: ${productDescription}` : null,
    goal ? `Muc tieu bai viet: ${goal}` : null,
    tone ? `Giong van mong muon: ${tone}` : null,
    productImageUrls?.length ? `So anh dau vao: ${productImageUrls.length}` : null,
    productContext ? `Thong tin san pham trong he thong: ${productContext}` : null,
  ]
    .filter(Boolean)
    .join('\n');
};

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return new GoogleGenerativeAI(apiKey);
};

const parseBudgetFromMessage = (message) => {
  const text = String(message || '').toLowerCase();

  const millionMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(trieu|triệu|m)/i);
  if (millionMatch) {
    const value = Number(millionMatch[1].replace(',', '.'));
    if (!Number.isNaN(value)) {
      return Math.round(value * 1000000);
    }
  }

  const thousandMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(k|nghin|nghìn)/i);
  if (thousandMatch) {
    const value = Number(thousandMatch[1].replace(',', '.'));
    if (!Number.isNaN(value)) {
      return Math.round(value * 1000);
    }
  }

  const rawNumber = text.match(/(\d{5,9})/);
  if (rawNumber) {
    return Number(rawNumber[1]);
  }

  return null;
};

const detectIntent = (message) => {
  const text = String(message || '').toLowerCase();
  if (/so sanh|so sánh|khac nhau|khác nhau/.test(text)) return 'compare';
  if (/con hang|còn hàng|ton kho|tồn kho|size|mau|màu|kieu|kiểu|variant/.test(text)) return 'stock';
  if (/goi y|gợi ý|de xuat|đề xuất|tu van|tư vấn|tim giup|tìm giúp/.test(text)) return 'recommend';
  return 'recommend';
};

const summarizeVariants = (variants = []) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [];
  }

  const summary = [];
  for (const variant of variants.slice(0, 5)) {
    const options = variant.options && typeof variant.options === 'object' ? variant.options : {};
    const optionText = Object.entries(options)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join('/') : value}`)
      .join(', ');

    summary.push({
      id: variant.id,
      name: variant.variantName,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
      options: optionText,
    });
  }

  return summary;
};

const normalizeProductCards = (products = []) => {
  return products.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    price: Number(item.price),
    stockQuantity: item.stockQuantity,
    status: item.status,
    imageUrl: item.images?.[0]?.imageUrl || null,
    category: item.category?.name || null,
    seller: item.seller
      ? {
          id: item.seller.id,
          fullName: item.seller.fullName,
          username: item.seller.username,
        }
      : null,
    variants: summarizeVariants(item.variants),
  }));
};

export const buyerAssistantChat = async (userId, payload) => {
  const message = String(payload.message || '').trim();
  const productId = payload.productId || null;

  const intent = detectIntent(message);
  const budget = parseBudgetFromMessage(message);

  let categoryId = null;
  const lowerMsg = message.toLowerCase();
  const matchedCategory = await prisma.category.findFirst({
    where: {
      isActive: true,
      OR: [
        { name: { contains: lowerMsg, mode: 'insensitive' } },
        { slug: { contains: lowerMsg, mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  });

  if (matchedCategory) {
    categoryId = matchedCategory.id;
  }

  const productWhere = {
    status: 'ACTIVE',
    ...(budget ? { price: { lte: budget } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(message
      ? {
          OR: [
            { title: { contains: message, mode: 'insensitive' } },
            { description: { contains: message, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  let candidates = await prisma.product.findMany({
    where: productWhere,
    take: 8,
    orderBy: [{ salesCount: 'desc' }, { viewsCount: 'desc' }, { createdAt: 'desc' }],
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { imageUrl: true },
      },
      category: {
        select: { name: true },
      },
      seller: {
        select: { id: true, fullName: true, username: true },
      },
      variants: {
        where: { isActive: true },
        take: 5,
        select: {
          id: true,
          variantName: true,
          stockQuantity: true,
          options: true,
          isActive: true,
        },
      },
    },
  });

  // Fallback broad query if strict text match returns nothing.
  if (candidates.length === 0) {
    candidates = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(budget ? { price: { lte: budget } } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      take: 8,
      orderBy: [{ salesCount: 'desc' }, { viewsCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
        category: {
          select: { name: true },
        },
        seller: {
          select: { id: true, fullName: true, username: true },
        },
        variants: {
          where: { isActive: true },
          take: 5,
          select: {
            id: true,
            variantName: true,
            stockQuantity: true,
            options: true,
            isActive: true,
          },
        },
      },
    });
  }

  if (productId) {
    const source = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (source?.categoryId) {
      const similar = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          categoryId: source.categoryId,
          id: { not: productId },
        },
        take: 3,
        orderBy: [{ salesCount: 'desc' }, { viewsCount: 'desc' }],
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { imageUrl: true },
          },
          category: {
            select: { name: true },
          },
          seller: {
            select: { id: true, fullName: true, username: true },
          },
          variants: {
            where: { isActive: true },
            take: 5,
            select: {
              id: true,
              variantName: true,
              stockQuantity: true,
              options: true,
              isActive: true,
            },
          },
        },
      });

      candidates = [...candidates, ...similar].slice(0, 8);
    }
  }

  const cards = normalizeProductCards(candidates);

  let reply = '';
  if (cards.length === 0) {
    reply = 'Mình chưa tìm thấy sản phẩm phù hợp ngay lúc này. Bạn có thể cho mình thêm mức giá, loại sản phẩm hoặc kiểu bạn cần nhé.';
  } else if (intent === 'stock') {
    const top = cards[0];
    const variantNote = top.variants.length
      ? `Biến thể nổi bật: ${top.variants
          .map((v) => `${v.name} (${v.stockQuantity})`)
          .join('; ')}.`
      : 'Sản phẩm hiện chưa có biến thể chi tiết.';

    reply = `Mình đã kiểm tra nhanh tồn kho. ${top.title} hiện còn khoảng ${top.stockQuantity} sản phẩm. ${variantNote}`;
  } else if (intent === 'compare' && cards.length >= 2) {
    const a = cards[0];
    const b = cards[1];
    reply = `Mình gợi ý so sánh nhanh: ${a.title} (${a.price.toLocaleString('vi-VN')}đ, còn ${a.stockQuantity}) và ${b.title} (${b.price.toLocaleString('vi-VN')}đ, còn ${b.stockQuantity}). Nếu bạn muốn, mình sẽ lọc tiếp theo ưu tiên giá hoặc tồn kho.`;
  } else {
    const budgetText = budget ? ` dưới ${budget.toLocaleString('vi-VN')}đ` : '';
    reply = `Mình đã chọn một số sản phẩm phù hợp${budgetText} và đang bán tốt. Bạn xem danh sách bên dưới, nếu muốn mình lọc thêm theo màu/size/kiểu thì nói mình biết nhé.`;
  }

  return {
    intent,
    reply,
    products: cards,
    followUpSuggestions: [
      'Lọc thêm theo mức giá thấp hơn',
      'Kiểm tra tồn kho theo size hoặc màu',
      'So sánh 2 sản phẩm đầu tiên',
    ],
  };
};

export const generatePostText = async (userId, payload) => {
  const {
    idea,
    productDescription,
    tone = 'friendly',
    goal = 'tang ty le chuyen doi',
    productImageUrls = [],
    productId,
  } = payload;

  let productContext = '';
  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        stockQuantity: true,
        status: true,
      },
    });

    if (product) {
      productContext = `title=${product.title}; price=${product.price}; stock=${product.stockQuantity}; status=${product.status}; description=${product.description || ''}`;
    }
  }

  const prompt = buildPrompt({
    idea,
    productDescription,
    tone,
    goal,
    productImageUrls,
    productContext,
  });

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  const rawText = result.response?.text?.() || '';

  const suggestions = normalizeSuggestions(rawText);
  if (!suggestions.length) {
    throw new Error('AI generation failed to produce text');
  }

  await prisma.aiContentHistory.create({
    data: {
      userId,
      prompt,
      contentType: 'POST_TEXT',
      generatedContent: JSON.stringify({ suggestions }),
      usedForId: productId || null,
      usedForType: productId ? 'PRODUCT' : 'POST',
    },
  });

  return {
    suggestions,
    primary: suggestions[0],
    model: GEMINI_MODEL,
  };
};
