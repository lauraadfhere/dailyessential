import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
  // The app selects its language with ?lang=, never a /en path prefix.
  // Any locale-prefixed URL (e.g. /en, /fr/pricing) is sent to the same page
  // with the matching ?lang= value so it serves the platform instead of 404ing.
  async redirects() {
    return [
      { source: "/en", destination: "/?lang=en", permanent: false },
      { source: "/fr", destination: "/?lang=fr", permanent: false },
      { source: "/ar", destination: "/?lang=ar", permanent: false },
      { source: "/:locale(en|fr|ar)/:path*", destination: "/:path*?lang=:locale", permanent: false },
    ];
  },
};

export default nextConfig;
