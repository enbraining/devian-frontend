import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const fontData = await readFile(
    path.join(process.cwd(), "public/fonts/SpaceMono-Bold.woff2")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <span
          style={{
            fontFamily: "Space Mono",
            fontWeight: 700,
            fontSize: 26,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          D
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Mono",
          data: fontData,
          weight: 700,
        },
      ],
    }
  );
}
