import { NextRequest, NextResponse } from "next/server";
import { requireAuth, NO_STORE_HEADERS } from "@/app/lib/admin-auth";
import { redis } from "@/app/lib/redis";



export interface StoredPresupuesto {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  servicio: string;
  descripcion: string;
  fecha: string;
  estado: "nuevo" | "contactado" | "cerrado";
}

async function readPresupuestos(): Promise<StoredPresupuesto[]> {
  const data = await redis.get<StoredPresupuesto[]>("presupuestos");
  return Array.isArray(data) ? data : [];
}

async function writePresupuestos(data: StoredPresupuesto[]): Promise<void> {
  await redis.set("presupuestos", data);
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  const data = await readPresupuestos();
  return NextResponse.json(data, { headers: NO_STORE_HEADERS });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { id, estado } = await req.json();
    const validStates: StoredPresupuesto["estado"][] = ["nuevo", "contactado", "cerrado"];
    const normalizedId = typeof id === "string" ? id.trim() : "";
    if (!normalizedId || !estado || !validStates.includes(estado)) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = await readPresupuestos();
    const index = data.findIndex((p) => p.id === normalizedId);
    if (index === -1) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    data[index].estado = estado;
    await writePresupuestos(data);

    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error actualizando" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { id } = await req.json();
    const normalizedId = typeof id === "string" ? id.trim() : "";
    if (!normalizedId) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = await readPresupuestos();
    const filtered = data.filter((p) => p.id !== normalizedId);

    if (filtered.length === data.length) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    await writePresupuestos(filtered);

    return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Error eliminando" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
