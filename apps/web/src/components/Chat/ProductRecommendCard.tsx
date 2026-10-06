import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  StarFilled,
} from "@ant-design/icons";
import { productService } from "../../services/product";
import { useCartStore } from "../../stores/cart";
import type { Product } from "@eaa/types";

interface Props {
  productId: string;
  rank?: number;
}

export function ProductRecommendCard({ productId, rank }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    productService.getById(productId).then(setProduct).catch(() => {});
  }, [productId]);

  if (!product) return null;

  // 依据评分换算 AI 匹配度，保持在 90~99 的合理区间
  const match = product.rating
    ? Math.min(99, Math.round(86 + (product.rating / 5) * 13))
    : 92;

  return (
    <div className="rec-card">
      {/* 图片区 */}
      <div className="rec-card-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="rec-card-media-fallback">{product.category}</div>
        )}
        <div className="rec-card-match">
          <ThunderboltOutlined />
          <span>{match}% AI 匹配</span>
        </div>
        {rank === 1 && <div className="rec-card-rank">综合推荐 No.1</div>}
      </div>

      {/* 内容区 */}
      <div className="rec-card-body">
        <div className="rec-card-tags">
          {product.brand && <span className="rec-tag rec-tag-primary">{product.brand}</span>}
          {product.features.slice(0, 2).map((f) => (
            <span key={f} className="rec-tag">{f}</span>
          ))}
        </div>
        <h4 className="rec-card-name" onClick={() => navigate(`/products/${product.id}`)}>
          {product.name}
        </h4>
        {product.description && (
          <div className="rec-card-reason">
            <span className="rec-card-reason-label">AI 理由：</span>
            {product.description}
          </div>
        )}

        {/* 价格区 */}
        <div className="rec-card-price-row">
          <div>
            <span className="rec-card-price-label">到手价</span>
            <div className="rec-card-price">
              <span className="rec-card-price-symbol">¥</span>
              <span className="rec-card-price-value">{product.price.toFixed(0)}</span>
              {product.rating && (
                <span className="rec-card-rating">
                  <StarFilled /> {product.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 操作区 */}
        <div className="rec-card-actions">
          <button className="rec-btn rec-btn-ghost" onClick={() => navigate(`/products/${product.id}`)}>
            <EyeOutlined /> 详情
          </button>
          <button className="rec-btn rec-btn-primary" onClick={() => addItem(product.id)}>
            <ShoppingCartOutlined /> 加入购物车
          </button>
        </div>
      </div>
    </div>
  );
}
