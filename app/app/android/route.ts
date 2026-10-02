import type { NextRequest } from "next/server";
import { storeRedirect } from "@/lib/http/store";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return storeRedirect(request, "android");
}
