import { prisma } from "../apps/server/src/database/prisma.js";
import { ensureMockUser } from "../apps/server/src/common/user.js";

const CATEGORIES = [
  "耳机",
  "跑鞋",
  "笔记本",
  "背包",
  "手机",
  "智能手表",
  "键盘",
  "鼠标",
  "显示器",
  "护肤",
];

interface SeedProduct {
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  stock: number;
  description: string;
  features: string[];
  specs: { specName: string; specValue: string }[];
}

const BRANDS: Record<string, string[]> = {
  耳机: ["索尼", "BOSE", "苹果", "小米", "华为", "漫步者", "JBL", "森海塞尔"],
  跑鞋: ["耐克", "阿迪达斯", "亚瑟士", "新百伦", "李宁", "安踏", "特步", "匹克"],
  笔记本: ["苹果", "联想", "戴尔", "惠普", "华硕", "小米", "华为", "微软"],
  背包: ["新秀丽", "小米", "国家地理", "Osprey", "Targus", "外交官", "北极狐", "jansport"],
  手机: ["苹果", "华为", "小米", "OPPO", "vivo", "三星", "一加", "荣耀"],
  智能手表: ["苹果", "华为", "小米", "Garmin", "三星", "OPPO", "Amazfit", "Fitbit"],
  键盘: ["罗技", "樱桃", "雷蛇", "Keychron", "IKBC", "达尔优", "腹灵", "宁芝"],
  鼠标: ["罗技", "雷蛇", "雷柏", "达尔优", "ROG", "赛睿", "卓威", "微软"],
  显示器: ["戴尔", "LG", "三星", "华硕", "AOC", "飞利浦", "明基", "小米"],
  护肤: ["兰蔻", "雅诗兰黛", "SK-II", "欧莱雅", "珀莱雅", "薇诺娜", "理肤泉", "科颜氏"],
};

const DESCRIPTION_TEMPLATES: Record<string, string[]> = {
  耳机: [
    "主动降噪，沉浸式聆听体验",
    "轻量化设计，长时间佩戴舒适",
    "高解析音质，还原音乐细节",
    "运动防水，稳固佩戴不掉落",
    "低延迟游戏模式，听声辨位更精准",
  ],
  跑鞋: [
    "缓震回弹，保护膝关节",
    "透气网面，夏季跑步不闷脚",
    "耐磨橡胶大底，抓地力强",
    "轻量竞速，马拉松训练首选",
    "稳定支撑，适合足外翻跑者",
  ],
  笔记本: [
    "轻薄便携，移动办公利器",
    "高性能独显，游戏创作两不误",
    "长续航电池，出差无需带充电器",
    "高色域屏幕，设计修图更精准",
    "接口丰富，扩展性出色",
  ],
  背包: [
    "多隔层设计，收纳井井有条",
    "防泼水面料，雨天出行无忧",
    "减负背负系统，长时间背负不累",
    "商务通勤，简约大气",
    "大容量主仓，短途旅行一包搞定",
  ],
  手机: [
    "旗舰影像系统，随手拍出大片",
    "高刷新率屏幕，滑动更丝滑",
    "超级快充，告别电量焦虑",
    "轻薄手感，单手握持无压力",
    "双扬声器立体声，影音体验出色",
  ],
  智能手表: [
    "全天候健康监测，守护每一次心跳",
    "精准GPS定位，运动轨迹清晰记录",
    "超长续航，一周一充无压力",
    "独立通话，跑步不带手机也能接",
    "百种运动模式，专业运动伴侣",
  ],
  键盘: [
    "机械轴体，手感干脆利落",
    "热插拔设计，随心更换轴体",
    "RGB背光，电竞氛围拉满",
    "静音轴体，办公不扰人",
    "三模连接，多设备无缝切换",
  ],
  鼠标: [
    "轻量化设计，长时间使用不累手",
    "高精度传感器，指哪打哪",
    "人体工学造型，贴合掌心",
    "无线低延迟，电竞级响应",
    "多按键可编程，办公效率翻倍",
  ],
  显示器: [
    "4K超清分辨率，画面细腻逼真",
    "高刷新率电竞屏，流畅无拖影",
    "IPS广视角，色彩还原准确",
    "护眼低蓝光，长时间办公不伤眼",
    "Type-C一线连，桌面更整洁",
  ],
  护肤: [
    "深层补水，改善干燥起皮",
    "提亮肤色，改善暗沉",
    "温和修护，敏感肌可用",
    "控油祛痘，清爽不油腻",
    "抗初老配方，紧致细腻肌肤",
  ],
};

const FEATURE_TEMPLATES: Record<string, string[]> = {
  耳机: ["蓝牙5.3", "主动降噪", "30小时续航", "IPX5防水", "通透模式", "空间音频", "低延迟", "多设备连接"],
  跑鞋: ["缓震中底", "透气鞋面", "耐磨大底", "轻量化", "足弓支撑", "反光设计", "易穿脱", "Ortholite鞋垫"],
  笔记本: ["16GB内存", "512GB固态", "高色域屏", "背光键盘", "指纹识别", "Wi-Fi 6", "全金属机身", "雷电接口"],
  背包: ["防泼水", "独立电脑仓", "USB充电口", "防盗暗袋", "行李箱插带", "YKK拉链", "减压肩带", "多功能隔层"],
  手机: ["5G全网通", "120Hz高刷", "快充", "OIS防抖", "双扬声器", "NFC", "红外遥控", "屏下指纹"],
  智能手表: ["心率监测", "血氧检测", "睡眠监测", "GPS定位", "50米防水", "NFC支付", "语音助手", "长续航"],
  键盘: ["机械轴", "RGB背光", "热插拔", "PBT键帽", "消音棉", "三模连接", "宏编程", "磁吸手托"],
  鼠标: ["无线2.4G", "蓝牙双模", "16000DPI", "轻量化", "Type-C充电", "防滑侧裙", "自定义按键", "电竞传感器"],
  显示器: ["4K分辨率", "144Hz刷新率", "IPS面板", "HDR400", "Type-C供电", "旋转升降支架", "低蓝光", "广色域"],
  护肤: ["玻尿酸", "烟酰胺", "维生素C", "神经酰胺", "积雪草", "透明质酸", "无香精", "温和配方"],
};

const SPEC_TEMPLATES: Record<string, Record<string, string[]>> = {
  耳机: { 重量: ["180g", "220g", "250g", "280g", "310g"], 续航: ["20小时", "30小时", "40小时", "50小时"], 防水: ["IPX4", "IPX5", "IPX6"] },
  跑鞋: { 重量: ["220g", "250g", "280g", "300g", "330g"], 适用场景: ["日常训练", "马拉松", "慢跑", "竞速"], 闭合方式: ["系带", "一脚蹬", "魔术贴"] },
  笔记本: { 重量: ["1.2kg", "1.4kg", "1.6kg", "1.8kg", "2.1kg"], 屏幕: ["13.3英寸", "14英寸", "15.6英寸", "16英寸"], 内存: ["8GB", "16GB", "32GB"] },
  背包: { 容量: ["15L", "20L", "25L", "30L", "35L"], 材质: ["尼龙", "涤纶", "帆布", "皮革"], 适用: ["通勤", "旅行", "学生", "商务"] },
  手机: { 屏幕: ["6.1英寸", "6.5英寸", "6.7英寸", "6.8英寸"], 电池: ["4500mAh", "5000mAh", "5500mAh"], 充电: ["67W", "80W", "120W"] },
  智能手表: { 重量: ["32g", "38g", "45g", "52g"], 续航: ["7天", "10天", "14天"], 防水: ["5ATM", "IP68"] },
  键盘: { 轴体: ["红轴", "茶轴", "青轴", "银轴"], 配列: ["61键", "68键", "87键", "104键"], 连接: ["有线", "蓝牙", "2.4G"] },
  鼠标: { 重量: ["58g", "65g", "75g", "85g", "95g"], DPI: ["8000", "12000", "16000", "26000"], 连接: ["有线", "无线", "三模"] },
  显示器: { 尺寸: ["24英寸", "27英寸", "32英寸"], 分辨率: ["1080P", "2K", "4K"], 刷新率: ["60Hz", "144Hz", "165Hz", "240Hz"] },
  护肤: { 容量: ["30ml", "50ml", "100ml", "150ml"], 肤质: ["干性", "油性", "混合性", "敏感性"], 功效: ["补水", "美白", "抗衰", "修护"] },
};

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function generateProducts(): SeedProduct[] {
  const products: SeedProduct[] = [];

  for (const category of CATEGORIES) {
    const brands = BRANDS[category];
    const descriptions = DESCRIPTION_TEMPLATES[category];
    const features = FEATURE_TEMPLATES[category];
    const specs = SPEC_TEMPLATES[category];

    for (let i = 0; i < 9; i++) {
      const brand = pick(brands, i);
      const modelSuffix = `${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1 || ""}`;
      const name = `${brand} ${category}${modelSuffix}`;
      const description = pick(descriptions, i + category.length);

      const featureSet: string[] = [];
      for (let f = 0; f < 4; f++) {
        featureSet.push(pick(features, i + f + category.length));
      }

      const specList: { specName: string; specValue: string }[] = [];
      const specNames = Object.keys(specs);
      for (let s = 0; s < specNames.length; s++) {
        const specName = specNames[s];
        specList.push({ specName, specValue: pick(specs[specName], i + s) });
      }

      products.push({
        name,
        category,
        brand,
        price: 100 + Math.floor(Math.random() * 50) * 10 + (category === "笔记本" ? 4000 : category === "手机" ? 2000 : category === "显示器" ? 1000 : 0),
        rating: Number((3.8 + Math.random() * 1.4).toFixed(1)),
        stock: Math.floor(Math.random() * 200) + 20,
        description,
        features: featureSet,
        specs: specList,
      });
    }
  }

  return products;
}

const PRODUCTS = generateProducts();

async function main() {
  await ensureMockUser();

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat },
    });
  }

  for (const product of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { name: product.category } });
    if (!category) continue;

    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    const productData = {
      name: product.name,
      categoryId: category.id,
      brand: product.brand,
      price: product.price,
      rating: product.rating,
      stock: product.stock,
      description: product.description,
      features: product.features,
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: productData,
      });
      await prisma.productSpec.deleteMany({ where: { productId: existing.id } });
      await prisma.productSpec.createMany({
        data: product.specs.map((spec) => ({ ...spec, productId: existing.id })),
      });
    } else {
      await prisma.product.create({
        data: {
          ...productData,
          specs: { create: product.specs },
        },
      });
    }
  }

  console.log(`Imported ${PRODUCTS.length} products.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
