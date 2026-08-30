import type { NextConfig } from "next";
import { PROPERTY_IMAGE_REMOTE_PATTERNS } from "./lib/property-detail-view";

const nextConfig: NextConfig = {
  // Allow development access from network IPs
  allowedDevOrigins: ["192.168.0.90", "localhost", "127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Shared with the feed-media render policy so unsupported CRM hosts fail closed.
      ...PROPERTY_IMAGE_REMOTE_PATTERNS,
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      {
        source: "/(.*).(js|css|woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*).(jpg|jpeg|png|gif|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=31536000",
          },
        ],
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/why-us",
        permanent: true,
      },
      {
        source: "/team",
        destination: "/the-team",
        permanent: true,
      },
      {
        source: "/property",
        destination: "/sales/properties",
        permanent: true,
      },
      {
        source: "/buy",
        destination: "/sales",
        permanent: true,
      },
      {
        source: "/sell",
        destination: "/sales/sellers-guide",
        permanent: true,
      },
      {
        source: "/rent",
        destination: "/lettings",
        permanent: true,
      },
      {
        source: "/landlords",
        destination: "/lettings/landlords-guide",
        permanent: true,
      },
      {
        source: "/tenants",
        destination: "/lettings/tenants-guide",
        permanent: true,
      },
      // Legacy URL paths from the previous bancproperty.com site
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/property-valuation",
        destination: "/valuation",
        permanent: true,
      },
      {
        source: "/instant-valuation",
        destination: "/tools/valuation",
        permanent: true,
      },
      {
        source: "/area-guide",
        destination: "/area-guides",
        permanent: true,
      },
      {
        source: "/area-guide/:slug",
        destination: "/area-guides/:slug",
        permanent: true,
      },
      {
        source: "/land-and-new-homes",
        destination: "/land-new-homes",
        permanent: true,
      },
      {
        source: "/become-a-partner",
        destination: "/become-partner",
        permanent: true,
      },
      {
        source: "/offices/estate-agents/cuffley",
        destination: "/offices/cuffley",
        permanent: true,
      },
      {
        source: "/offices/estate-agents/mayfair",
        destination: "/offices/mayfair",
        permanent: true,
      },
      {
        source: "/lettings/yield-calculator",
        destination: "/tools/yield-calculator",
        permanent: true,
      },
      {
        source: "/sales/stamp-duty",
        destination: "/tools/stamp-duty",
        permanent: true,
      },
    ];
  },
  turbopack: {},
};

export default nextConfig;
