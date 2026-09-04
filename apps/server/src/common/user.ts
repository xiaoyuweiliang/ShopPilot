import { prisma } from "../database/prisma.js";

export const MOCK_USER_ID = "mock-user";

export async function ensureMockUser() {
  await prisma.user.upsert({
    where: { id: MOCK_USER_ID },
    update: {},
    create: {
      id: MOCK_USER_ID,
      nickname: "测试用户",
      avatar: "",
    },
  });
}
