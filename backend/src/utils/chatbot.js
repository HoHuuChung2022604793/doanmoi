const OpenAI = require('openai');
const Groq = require('groq-sdk');
const Product = require('../models/Product');

let openai, groq;

const initAI = () => {
  const gkey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;
  const okey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : null;
  if (gkey && gkey.startsWith('gsk_')) { groq = new Groq({ apiKey: gkey }); }
  if (okey && okey.startsWith('sk-')) { openai = new OpenAI({ apiKey: okey }); }
};
initAI();

const PRODUCT_FIELDS = 'name price brand specs description sold rating numReviews thumbnail images _id';

// === BỘ QUY TẮC PHẢN HỒI (INTENT RULES) ===
const CHATBOT_RULES = [
  { keywords: ["chơi game", "gaming", "máy mạnh", "fps", "chip khỏe"], rule: "Ưu tiên tư vấn điện thoại có chip mạnh (Snapdragon 8, Apple A17), màn hình 120Hz, pin lớn và tản nhiệt tốt. Gợi ý thêm sản phẩm bán chạy." },
  { keywords: ["chụp ảnh", "camera", "selfie", "quay phim", "vlog"], rule: "Ưu tiên tư vấn camera tốt, chống rung OIS, chụp đêm ổn và camera trước đẹp." },
  { keywords: ["pin trâu", "pin khỏe", "dùng lâu", "sạc nhanh"], rule: "Ưu tiên sản phẩm pin từ 5000mAh trở lên, sạc nhanh và tiết kiệm pin." },
  { keywords: ["iphone hay samsung", "iphone vs samsung", "so sánh"], rule: "So sánh theo các tiêu chí: hiệu năng, camera, pin, hệ điều hành và giá." },
  { keywords: ["bán chạy", "hot", "best seller", "phổ biến"], rule: "Ưu tiên hiển thị sản phẩm có lượt mua cao và đánh giá tốt." },
  { keywords: ["dưới 5 triệu", "giá rẻ", "sinh viên", "tiết kiệm"], rule: "Tư vấn theo ngân sách khách hàng và ưu tiên sản phẩm giá tốt nhất." },
  { keywords: ["trả góp", "0%", "thanh toán dần"], rule: "Giới thiệu hỗ trợ trả góp qua thẻ tín dụng hoặc công ty tài chính, điều kiện đơn giản (CCCD)." },
  { keywords: ["ship", "giao hàng", "bao lâu nhận được"], rule: "Giao hàng siêu tốc 2h tại nội thành, 2-3 ngày đối với các tỉnh thành khác." },
  { keywords: ["bảo hành", "đổi trả", "lỗi sản phẩm"], rule: "Bảo hành 12 tháng phần cứng, 1 đổi 1 trong 30 ngày nếu có lỗi từ NSX." },
  { keywords: ["vnpay", "qr", "chuyển khoản", "thanh toán"], rule: "Hướng dẫn khách thanh toán bằng VNPay, QR ngân hàng để nhận thêm ưu đãi giảm giá." },
  { keywords: ["mới hay cũ", "chính hãng", "nguồn gốc"], rule: "Cam kết 100% hàng chính hãng, đầy đủ hóa đơn, có cả máy mới Fullbox và máy lướt đẹp 99%." },
  { keywords: ["đáng mua nhất", "nên mua con nào"], rule: "Ưu tiên sản phẩm có hiệu năng/giá (P/P) tốt nhất hiện nay." },
  { keywords: ["sinh viên", "học tập", "văn phòng"], rule: "Ưu tiên pin tốt, ổn định, giá hợp lý và camera đủ dùng." },
  { keywords: ["livestream", "tiktok", "quay video"], rule: "Ưu tiên camera chống rung tốt, mic thu âm ổn và pin khỏe." },
  { keywords: ["mạnh nhất", "flagship", "khủng nhất"], rule: "Ưu tiên flagship mới nhất (S24 Ultra, iPhone 15 Pro Max) và benchmark cao." },
  { keywords: ["ít nóng", "mát máy"], rule: "Ưu tiên chip tối ưu điện năng (Snapdragon 8 Gen 2/3) và hệ thống tản nhiệt tốt." },
  { keywords: ["khuyến mãi", "sale", "giảm giá"], rule: "Hiển thị sản phẩm đang giảm giá sâu hoặc có quà tặng đi kèm." },
  { keywords: ["địa chỉ", "cửa hàng ở đâu", "hotline"], rule: "Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM. Hotline: 0909.123.456. Mở cửa: 8h00 - 21h30." }
];

// === HELPERS ===
const parsePrice = (msg) => {
  let minPrice = null, maxPrice = null;
  const rangeMatch = msg.match(/(?:từ|tu)\s*(\d+)\s*(?:đến|den|-)\s*(\d+)\s*(?:triệu|tr|m)/i);
  if (rangeMatch) return { minPrice: parseInt(rangeMatch[1]) * 1000000, maxPrice: parseInt(rangeMatch[2]) * 1000000 };
  const underMatch = msg.match(/(?:dưới|duoi|under|<)\s*(\d+)\s*(?:triệu|tr|m)/i);
  if (underMatch) return { minPrice: null, maxPrice: parseInt(underMatch[1]) * 1000000 };
  const aroundMatch = msg.match(/(?:tầm|tam|khoảng|khoang|giá|gia)\s*(\d+)\s*(?:triệu|tr|m)/i);
  if (aroundMatch) {
    const base = parseInt(aroundMatch[1]) * 1000000;
    return { minPrice: Math.floor(base * 0.7), maxPrice: Math.ceil(base * 1.3) };
  }
  return { minPrice, maxPrice };
};

const getBotResponse = async (message, context = {}) => {
  if (!groq && !openai) initAI();
  const msgLower = message.toLowerCase();
  const history = context.history || [];
  
  try {
    let foundProducts = [];
    let detectedRules = [];
    
    // 1. Nhận diện Quy tắc dựa trên Keywords
    CHATBOT_RULES.forEach(r => {
      if (r.keywords.some(k => msgLower.includes(k))) {
        detectedRules.push(r.rule);
      }
    });

    const { minPrice, maxPrice } = parsePrice(msgLower);
    const brands = ['iphone', 'samsung', 'oppo', 'xiaomi', 'vivo', 'realme', 'huawei', 'sony', 'google'];
    const detectedBrand = brands.find(b => msgLower.includes(b));

    // 2. Truy vấn Database dựa trên tiêu chí
    const query = { isActive: true };
    if (detectedBrand) query.brand = { $regex: detectedBrand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Ưu tiên sắp xếp theo nhu cầu (nếu có từ khóa hot/bán chạy)
    let sort = { sold: -1, rating: -1 };
    if (msgLower.includes('đánh giá') || msgLower.includes('tốt nhất')) sort = { rating: -1, sold: -1 };

    foundProducts = await Product.find(query).sort(sort).limit(5).select(PRODUCT_FIELDS);

    // Nếu vẫn trống, tìm theo từ khóa tự do
    if (foundProducts.length === 0) {
      const keywords = message.replace(/giá|bao nhiêu|tìm|mua|tư vấn|máy/gi, '').trim();
      if (keywords.length > 2) {
        foundProducts = await Product.find({
          $or: [{ name: { $regex: keywords, $options: 'i' } }, { brand: { $regex: keywords, $options: 'i' } }],
          isActive: true
        }).limit(5).select(PRODUCT_FIELDS);
      }
    }

    // 3. Xây dựng System Prompt với Quy tắc đã nhận diện
    const systemPrompt = `Bạn là Chung, chuyên gia tư vấn tại Chung Mobile. 
PHONG CÁCH: Thân thiện, chuyên nghiệp, dùng "ạ", "nha".

QUY TẮC CỤ THỂ CHO CÂU HỎI NÀY:
${detectedRules.length > 0 ? detectedRules.map(r => `- ${r}`).join('\n') : 'Tư vấn nhiệt tình dựa trên nhu cầu khách hàng.'}

🛍️ DỮ LIỆU SẢN PHẨM HIỆN CÓ:
${foundProducts.length > 0 ? foundProducts.map(p => `
- ${p.name}: ${new Intl.NumberFormat('vi-VN').format(p.price)}đ. Chip: ${p.specs.cpu}, RAM: ${p.specs.ram}, Pin: ${p.specs.battery}. Link: [**Xem chi tiết & Mua ngay**](/products/${p._id})`).join('') : 'Dạ hiện mốc này bên mình đang cập nhật thêm hàng mới ạ.'}

LƯU Ý: Tuyệt đối không được bịa giá hay thông số. Luôn giữ link sản phẩm.`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map(h => ({
        role: h.sender.email === 'chatbot@chungmobile.com' ? 'assistant' : 'user',
        content: h.content
      })),
      { role: "user", content: message }
    ];

    let aiResponse = null;
    if (groq) {
      const completion = await groq.chat.completions.create({
        messages: chatMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
      });
      aiResponse = completion.choices[0]?.message?.content;
    }

    return {
      text: aiResponse || `Dạ Chung nghe đây ạ, bạn cần hỗ trợ gì thêm không nha?`,
      suggestedProducts: foundProducts.map(p => ({
        _id: p._id, name: p.name, price: p.price, brand: p.brand,
        thumbnail: p.thumbnail || (p.images?.length > 0 ? p.images[0] : ''),
        rating: p.rating, numReviews: p.numReviews, sold: p.sold
      }))
    };
  } catch (err) {
    return { text: 'Dạ Chung đang gặp chút trục trặc, bạn nhắn lại giúp nha! ✅', suggestedProducts: [] };
  }
};

module.exports = { getBotResponse };
