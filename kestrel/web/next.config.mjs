/** @type {import('next').NextConfig} */
const API = process.env.API_URL || "http://localhost:8000";
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  images: { remotePatterns: [{ protocol: "https", hostname: "m.media-amazon.com" }, { protocol: "https", hostname: "images-na.ssl-images-amazon.com" }] },
  async rewrites() { return [{ source: "/api/:path*", destination: `${API}/api/:path*` }]; },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Frame-Options", value: "DENY" }, { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" } ] }];
  },
};
