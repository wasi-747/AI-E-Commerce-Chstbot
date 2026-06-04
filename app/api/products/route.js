import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tags     = searchParams.get("tags");      // comma-separated: "running,nike"
    const search   = searchParams.get("search");    // text search
    const limit    = parseInt(searchParams.get("limit") || "20", 10);

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    if (search) {
      // Case-insensitive name/brand/tag match
      filter.$or = [
        { name:             { $regex: search, $options: "i" } },
        { brand:            { $regex: search, $options: "i" } },
        { tags:             { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .limit(Math.min(limit, 50)) // cap at 50
      .lean();

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, category, price, imageUrl, inventory, brand, shortDescription, tags } = body;

    if (!name || !category || !price || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, category, price, imageUrl" },
        { status: 400 }
      );
    }

    const newProduct = new Product({
      name,
      brand:            brand || "",
      shortDescription: shortDescription || "",
      category,
      price,
      imageUrl,
      tags:      tags || [],
      inventory: inventory || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    });

    await newProduct.save();

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add product" },
      { status: 500 }
    );
  }
}
