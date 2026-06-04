import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Order from "@/models/Order";

// ── Helper ───────────────────────────────────────────────────────────────────
async function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await Order.countDocuments();
  const seq = String(count + 1).padStart(4, "0");
  return `TDJ-${dateStr}-${seq}`;
}

// ── GET: List user's orders ───────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    await dbConnect();
    const orders = await Order.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── POST: Place order (direct checkout from CartDrawer) ──────────────────────
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty." }, { status: 400 });
    }

    // Build immutable item snapshots
    const orderItems = cart.items.map((item) => {
      const p = item.productId;
      return {
        productId: p._id,
        name:      p.name,
        imageUrl:  p.imageUrl,
        price:     p.price,
        size:      item.size,
        quantity:  item.quantity,
        lineTotal: p.price * item.quantity,
      };
    });

    const subtotal    = orderItems.reduce((s, i) => s + i.lineTotal, 0);
    const shipping    = 60;
    const total       = subtotal + shipping;
    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId,
      items: orderItems,
      pricing: { subtotal, shipping, total },
      status:    "confirmed",
      placedVia: "direct",
    });

    // Clear cart
    await Cart.deleteOne({ userId });

    return NextResponse.json(
      { success: true, data: { orderNumber: order.orderNumber, total } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
