import { useState } from "react";
import {
  StarFilled,
  HeartOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

interface Props {
  product: Product;
}

/** 根据评分推算 AI 推荐度（视觉标签，与设计稿一致） */
function aiScore(rating?: number): number {
  if (!rating) return 90;
  return Math.min(99, Math.round(80 + rating * 4));
}

export function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCompare = useCartStore((s) => s.toggleCompare);
  const isInCompare = useCartStore((s) => s.compareList.some((p) => p.id === product.id));
  const [liked, setLiked] = useState(false);

  const features = product.features ?? [];

  return (
    <article className="product-card">
      {/* 收藏按钮 */}
      <button
        className={`product-card-like${liked ? " product-card-like-active" : ""}`}
        onClick={() => setLiked(!liked)}
        aria-label="收藏"
      >
        {liked ? <HeartFilled /> : <HeartOutlined />}
      </button>

      <div>
        {/* 图片区域 */}
        <div className="product-card-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <span className="product-card-image-placeholder">
              {product.name.slice(0, 2)}
            </span>
          )}
          <span className="product-card-badge-official">
            <SafetyCertificateOutlined /> 官方正品
          </span>
          <span className="product-card-badge-ai">AI 推荐 {aiScore(product.rating)}%</span>
        </div>

        {/* 商品信息 */}
        <div className="product-card-head">
          <div>
            <h3 className="product-card-title">{product.name}</h3>
            <p className="product-card-meta">
              <span>{product.brand ?? "自营"}</span>
              <span className="product-card-meta-dot" />
              <span className="product-card-rating">
                <StarFilled />
                {product.rating ?? "-"}
              </span>
              <span className="product-card-stock">库存 {product.stock}</span>
            </p>
          </div>
          {product.category && (
            <span className="product-card-category">{product.category}</span>
          )}
        </div>

        {/* AI 亮点标签 */}
        {features.length > 0 && (
          <div className="product-card-tags">
            {features.slice(0, 2).map((f) => (
              <span key={f} className="product-card-tag">
                {f}
              </span>
            ))}
            {features[2] && (
              <span className="product-card-tag product-card-tag-highlight">
                {features[2]}
              </span>
            )}
          </div>
        )}

        {/* 价格 */}
        <div className="product-card-price-row">
          <span className="product-card-price">¥{product.price.toFixed(2)}</span>
          <span className="product-card-price-original">
            ¥{(product.price * 1.25).toFixed(2)}
          </span>
          <span className="product-card-price-drop">
            限时降 ¥{(product.price * 0.25).toFixed(0)}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="product-card-actions">
        <button
          className="product-card-btn product-card-btn-plain"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <EyeOutlined />
          <span>详情</span>
        </button>
        <button
          className="product-card-btn product-card-btn-primary"
          onClick={() => addItem(product.id)}
        >
          <ShoppingCartOutlined />
          <span>加购</span>
        </button>
        <button
          className={`product-card-btn product-card-btn-compare${isInCompare ? " product-card-btn-compare-active" : ""}`}
          onClick={() => toggleCompare(product)}
        >
          <SwapOutlined />
          <span>对比</span>
        </button>
      </div>
    </article>
  );
}
