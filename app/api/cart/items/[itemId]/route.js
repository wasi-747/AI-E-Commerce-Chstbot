import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await dbConnect();
    const { itemId } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ success: false, error: "Invalid quantity." }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) return NextResponse.json({ success: false, error: "Cart not found." }, { status: 404 });

    const item = cart.items.id(itemId);
    if (!item) return NextResponse.json({ success: false, error: "Item not found in cart." }, { status: 404 });

    item.quantity = quantity;
    await cart.save();
    const populated = await cart.populate("items.productId");

    return NextResponse.json({ success: true, data: populated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await dbConnect();
    const { itemId } = await params;

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) return NextResponse.json({ success: false, error: "Cart not found." }, { status: 404 });

    const item = cart.items.id(itemId);
    if (!item) return NextResponse.json({ success: false, error: "Item not found in cart." }, { status: 404 });

    cart.items.pull(itemId);
    await cart.save();
    const populated = await cart.populate("items.productId");

    return NextResponse.json({ success: true, data: populated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
