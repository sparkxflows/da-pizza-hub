import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const database = await getDatabaseHealth();
    return NextResponse.json({
      ok: true,
      database,
      server: {
        vercelRegion: process.env.VERCEL_REGION || "local",
        configuredRegion: "bom1",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Database health check failed",
        server: {
          vercelRegion: process.env.VERCEL_REGION || "local",
          configuredRegion: "bom1",
        },
      },
      { status: 500 }
    );
  }
}
