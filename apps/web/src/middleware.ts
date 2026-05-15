import { NextRequest, NextResponse } from "next/server";

const isDockerHopIp = (ip: string) =>
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(ip);

const getClientIp = (req: NextRequest) => {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") || "unknown";
};

export function middleware(req: NextRequest) {
  const ip = getClientIp(req);
  const host = req.headers.get("host") || "-";
  const xff = req.headers.get("x-forwarded-for") || "-";
  const xri = req.headers.get("x-real-ip") || "-";
  const pathname = req.nextUrl.pathname;
  const ipType = isDockerHopIp(ip || "") ? "INTERNAL_DOCKER_HOP" : "CLIENT_DEVICE";

  // Exclure explicitement les routes internes/asset de Next.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  console.log(
    `[FRONTEND][HTTP] ${req.method} ${pathname}${req.nextUrl.search} CLIENT_IP=${ip} CLIENT_TYPE=${ipType} SERVER_HOST=${host} xff=${xff} xri=${xri}`
  );

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
