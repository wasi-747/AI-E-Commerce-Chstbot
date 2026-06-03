import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await dbConnect();

    const products = await Product.find({});

    return NextResponse.json(
      {
        success: true,
        data: products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const { name, category, price, imageUrl, inventory } = body;

    if (!name || !category || !price || !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, category, price, imageUrl",
        },
        { status: 400 },
      );
    }

    const newProduct = new Product({
      name,
      category,
      price,
      imageUrl,
      inventory: inventory || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    });

    await newProduct.save();

    return NextResponse.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add product",
      },
      { status: 500 },
    );
  }
}
