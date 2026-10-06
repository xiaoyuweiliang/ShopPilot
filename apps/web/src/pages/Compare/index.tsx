import { Fragment, useMemo, useState } from "react";
import { message, Empty } from "antd";
import {
  StarFilled,
  ShoppingCartOutlined,
  CloseOutlined,
  ThunderboltFilled,
  CrownFilled,
  TagFilled,
  RocketFilled,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

type Mode = "all" | "diff";

/** 根据评分推算 AI 推荐度 */
function aiScore(rating?: number): number {
  if (!rating) return 90;
  return Math.min(99, Math.round(80 + rating * 4));
}

interface MatrixRow {
  key: string;
  group: string;
  attr: string;
  values: string[];
  isDiff: boolean;
}

/** 汇总所有商品的规格参数，生成对比矩阵行 */
function buildMatrix(products: Product[]): MatrixRow[] {
  const rows: MatrixRow[] = [];
  const basics: [string, (p: Product) => string][] = [
    ["价格", (p) => `¥${p.price.toFixed(2)}`],
    ["用户评分", (p) => (p.rating ? `${p.rating} 分` : "-")],
    ["品牌", (p) => p.brand ?? "-"],
    ["分类", (p) => p.category ?? "-"],
    ["库存", (p) => `${p.stock} 件`],
  ];
  basics.forEach(([attr, get]) => {
    const values = products.map(get);
    rows.push({
      key: `basic-${attr}`,
      group: "基本规格",
      attr,
      values,
      isDiff: new Set(values).size > 1,
    });
  });

  const specNames = Array.from(
    new Set(products.flatMap((p) => (p.specs ?? []).map((s) => s.specName))),
  );
  specNames.forEach((name) => {
    const values = products.map(
      (p) => (p.specs ?? []).find((s) => s.specName === name)?.specValue ?? "-",
    );
    rows.push({
      key: `spec-${name}`,
      group: "详细参数",
      attr: name,
      values,
      isDiff: new Set(values).size > 1,
    });
  });
  return rows;
}

/** 五维能力量化数据（0-100，基于真实数据归一化） */
function buildDimensions(products: Product[]) {
  const maxPrice = Math.max(...products.map((p) => p.price), 1);
  const maxStock = Math.max(...products.map((p) => p.stock), 1);
  const maxFeatures = Math.max(...products.map((p) => p.features?.length ?? 0), 1);
  const defs: { name: string; score: (p: Product) => number }[] = [
    { name: "用户评分", score: (p) => Math.round(((p.rating ?? 4) / 5) * 100) },
    { name: "价格优势", score: (p) => Math.round((1 - p.price / maxPrice) * 60 + 40) },
    { name: "库存保障", score: (p) => Math.round((p.stock / maxStock) * 100) },
    { name: "功能亮点", score: (p) => Math.round(((p.features?.length ?? 0) / maxFeatures) * 100) },
    { name: "AI 推荐度", score: (p) => aiScore(p.rating) },
  ];
  return defs.map((d) => ({
    name: d.name,
    values: products.map((p) => Math.min(100, d.score(p))),
  }));
}

const PRODUCT_COLORS = ["#4f46e5", "#b4136d", "#0d9488"];

export function Compare() {
  const navigate = useNavigate();
  const compareList = useCartStore((s) => s.compareList);
  const clearCompare = useCartStore((s) => s.clearCompare);
  const toggleCompare = useCartStore((s) => s.toggleCompare);
  const addItem = useCartStore((s) => s.addItem);
  const [mode, setMode] = useState<Mode>("all");

  const matrix = useMemo(() => buildMatrix(compareList), [compareList]);
  const dimensions = useMemo(() => buildDimensions(compareList), [compareList]);
  const diffCount = matrix.filter((r) => r.isDiff).length;
  const visibleRows = mode === "diff" ? matrix.filter((r) => r.isDiff) : matrix;

  // AI 裁决：评分最高 / 价格最低 / 亮点最多
  const verdict = useMemo(() => {
    if (compareList.length === 0) return null;
    const best = [...compareList].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
    const cheapest = [...compareList].sort((a, b) => a.price - b.price)[0];
    const featured = [...compareList].sort(
      (a, b) => (b.features?.length ?? 0) - (a.features?.length ?? 0),
    )[0];
    return { best, cheapest, featured };
  }, [compareList]);

  if (compareList.length < 2) {
    return (
      <div className="compare-page">
        <div className="compare-empty">
          <Empty
            description={
              <>
                请至少选择 2 个商品进行对比
                <br />
                <span style={{ fontSize: 12 }}>在商品选品页点击商品卡片的"对比"按钮添加</span>
              </>
            }
          />
          <button className="compare-btn-primary" onClick={() => navigate("/products")}>
            去挑选商品
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      {/* 1. 顶部控制舱 */}
      <div className="compare-header">
        <div className="compare-header-badge">
          <ThunderboltFilled />
          PK MATRIX LAB · AI 深度解析已完成
        </div>
        <h1 className="compare-title">
          多维深度 PK 对比舱
          <span className="compare-title-count">{compareList.length} 款商品同台竞技</span>
        </h1>
        <div className="compare-mode-tabs">
          <button
            className={`compare-mode-tab${mode === "all" ? " compare-mode-tab-active" : ""}`}
            onClick={() => setMode("all")}
          >
            全部参数 ({matrix.length} 项)
          </button>
          <button
            className={`compare-mode-tab${mode === "diff" ? " compare-mode-tab-active" : ""}`}
            onClick={() => setMode("diff")}
          >
            仅看差异项 ({diffCount} 项)
          </button>
        </div>
      </div>

      {/* 2. AI 智能对比总结看板 */}
      {verdict && (
        <div className="compare-verdict-board">
          <div className="compare-verdict-card">
            <div className="compare-verdict-head">
              <CrownFilled className="compare-verdict-crown" />
              <span>AI 裁决报告</span>
              <span className="compare-verdict-time">基于数据库实时数据生成</span>
            </div>
            <div className="compare-verdict-tags">
              <div className="verdict-tag verdict-tag-best">
                <CrownFilled />
                <div>
                  <div className="verdict-tag-label">综合胜出款</div>
                  <div className="verdict-tag-name">{verdict.best.name}</div>
                </div>
              </div>
              <div className="verdict-tag verdict-tag-cheap">
                <TagFilled />
                <div>
                  <div className="verdict-tag-label">性价比最高款</div>
                  <div className="verdict-tag-name">{verdict.cheapest.name}</div>
                </div>
              </div>
              <div className="verdict-tag verdict-tag-feature">
                <RocketFilled />
                <div>
                  <div className="verdict-tag-label">功能亮点首选</div>
                  <div className="verdict-tag-name">{verdict.featured.name}</div>
                </div>
              </div>
            </div>
            <p className="compare-verdict-tip">
              💡 购买锦囊：追求口碑选「{verdict.best.name}」（评分 {verdict.best.rating}），
              预算有限选「{verdict.cheapest.name}」（¥{verdict.cheapest.price.toFixed(2)}）。
            </p>
          </div>

          <div className="compare-dimension-card">
            <div className="compare-dimension-title">五维能力量化比拼</div>
            {dimensions.map((d) => (
              <div key={d.name} className="compare-dimension-row">
                <span className="compare-dimension-name">{d.name}</span>
                <div className="compare-dimension-bars">
                  {d.values.map((v, i) => (
                    <div key={i} className="compare-dimension-bar-track">
                      <div
                        className="compare-dimension-bar"
                        style={{ width: `${v}%`, background: PRODUCT_COLORS[i] }}
                        title={`${compareList[i].name}: ${v}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="compare-dimension-legend">
              {compareList.map((p, i) => (
                <span key={p.id}>
                  <i style={{ background: PRODUCT_COLORS[i] }} />
                  {p.name.length > 8 ? `${p.name.slice(0, 8)}…` : p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. 参数矩阵对比表格 */}
      <div className="compare-matrix">
        <div className="compare-matrix-scroll">
          <table>
            <thead>
              <tr>
                <th className="compare-matrix-attr-head">
                  参数矩阵对比
                  <span>差异项以高亮底纹凸显</span>
                </th>
                {compareList.map((p, i) => (
                  <th key={p.id}>
                    <div className="compare-product-head">
                      <span
                        className="compare-product-ai"
                        style={{ background: `${PRODUCT_COLORS[i]}1a`, color: PRODUCT_COLORS[i] }}
                      >
                        {aiScore(p.rating)}% AI 推荐
                      </span>
                      <button
                        className="compare-product-remove"
                        onClick={() => toggleCompare(p)}
                        aria-label="移除"
                      >
                        <CloseOutlined />
                      </button>
                      <div className="compare-product-image">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} />
                        ) : (
                          <span>{p.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="compare-product-name">{p.name}</div>
                      <div className="compare-product-brand">{p.brand ?? "自营"}</div>
                      <div className="compare-product-price">¥{p.price.toFixed(2)}</div>
                      <button
                        className="compare-btn-primary compare-product-add"
                        onClick={() => {
                          addItem(p.id);
                          message.success(`${p.name} 已加入购物车`);
                        }}
                      >
                        <ShoppingCartOutlined /> 加购
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, idx) => (
                <Fragment key={row.key}>
                  {(idx === 0 || visibleRows[idx - 1].group !== row.group) && (
                    <tr className="compare-matrix-group">
                      <td colSpan={compareList.length + 1}>{row.group}</td>
                    </tr>
                  )}
                  <tr className={row.isDiff ? "compare-matrix-diff" : ""}>
                    <td className="compare-matrix-attr">
                      {row.attr}
                      {row.isDiff && <span className="compare-diff-mark">差异</span>}
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                </Fragment>
              ))}
              {/* AI 口碑亮点行 */}
              <tr className="compare-matrix-group">
                <td colSpan={compareList.length + 1}>AI 萃取口碑亮点</td>
              </tr>
              <tr>
                <td className="compare-matrix-attr">买家点赞优点</td>
                {compareList.map((p) => (
                  <td key={p.id}>
                    <div className="compare-feature-tags">
                      {(p.features ?? []).map((f) => (
                        <span key={f} className="compare-feature-tag">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="compare-matrix-footer">
          <FilePdfOutlined /> 参数数据来自商品数据库，实时同步
        </div>
      </div>

      {/* 4. 底部悬浮快速决策栏 */}
      <div className="compare-bottom-bar">
        <div className="compare-bottom-items">
          {compareList.map((p, i) => (
            <div key={p.id} className="compare-bottom-item">
              <span
                className="compare-bottom-color"
                style={{ background: PRODUCT_COLORS[i] }}
              />
              <div className="compare-bottom-info">
                <div className="compare-bottom-name">{p.name}</div>
                <div className="compare-bottom-price">
                  ¥{p.price.toFixed(2)} · <StarFilled /> {p.rating ?? "-"}
                </div>
              </div>
              <button
                className="compare-bottom-add"
                onClick={() => {
                  addItem(p.id);
                  message.success(`${p.name} 已加入购物车`);
                }}
              >
                <ShoppingCartOutlined />
              </button>
            </div>
          ))}
        </div>
        <div className="compare-bottom-actions">
          <button className="compare-btn-ghost" onClick={clearCompare}>
            清空对比
          </button>
          <button
            className="compare-btn-primary"
            onClick={() => {
              compareList.forEach((p) => addItem(p.id));
              message.success(`${compareList.length} 款商品已全部加入购物车`);
            }}
          >
            <ShoppingCartOutlined /> 一键全部加购
          </button>
        </div>
      </div>
    </div>
  );
}
