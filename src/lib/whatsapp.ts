import { formatCurrency } from "./format";
import type { CartLine } from "./types";

export function buildWhatsAppUrl(whatsappNumber: string, text?: string): string {
  const message = text ?? "Hi Da Pizza Hub! I'd like to place an order.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const buildGeneralWhatsAppUrl = buildWhatsAppUrl;

export function normalizeIndianWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export const formatIndianWhatsAppNumber = normalizeIndianWhatsApp;

export function formatCustomerOrderWhatsApp(
  lines: CartLine[],
  total: number,
  orderId?: string
): string {
  const itemLines = lines
    .map((line) => {
      const summary = line.customizationSummary
        ? ` (${line.customizationSummary})`
        : "";
      return `• ${line.quantity}x ${line.name}${summary} — ${formatCurrency(line.unitPrice * line.quantity)}`;
    })
    .join("\n");

  const header = orderId
    ? `New order from Da Pizza Hub website\nOrder #${orderId}\n\n`
    : "Hi Da Pizza Hub! I'd like to place this order:\n\n";

  return `${header}${itemLines}\n\nSubtotal: ${formatCurrency(total)}\n\nPlease confirm and share the delivery timeline. Thank you!`;
}

export const buildOrderReceiptText = formatCustomerOrderWhatsApp;

export function formatStaffOrderConfirmationWhatsApp(params: {
  customerName: string;
  orderNumber: string;
  items: CartLine[];
  total: number;
  orderType: "delivery" | "pickup";
  branchName: string;
}): string {
  const { customerName, orderNumber, items, total, orderType, branchName } =
    params;
  const itemLines = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name}${item.customizationSummary ? ` (${item.customizationSummary})` : ""}`
    )
    .join("\n");

  const timeline =
    orderType === "delivery"
      ? "Your order is on its way and should reach you in around 30–45 minutes."
      : `Your order will be ready for pickup at our ${branchName} branch shortly.`;

  return `Hi ${customerName}! 🍕 Your Da Pizza Hub order #${orderNumber} is confirmed:\n\n${itemLines}\n\nTotal: ${formatCurrency(total)}\n\n${timeline}\n\nThank you for ordering with Da Pizza Hub!`;
}

export const buildCustomerConfirmationText =
  formatStaffOrderConfirmationWhatsApp;

export function formatLapsedCustomerWhatsApp(params: {
  customerName: string;
  daysSinceLastOrder: number;
  favoriteItem?: string;
}): string {
  const { customerName, daysSinceLastOrder, favoriteItem } = params;
  return `Hi ${customerName}! 👋 It's been a while since your last order with Da Pizza Hub (${daysSinceLastOrder} days).${favoriteItem ? ` We noticed you love our ${favoriteItem} — it's waiting for you!` : ""} We'd love to serve you again — check out our latest menu and offers. Order anytime, we're here!`;
}

export const buildLapsedCustomerText = formatLapsedCustomerWhatsApp;

export function formatFirstTimeFollowUpWhatsApp(params: {
  customerName: string;
}): string {
  return `Hi ${params.customerName}! 🍕 Thank you for your first order with Da Pizza Hub — we hope you loved it! We'd love to have you back. Check out our menu for more delicious options anytime.`;
}

export const buildNewCustomerFollowupText = formatFirstTimeFollowUpWhatsApp;

export function formatMorningReportWhatsApp(params: {
  reportDate: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  newCustomers: number;
  repeatCustomers: number;
  cancelledOrders: number;
  topItems: { name: string; quantity: number }[];
  branchBreakdown: { branchId: string; revenue: number; orders: number }[];
}): string {
  const {
    reportDate,
    revenue,
    orders,
    averageOrderValue,
    newCustomers,
    repeatCustomers,
    cancelledOrders,
    topItems,
    branchBreakdown,
  } = params;

  const formattedDate = new Date(reportDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const topStr = topItems.length
    ? topItems
        .map((it, idx) => `${idx + 1}. ${it.name} — ${it.quantity} sold`)
        .join("\n")
    : "No orders";

  const branchStr = branchBreakdown.length
    ? branchBreakdown
        .map(
          (b) =>
            `• ${b.branchId}: ${formatCurrency(b.revenue)} (${b.orders} orders)`
        )
        .join("\n")
    : "No orders";

  return `📊 Da Pizza Hub — Morning Report\n${formattedDate}\n\n💰 Revenue: ${formatCurrency(revenue)}\n📦 Orders: ${orders} (avg ${formatCurrency(averageOrderValue)})\n❌ Cancelled: ${cancelledOrders}\n\n👥 Customers: ${newCustomers} new, ${repeatCustomers} repeat\n\n🏆 Top Items:\n${topStr}\n\n🏪 By Branch:\n${branchStr}`;
}

export const buildMorningReportText = formatMorningReportWhatsApp;
