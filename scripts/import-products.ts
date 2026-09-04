import { prisma } from "../apps/server/src/database/prisma.js";

const CATEGORIES = [
  { name: "耳机" },
  { name: "跑鞋" },
  { name: "笔记本" },
  { name: "背包" },
];

const PRODUCTS = [
  {
    name: "XX 降噪蓝牙耳机",
    category: "耳机",
    brand: "XX",
    price: 299,
    rating: 4.8,
    stock: 100,
    description: "适合运动使用，支持主动降噪",
    features: ["主动降噪", "IPX5 防水", "30 小时续航"],
    specs: [
      { specName: "重量", specValue: "250g" },
      { specName: "续航", specValue: "30小时" },
      { specName: "防水", specValue: "IPX5" },
    ],
  },
  {
    name: "YY 运动蓝牙耳机",
    category: "耳机",
    brand: "YY",
    price: 199,
    rating: 4.6,
    stock: 80,
    description: "轻量化设计，跑步佩戴稳固",
    features: ["轻量化", "IPX4 防水", "20 小时续航"],
    specs: [
      { specName: "重量", specValue: "180g" },
      { specName: "续航", specValue: "20小时" },
      { specName: "防水", specValue: "IPX4" },
    ],
  },
  {
    name: "ZZ 专业跑鞋",
    category: "跑鞋",
    brand: "ZZ",
    price: 459,
    rating: 4.7,
    stock: 50,
    description: "缓震回弹，适合长距离跑步",
    features: ["缓震", "透气", "耐磨"],
    specs: [
      { specName: "重量", specValue: "280g" },
      { specName: "适用场景", specValue: "跑步" },
      { specName: "闭合方式", specValue: "系带" },
    ],
  },
  {
    name: "WW 轻薄笔记本",
    category: "笔记本",
    brand: "WW",
    price: 5299,
    rating: 4.5,
    stock: 30,
    description: "适合学生办公，轻薄便携",
    features: ["14英寸", "16GB内存", "512GB固态"],
    specs: [
      { specName: "重量", specValue: "1.3kg" },
      { specName: "屏幕", specValue: "14英寸" },
      { specName: "内存", specValue: "16GB" },
    ],
  },
];

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  for (const product of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { name: product.category } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: {
        name: product.name,
        categoryId: category.id,
        brand: product.brand,
        price: product.price,
        rating: product.rating,
        stock: product.stock,
        description: product.description,
        features: product.features,
        specs: { create: product.specs },
      },
    });
  }

  console.log("Products imported.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
import { prisma } from "../apps/server/src/database/prisma.js";
import { ensureMockUser } from "../apps/server/src/common/user.js";
async function main() {
  await ensureMockUser();

  for (const cat of CATEGORIES) {
