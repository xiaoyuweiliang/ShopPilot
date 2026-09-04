import { prisma } from "../apps/server/src/database/prisma.js";
import { embeddingService } from "../apps/server/src/modules/ai/embedding.service.js";

function buildProductText(product: {
  name: string;
  description: string | null;
  features: string[];
  category: { name: string };
}): string {
  return [
    `商品名称：${product.name}`,
    `分类：${product.category.name}`,
    `描述：${product.description ?? ""}`,
    `特点：${product.features.join("\n")}`,
  ].join("\n");
}

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });

  for (const product of products) {
    const text = buildProductText(product);
    const vector = await embeddingService.embed(text);
    console.log(`Embedded ${product.name}: ${vector.length} dims`);
    // TODO: upsert into Qdrant
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
