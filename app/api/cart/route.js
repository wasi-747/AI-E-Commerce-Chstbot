import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product"; // Ensure Product schema is registered

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: { items: [] } }, { status: 200 });
    }

    await dbConnect();
    const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId");

    return NextResponse.json(
      { success: true, data: cart || { userId: session.user.id, items: [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await dbConnect();
    const { productId, size, quantity } = await request.json();

    if (!productId || !size || !quantity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: productId, size, quantity" },
        { status: 400 }
      );
    }
    if (!["S", "M", "L", "XL", "XXL"].includes(size)) {
      return NextResponse.json({ success: false, error: "Invalid size." }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [{ productId, size, quantity }] });
    } else {
      const existing = cart.items.find(
        (item) => item.productId.toString() === productId && item.size === size
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId, size, quantity });
      }
    }

    await cart.save();
    const populated = await cart.populate("items.productId");

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    await dbConnect();
    await Cart.deleteOne({ userId: session.user.id });
    return NextResponse.json({ success: true, message: "Cart cleared." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
