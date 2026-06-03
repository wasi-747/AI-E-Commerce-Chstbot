import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";

const DUMMY_USER_ID = "67fb00000000000000000001";

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { itemId } = resolvedParams;

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing quantity" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: DUMMY_USER_ID });
    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found" },
        { status: 404 }
      );
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found in cart" },
        { status: 404 }
      );
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    return NextResponse.json(
      { success: true, data: populatedCart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update quantity" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { itemId } = resolvedParams;

    const cart = await Cart.findOne({ userId: DUMMY_USER_ID });
    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found" },
        { status: 404 }
      );
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found in cart" },
        { status: 404 }
      );
    }

    cart.items.pull(itemId);
    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    return NextResponse.json(
      { success: true, data: populatedCart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove item" },
      { status: 500 }
    );
  }
}
