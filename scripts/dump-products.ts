import { prisma } from "../apps/server/src/database/prisma.js";

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  console.log(
    JSON.stringify(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category.name,
        description: p.description,
        features: p.features,
        price: Number(p.price),
      })),
    ),
  );
  await prisma.$disconnect();
}
main();
