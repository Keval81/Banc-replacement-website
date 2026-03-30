import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from URL
    const title = searchParams.get("title") || "Banc Property Group";
    const description = searchParams.get("description") || "Premium Estate Agents in Cuffley, Mayfair & Hertfordshire";
    const price = searchParams.get("price");
    const image = searchParams.get("image");
    const type = searchParams.get("type") || "default"; // default, property, blog

    // Load fonts
    const montserratBold = await fetch(
      new URL("https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2")
    ).then((res) => res.arrayBuffer());

    const montserratRegular = await fetch(
      new URL("https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2")
    ).then((res) => res.arrayBuffer());

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
              fontFamily: "Montserrat",
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
          fonts: [
            {
              name: "Montserrat",
              data: montserratRegular,
              style: "normal",
              weight: 400,
            },
            {
              name: "Montserrat",
              data: montserratBold,
              style: "normal",
              weight: 700,
            },
          ],
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
              fontFamily: "Montserrat",
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
          fonts: [
            {
              name: "Montserrat",
              data: montserratRegular,
              style: "normal",
              weight: 400,
            },
            {
              name: "Montserrat",
              data: montserratBold,
              style: "normal",
              weight: 700,
            },
          ],
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
            fontFamily: "Montserrat",
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
        fonts: [
          {
            name: "Montserrat",
            data: montserratRegular,
            style: "normal",
            weight: 400,
          },
          {
            name: "Montserrat",
            data: montserratBold,
            style: "normal",
            weight: 700,
          },
        ],
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
