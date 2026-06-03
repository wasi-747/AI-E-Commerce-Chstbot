import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Cart from "@/models/Cart";

// Dummy userId for demonstration purposes
const DUMMY_USER_ID = "67fb00000000000000000001";

export async function GET(request) {
  try {
    await dbConnect();

    const cart = await Cart.findOne({ userId: DUMMY_USER_ID }).populate(
      "items.productId",
    );

    if (!cart) {
      return NextResponse.json(
        {
          success: true,
          data: { userId: DUMMY_USER_ID, items: [] },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: cart,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch cart",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const { productId, size, quantity } = body;

    if (!productId || !size || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: productId, size, quantity",
        },
        { status: 400 },
      );
    }

    if (!["S", "M", "L", "XL", "XXL"].includes(size)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid size. Must be one of: S, M, L, XL, XXL",
        },
        { status: 400 },
      );
    }

    let cart = await Cart.findOne({ userId: DUMMY_USER_ID });

    if (!cart) {
      cart = new Cart({
        userId: DUMMY_USER_ID,
        items: [{ productId, size, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId && item.size === size,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, size, quantity });
      }
    }

    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    return NextResponse.json(
      {
        success: true,
        data: populatedCart,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add item to cart",
      },
      { status: 500 },
    );
  }
}
