import { ImageResponse } from "next/og";

// RedANT brand favicon: red square with a white ant mark, matching the
// shared BrandLogo used on the public site, authentication screens and app.

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#dc2626",
          borderRadius: 7,
        }}
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="5" r="2.2" fill="#ffffff" />
          <circle cx="12" cy="11" r="2.4" />
          <circle cx="12" cy="18" r="3" />
          <path d="M9.8 10 6 7.5M14.2 10 18 7.5M9.8 13 5.5 14M14.2 13 18.5 14M10 17 6.5 20M14 17 17.5 20M10.5 3.5 8.5 1.8M13.5 3.5 15.5 1.8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
