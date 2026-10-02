import type { NextRequest } from "next/server";
import { storeRedirect } from "@/lib/http/store";

export const dynamic = "force-dynamic";

/** Generic link: sends phones to their store. */
export function GET(request: NextRequest) {
  return storeRedirect(request, "auto");
}
