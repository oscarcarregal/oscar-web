import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyPassword } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const isAuth = await requireAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "La contraseña actual es obligatoria" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword);
    if (!valid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 401 }
      );
    }

    // Generate hash for new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Save the new hash to Redis
    await redis.set("admin:password_hash", hash);

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" });
  } catch (error: any) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
