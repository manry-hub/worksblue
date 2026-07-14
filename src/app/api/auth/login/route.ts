import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DB_DIR = path.join(process.cwd(), ".worksblue");
const USERS_FILE = path.join(DB_DIR, "users.json");

interface StoredUser {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const data = await fs.readFile(USERS_FILE, "utf-8");
    const users: StoredUser[] = JSON.parse(data);

    const user = users.find((u) => u.username === username);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = await createSession({
      userId: user.id,
      username: user.username,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, name: user.name },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
