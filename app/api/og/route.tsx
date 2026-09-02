import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getSafePropertyImageUrl } from "@/lib/property-detail-view";

export const runtime = "edge";

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 200;
const MAX_PRICE = 40;

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=86400",
};

function clampText(value: string | null, fallback: string, max: number): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Only render remote images from the CRM media hosts (same allowlist as
 * next/image) or same-origin /images paths; anything else is dropped.
 */
function getSafeOgImageUrl(value: string | null, origin: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("/images/") && !trimmed.startsWith("/images//")) {
    return new URL(trimmed, origin).toString();
  }
  return getSafePropertyImageUrl(trimmed);
}

// Fonts: @vercel/og only accepts TTF/OTF/WOFF (not woff2). The default
// bundled font is used so image generation never depends on a remote fetch.
const FONT_FAMILY = "sans-serif";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);

    // Get parameters from URL (bounded)
    const title = clampText(searchParams.get("title"), "Banc Property Group", MAX_TITLE);
    const description = clampText(
      searchParams.get("description"),
      "Premium Estate Agents in Cuffley, Mayfair & Hertfordshire",
      MAX_DESCRIPTION
    );
    const price = clampText(searchParams.get("price"), "", MAX_PRICE) || null;
    const image = getSafeOgImageUrl(searchParams.get("image"), origin);
    const type = searchParams.get("type") || "default"; // default, property, blog

    // Property card style OG image
    if (type === "property" && image) {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#ffffff",
              fontFamily: FONT_FAMILY,
            }}
          >
            {/* Image Section */}
            <div
              style={{
                display: "flex",
                height: "65%",
                width: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <img
                src={image}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  backgroundColor: "#4AC8E8",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                FOR SALE
              </div>
            </div>

            {/* Content Section */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "30px 40px",
                height: "35%",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#2C2A27",
                    margin: 0,
                    lineHeight: 1.2,
                    marginBottom: 8,
                  }}
                >
                  {title.length > 50 ? title.slice(0, 50) + "..." : title}
                </h1>
                <p
                  style={{
                    fontSize: 20,
                    color: "#8A8880",
                    margin: 0,
                  }}
                >
                  {description.length > 80 ? description.slice(0, 80) + "..." : description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {price && (
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#4AC8E8",
                    }}
                  >
                    {price}
                  </span>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      color: "#4AC8E8",
                      fontWeight: 600,
                    }}
                  >
                    Banc Property Group
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: CACHE_HEADERS,
        }
      );
    }

    // Blog post OG image
    if (type === "blog") {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(135deg, #1A1917 0%, #1a1c1f 100%)",
              fontFamily: FONT_FAMILY,
              padding: 60,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "#4AC8E8",
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  fontSize: 20,
                  color: "#4AC8E8",
                  fontWeight: 600,
                }}
              >
                Banc Blog
              </span>
            </div>

            <h1
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.2,
                marginBottom: 24,
              }}
            >
              {title.length > 60 ? title.slice(0, 60) + "..." : title}
            </h1>

            <p
              style={{
                fontSize: 28,
                color: "#9CA3AF",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {description.length > 120 ? description.slice(0, 120) + "..." : description}
            </p>

            <div
              style={{
                display: "flex",
                marginTop: "auto",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  color: "#4AC8E8",
                  fontWeight: 600,
                }}
              >
                bancproperty.com/blog
              </span>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: CACHE_HEADERS,
        }
      );
    }

    // Default OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            background: "linear-gradient(135deg, #1A1917 0%, #1a1c1f 100%)",
            fontFamily: FONT_FAMILY,
          }}
        >
          {/* Left Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "60%",
              padding: "60px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: "#4AC8E8",
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  fontSize: 24,
                  color: "#4AC8E8",
                  fontWeight: 600,
                }}
              >
                BANC PROPERTY GROUP
              </span>
            </div>

            <h1
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {title.length > 50 ? title.slice(0, 50) + "..." : title}
            </h1>

            <p
              style={{
                fontSize: 24,
                color: "#9CA3AF",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {description.length > 100 ? description.slice(0, 100) + "..." : description}
            </p>

            <div
              style={{
                display: "flex",
                marginTop: 40,
                gap: 20,
              }}
            >
              <span
                style={{
                  backgroundColor: "#4AC8E8",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Premium Properties
              </span>
              <span
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                Expert Valuations
              </span>
            </div>
          </div>

          {/* Right Accent */}
          <div
            style={{
              width: "40%",
              background: "linear-gradient(180deg, #4AC8E8 0%, #4AC8E8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontWeight: 700,
                color: "rgba(255,255,255,0.2)",
              }}
            >
              B
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: CACHE_HEADERS,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
