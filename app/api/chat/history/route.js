import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
      .select("chatHistory")
      .lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Return last 60 messages (30 exchanges) to avoid oversized payloads
    const history = (user.chatHistory || []).slice(-60);

    return NextResponse.json({ success: true, data: history }, { status: 200 });
  } catch (error) {
    console.error("Chat history GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, { $set: { chatHistory: [] } });

    return NextResponse.json({ success: true, message: "Chat history cleared." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
