import { useEffect, useMemo, useState } from "react";
import { Slider, Pagination, Empty } from "antd";
import { SearchOutlined, FireFilled, DownOutlined } from "@ant-design/icons";
import { ProductCard } from "../../components/Product/ProductCard";
import { productService, type Category } from "../../services/product";
import type { Product } from "@eaa/types";

const SORT_OPTIONS = [
  { value: "ai-recommend", label: "✨ AI 推荐度最高 (精准匹配)" },
  { value: "hot-trend", label: "🔥 年轻人都在买 (好评优先)" },
  { value: "price-asc", label: "¥ 价格: 从低到高" },
  { value: "price-desc", label: "¥ 价格: 从高到低" },
];

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>();
  const [keyword, setKeyword] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sort, setSort] = useState("ai-recommend");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // 加载分类列表（用于顶部品类快捷筛选）
  useEffect(() => {
    productService.categories().then(setCategories).catch(() => undefined);
  }, []);

  // 筛选条件变化时从数据库查询商品
  useEffect(() => {
    productService
      .list({
        keyword: keyword || undefined,
        category,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        page,
        pageSize,
      })
      .then((res) => {
        setProducts(res.items);
        setTotal(res.total);
      });
  }, [keyword, category, priceRange, page, pageSize]);

  // 排序（当前页数据在前端排序，AI 推荐度使用接口默认顺序）
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "hot-trend") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [products, sort]);

  return (
    <div className="products-page">
      {/* 标题区 + 品类快捷筛选 */}
      <div className="products-header">
        <div>
          <div className="products-header-badge">
            <FireFilled />
            本周精选 AI 算法评分已更新
          </div>
          <h1 className="products-title">
            潮品选品矩阵
            <span className="products-count">实时在架 {total} 款</span>
          </h1>
        </div>
        <div className="products-category-pills">
          <button
            className={`category-pill${!category ? " category-pill-active" : ""}`}
            onClick={() => {
              setCategory(undefined);
              setPage(1);
            }}
          >
            全部品类
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`category-pill${category === c.name ? " category-pill-active" : ""}`}
              onClick={() => {
                setCategory(c.name);
                setPage(1);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 筛选控制栏 */}
      <div className="products-filter-bar">
        <div className="filter-search">
          <SearchOutlined className="filter-search-icon" />
          <input
            className="filter-search-input"
            placeholder="搜索商品名、品牌或 AI 标签..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="filter-price">
          <div className="filter-price-label">
            <span>
              价格预算区间：
              <b>
                ¥{priceRange[0]} - ¥{priceRange[1]}
              </b>
            </span>
            <span className="filter-price-badge">智能区间</span>
          </div>
          <Slider
            range
            min={0}
            max={5000}
            step={50}
            value={priceRange}
            onChange={(v) => {
              setPriceRange(v as [number, number]);
              setPage(1);
            }}
            tooltip={{ open: false }}
          />
        </div>
        <div className="filter-sort">
          <select
            className="filter-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <DownOutlined className="filter-sort-icon" />
        </div>
      </div>

      {/* 商品矩阵 */}
      {sortedProducts.length > 0 ? (
        <div className="products-grid">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Empty description="没有找到匹配的商品" style={{ padding: "60px 0" }} />
      )}

      {/* 分页 */}
      <div className="products-pagination">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}
