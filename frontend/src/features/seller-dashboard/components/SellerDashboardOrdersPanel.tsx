import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { orderApi } from "../../order/api/orderApi";
import type { Order, OrderStatus } from "../../order/types/order.types";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

interface SellerDashboardOrdersPanelProps {
    orders: Order[];
    loading: boolean;
    onOrderChanged?: () => void;
}

const SELLER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipping"],
    shipping: ["delivered"],
    delivered: [],
    completed: [],
    cancelled: [],
    refunded: [],
};

export function SellerDashboardOrdersPanel({ orders, loading, onOrderChanged }: SellerDashboardOrdersPanelProps) {
    const { t } = useTranslation();
    const statusLabel = (s: OrderStatus) => t(`sellerDashboard.orders.status.${s}`, s);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [orderDetail, setOrderDetail] = useState<Order | null>(null);
    const [isOpening, setIsOpening] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

    const selectedOrder = useMemo(
        () => orders.find((o) => o.id === selectedOrderId) ?? orderDetail,
        [orders, selectedOrderId, orderDetail],
    );

    async function handleOpenDetail(orderId: string) {
        setSelectedOrderId(orderId);
        setIsOpening(true);
        setModalError(null);
        try {
            const detail = await orderApi.getOrder(orderId);
            setOrderDetail(detail);
            setIsStatusMenuOpen(false);
        } catch {
            setModalError(t("sellerDashboard.orders.errors.loadDetail", "Unable to load order details."));
        } finally {
            setIsOpening(false);
        }
    }

    async function handleUpdateStatus(nextStatus: OrderStatus) {
        if (!selectedOrder) return;
        setIsUpdating(true);
        setModalError(null);
        try {
            const updated = await orderApi.updateOrderStatus(selectedOrder.id, nextStatus);
            setOrderDetail(updated);
            setIsStatusMenuOpen(false);
            onOrderChanged?.();
        } catch {
            setModalError(t("sellerDashboard.orders.errors.updateStatus", "Failed to update order status."));
        } finally {
            setIsUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                    />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                {t("sellerDashboard.orders.empty", "No customer orders yet.")}
            </div>
        );
    }

    function formatMoney(value: number) {
        return formatCurrencyVnd(value);
    }

    function badgeClass(status: OrderStatus) {
        if (status === "pending") return "bg-orange-100 text-orange-700";
        if (status === "processing" || status === "confirmed") return "bg-blue-100 text-blue-700";
        if (status === "shipping") return "bg-yellow-100 text-yellow-700";
        if (status === "completed" || status === "delivered") return "bg-green-100 text-green-700";
        if (status === "cancelled" || status === "refunded") return "bg-red-100 text-red-700";
        return "bg-neutral-100 text-neutral-700";
    }

    return (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full border-collapse text-left">
                <thead className="bg-neutral-50/80 dark:bg-neutral-800/70">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t("sellerDashboard.orders.table.orderId", "Order ID")}</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t("sellerDashboard.orders.table.date", "Date")}</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t("sellerDashboard.orders.table.customer", "Customer")}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">{t("sellerDashboard.orders.table.totalAmount", "Total Amount")}</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-500">{t("sellerDashboard.orders.table.status", "Status")}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">{t("sellerDashboard.orders.table.action", "Action")}</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-t border-neutral-100 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
                            <td className="px-6 py-5 font-mono text-sm font-semibold">#{order.orderNumber}</td>
                            <td className="px-6 py-5 text-sm text-neutral-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium">
                                {order.buyerName || order.shippingAddress.fullName || t("sellerDashboard.orders.customerFallback", "Customer")}
                            </td>
                            <td className="px-6 py-5 text-right text-sm font-bold">{formatMoney(order.total)}</td>
                            <td className="px-6 py-5 text-center">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeClass(order.status)}`}>
                                    {statusLabel(order.status)}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <button
                                    type="button"
                                    onClick={() => void handleOpenDetail(order.id)}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    {t("sellerDashboard.orders.actions.viewDetails", "View Details")}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedOrderId
                ? createPortal(
                      <div
                          className="fixed inset-0 z-9999 bg-black/50"
                          onClick={() => {
                              setSelectedOrderId(null);
                              setOrderDetail(null);
                              setModalError(null);
                          }}
                      >
                          <div
                          className="mx-auto mt-8 flex h-[calc(100%-4rem)] w-[min(calc(100%-2rem),64rem)] flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-900"
                              onClick={(e) => e.stopPropagation()}
                          >
                              {isOpening || !selectedOrder ? (
                                  <p className="p-6 text-sm text-neutral-500">{t("sellerDashboard.orders.loadingDetail", "Loading details...")}</p>
                              ) : (
                                  <>
                                      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
                                          <div className="flex items-center gap-3">
                                              <h3 className="text-lg font-bold">
                                                  {t("sellerDashboard.orders.modal.title", "Order Details #{{orderNumber}}", { orderNumber: selectedOrder.orderNumber })}
                                              </h3>
                                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeClass(selectedOrder.status)}`}>
                                                  {statusLabel(selectedOrder.status)}
                                              </span>
                                          </div>
                                          <button
                                              type="button"
                                              onClick={() => {
                                                  setSelectedOrderId(null);
                                                  setOrderDetail(null);
                                              }}
                                              className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                          >
                                              ✕
                                          </button>
                                      </header>
                                      <div className="flex-1 space-y-8 overflow-y-auto p-6">
                                          <section className="rounded-xl bg-neutral-50 p-5 dark:bg-neutral-800/60">
                                              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{t("sellerDashboard.orders.modal.customerInfo", "Customer Information")}</h4>
                                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                  <div>
                                                      <p className="text-xs text-neutral-500">{t("sellerDashboard.orders.modal.name", "Name")}</p>
                                                      <p className="font-semibold">{selectedOrder.buyerName || selectedOrder.shippingAddress.fullName}</p>
                                                  </div>
                                                  <div>
                                                      <p className="text-xs text-neutral-500">{t("sellerDashboard.orders.modal.phone", "Phone")}</p>
                                                      <p className="font-semibold">{selectedOrder.shippingAddress.phone}</p>
                                                  </div>
                                                  <div>
                                                      <p className="text-xs text-neutral-500">{t("sellerDashboard.orders.modal.shippingAddress", "Shipping Address")}</p>
                                                      <p className="font-semibold">{selectedOrder.shippingAddress.address}</p>
                                                  </div>
                                              </div>
                                          </section>
                                          <section>
                                              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{t("sellerDashboard.orders.modal.itemsOrdered", "Items Ordered")}</h4>
                                              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                                                  <table className="w-full text-sm">
                                                      <thead className="bg-neutral-50 dark:bg-neutral-800/70">
                                                          <tr>
                                                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">{t("sellerDashboard.orders.modal.product", "Product")}</th>
                                                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">{t("sellerDashboard.orders.modal.qty", "Qty")}</th>
                                                              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500">{t("sellerDashboard.orders.modal.price", "Price")}</th>
                                                              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500">{t("sellerDashboard.orders.modal.total", "Total")}</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                          {selectedOrder.items.map((item) => (
                                                              <tr key={item.id} className="border-t border-neutral-100 dark:border-neutral-800">
                                                                  <td className="px-4 py-3 font-medium">{item.productName}</td>
                                                                  <td className="px-4 py-3">{item.quantity}</td>
                                                                  <td className="px-4 py-3">{formatMoney(item.price)}</td>
                                                                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(item.price * item.quantity)}</td>
                                                              </tr>
                                                          ))}
                                                      </tbody>
                                                  </table>
                                              </div>
                                          </section>
                                          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                              <div>
                                                  <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{t("sellerDashboard.orders.modal.timeline", "Order Timeline")}</h4>
                                                  <div className="space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                                                      <p className="text-sm font-medium">{statusLabel(selectedOrder.status)}</p>
                                                      <p className="text-xs text-neutral-500">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                                                  </div>
                                              </div>
                                              <div>
                                                  <h4 className="mb-3 text-right text-xs font-bold uppercase tracking-widest text-neutral-500">{t("sellerDashboard.orders.modal.paymentSummary", "Payment Summary")}</h4>
                                                  <div className="space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                                                      <div className="flex justify-between text-sm"><span>{t("sellerDashboard.orders.modal.subtotal", "Subtotal")}</span><span>{formatMoney(selectedOrder.subtotal)}</span></div>
                                                      <div className="flex justify-between text-sm"><span>{t("sellerDashboard.orders.modal.shipping", "Shipping")}</span><span>{formatMoney(selectedOrder.shipping)}</span></div>
                                                      <div className="flex justify-between text-sm"><span>{t("sellerDashboard.orders.modal.discount", "Discount")}</span><span>{formatMoney(selectedOrder.discount)}</span></div>
                                                      <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-bold dark:border-neutral-700"><span>{t("sellerDashboard.orders.modal.grandTotal", "Grand Total")}</span><span>{formatMoney(selectedOrder.total)}</span></div>
                                                  </div>
                                              </div>
                                          </section>
                                      </div>
                                      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
                                          <div className="flex gap-2">
                                              <button type="button" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700">
                                                  {t("sellerDashboard.orders.actions.chatWithBuyer", "Chat with Buyer")}
                                              </button>
                                              {["pending", "confirmed"].includes(selectedOrder.status) && (
                                                  <button
                                                      type="button"
                                                      disabled={isUpdating}
                                                      onClick={() => void handleUpdateStatus("cancelled")}
                                                      className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
                                                  >
                                                      {t("sellerDashboard.orders.actions.cancelOrder", "Cancel Order")}
                                                  </button>
                                              )}
                                      </div>
                                          <div className="relative">
                                              <button
                                                  type="button"
                                                  onClick={() => setIsStatusMenuOpen((v) => !v)}
                                                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                                              >
                                                  {t("sellerDashboard.orders.actions.updateStatus", "Update Status")}
                                              </button>
                                              {isStatusMenuOpen && SELLER_TRANSITIONS[selectedOrder.status].length > 0 && (
                                                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                                                      {SELLER_TRANSITIONS[selectedOrder.status].map((next) => (
                                                          <button
                                                              key={next}
                                                              type="button"
                                                              disabled={isUpdating}
                                                              onClick={() => void handleUpdateStatus(next)}
                                                              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                                                          >
                                                              {statusLabel(next)}
                                                          </button>
                                                      ))}
                                                  </div>
                                              )}
                                          </div>
                                          {modalError ? <p className="w-full text-sm text-red-600">{modalError}</p> : null}
                                      </footer>
                                  </>
                              )}
                          </div>
                      </div>,
                      document.body,
                  )
                : null}
        </div>
    );
}
