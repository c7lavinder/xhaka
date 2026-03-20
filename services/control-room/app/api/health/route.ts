import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "xhaka-control-room",
    timestamp: new Date().toISOString(),
  });
}
