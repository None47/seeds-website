import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "seedscompany_super_secret_jwt_key_2024";

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;       // "admin" | "buyer"
    kycStatus: string;  // "pending" | "approved" | "rejected"
}

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

export async function getSessionUser(): Promise<JwtPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (!token) return null;
        return verifyToken(token);
    } catch {
        return null;
    }
}
