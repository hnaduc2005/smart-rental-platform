import type { NextConfig } from "next";

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallbackUrl = process.env.VERCEL ? undefined : "http://127.0.0.1:3001/api";
  const apiUrl = configuredUrl || fallbackUrl;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required for Vercel deployments.");
  }

  const parsedUrl = new URL(apiUrl);
  const blockedHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

  if (process.env.VERCEL && blockedHosts.has(parsedUrl.hostname)) {
    throw new Error("NEXT_PUBLIC_API_URL must point to the public Render API URL on Vercel.");
  }

  return apiUrl.replace(/\/$/, "");
}

const apiBaseUrl = getApiBaseUrl();

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/:path*`
      },
    ];
  },
};

export default nextConfig;
