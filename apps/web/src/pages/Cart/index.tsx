import { useEffect, useMemo, useState } from "react";
import { message, Empty } from "antd";
import {
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  UndoOutlined,
  ThunderboltFilled,
  TagFilled,
  GiftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cart";
import { orderService } from "../../services/order";
import { productService } from "../../services/product";
import type { Product } from "@eaa/types";

/** 满减门槛与优惠金额（AI 满减算法提示条） */
const DISCOUNT_THRESHOLD = 300;
const DISCOUNT_AMOUNT = 30;
const FREE_SHIPPING_THRESHOLD = 99;
const SHIPPING_FEE = 10;

export function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalCount = useCartStore((s) => s.totalCount);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);

  const [addonPool, setAddonPool] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // AI 推荐凑单池：从商品库中挑选购物车之外的商品
  useEffect(() => {
    productService
      .list({ page: 1, pageSize: 12 })
      .then((res) => setAddonPool(res.items))
      .catch(() => undefined);
  }, []);

  const addonItems = useMemo(() => {
    const inCart = new Set(items.map((i) => i.productId));
    return addonPool.filter((p) => !inCart.has(p.id)).slice(0, 4);
  }, [addonPool, items]);

  const discount = total >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
  const shipping = total >= FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_FEE;
  const finalPrice = Math.max(0, total - discount + shipping);
  const progress = Math.min(100, Math.round((total / DISCOUNT_THRESHOLD) * 100));

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      await orderService.create();
      items.forEach((i) => removeItem(i.id));
      message.success("下单成功，订单已创建");
    } catch {
      message.error("下单失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <Empty description="购物车还是空的，快去挑选心仪的商品吧" />
          <button className="cart-btn-primary" onClick={() => navigate("/products")}>
            去逛逛商品
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* 页面标题 */}
      <div className="cart-header">
        <h1 className="cart-title">
          购物车
          <span className="cart-count">{totalCount} 件优选装备</span>
        </h1>
      </div>

      {/* AI 满减算法提示条 */}
      <div className="cart-discount-banner">
        <ThunderboltFilled className="cart-discount-icon" />
        <div className="cart-discount-body">
          <div className="cart-discount-text">
            {discount > 0 ? (
              <>
                AI 算法推荐：已解锁满 ¥{DISCOUNT_THRESHOLD} 减 ¥{DISCOUNT_AMOUNT} 优惠，
                相当于折上免费得好物！
              </>
            ) : (
              <>
                AI 算法推荐：再买 ¥{(DISCOUNT_THRESHOLD - total).toFixed(2)} 即可解锁满
                ¥{DISCOUNT_THRESHOLD} 减 ¥{DISCOUNT_AMOUNT}，凑单更划算！
              </>
            )}
          </div>
          <div className="cart-discount-progress">
            <div className="cart-discount-progress-track">
              <div
                className="cart-discount-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="cart-discount-progress-label">
              ¥{total.toFixed(0)} / ¥{DISCOUNT_THRESHOLD}
            </span>
          </div>
        </div>
      </div>

      <div className="cart-layout">
        {/* 左侧：商品清单 + 凑单池 */}
        <div className="cart-main">
          <div className="cart-store-card">
            <div className="cart-store-header">
              <SafetyCertificateOutlined />
              官方自营旗舰店
              <span className="cart-store-tag">7天无理由退换</span>
            </div>

            {items.map((item) => {
              const price = item.product?.price ?? 0;
              const name = item.product?.name ?? "商品";
              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={name} />
                    ) : (
                      <span>{name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{name}</div>
                    <div className="cart-item-tags">
                      <span className="cart-item-tag">
                        <UndoOutlined /> 7天无理由退换
                      </span>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-price">¥{price.toFixed(2)}</div>
                    <div className="cart-item-stepper">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        aria-label="减少数量"
                      >
                        <MinusOutlined />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="增加数量"
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                    <div className="cart-item-subtotal">
                      小计 <b>¥{(price * item.quantity).toFixed(2)}</b>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      <DeleteOutlined /> 删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI 推荐凑单池 */}
          {addonItems.length > 0 && (
            <div className="cart-addon-section">
              <div className="cart-addon-title">
                <GiftOutlined />
                AI 推荐精选凑单池
                <span>与购物车商品高契合度搭配</span>
              </div>
              <div className="cart-addon-grid">
                {addonItems.map((p) => (
                  <div key={p.id} className="cart-addon-card">
                    <div className="cart-addon-image">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} />
                      ) : (
                        <span>{p.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="cart-addon-name">{p.name}</div>
                    <div className="cart-addon-bottom">
                      <span className="cart-addon-price">¥{p.price.toFixed(2)}</span>
                      <button
                        className="cart-addon-add"
                        onClick={() => {
                          addItem(p.id);
                          message.success(`${p.name} 已加入购物车`);
                        }}
                        aria-label="加入购物车"
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：订单结算面板 */}
        <div className="cart-summary">
          <div className="cart-summary-card">
            <div className="cart-summary-title">订单结算</div>

            <div className="cart-summary-benefits">
              <div className="cart-summary-benefit">
                <TagFilled />
                {discount > 0
                  ? `满 ¥${DISCOUNT_THRESHOLD} 减 ¥${DISCOUNT_AMOUNT}（已生效）`
                  : `满 ¥${DISCOUNT_THRESHOLD} 减 ¥${DISCOUNT_AMOUNT}`}
              </div>
              <div className="cart-summary-benefit">
                <RocketOutlined />
                {shipping === 0 ? "已享受免运费" : `满 ¥${FREE_SHIPPING_THRESHOLD} 免运费`}
              </div>
            </div>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>商品总额</span>
                <span>¥{total.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row cart-summary-row-discount">
                <span>满减优惠</span>
                <span>-¥{discount.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>运费</span>
                <span>{shipping === 0 ? "免运费" : `¥${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="cart-summary-final">
              <span>应付总额</span>
              <span className="cart-summary-final-price">¥{finalPrice.toFixed(2)}</span>
            </div>

            <button
              className="cart-btn-primary cart-checkout-btn"
              onClick={submitOrder}
              disabled={submitting}
            >
              <ShoppingCartOutlined />
              {submitting ? "正在下单..." : "确认订单"}
            </button>

            <div className="cart-trust-badges">
              <span>
                <SafetyCertificateOutlined /> 正品保障
              </span>
              <span>
                <RocketOutlined /> 极速发货
              </span>
              <span>
                <UndoOutlined /> 无忧退换
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
