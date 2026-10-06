import { useNavigate } from "react-router-dom";
import { CrownOutlined, SwapOutlined } from "@ant-design/icons";
import { ProductRecommendCard } from "./ProductRecommendCard";

interface Props {
  productIds: string[];
}

export function RecommendRail({ productIds }: Props) {
  const navigate = useNavigate();

  return (
    <aside className="recommend-rail">
      {/* 头部 */}
      <div className="recommend-header">
        <div>
          <div className="recommend-title">
            <CrownOutlined /> 精准匹配单品
          </div>
          <div className="recommend-sub">根据你的预算与诉求实时打分</div>
        </div>
        {productIds.length > 0 && (
          <span className="recommend-count">{productIds.length} 款高匹配候选</span>
        )}
      </div>

      {/* 商品列表 */}
      <div className="recommend-list">
        {productIds.length === 0 ? (
          <div className="recommend-empty">
            <p>暂无推荐单品</p>
            <p className="recommend-empty-sub">描述你的购物需求后，AI 会在这里实时匹配最合适的商品</p>
          </div>
        ) : (
          productIds.map((id, idx) => (
            <ProductRecommendCard key={id} productId={id} rank={idx + 1} />
          ))
        )}
      </div>

      {/* 底部对比条 */}
      {productIds.length > 1 && (
        <div className="recommend-compare-bar">
          <button className="recommend-compare-btn" onClick={() => navigate("/compare")}>
            <SwapOutlined /> 加入对比，一决高下
          </button>
        </div>
      )}
    </aside>
  );
}
