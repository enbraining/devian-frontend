"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SHOW_PATHS = ["/", "/blog", "/jobs"];

declare global {
  interface Window {
    ChannelIO?: (...args: unknown[]) => void;
  }
}

export default function ChannelIOController() {
  const pathname = usePathname();

  useEffect(() => {
    const show = SHOW_PATHS.includes(pathname);
    const apply = () => {
      if (!window.ChannelIO) return;
      window.ChannelIO(show ? "showChannelButton" : "hideChannelButton");
    };
    // ChannelIO가 아직 로드 안 됐을 수 있으니 짧게 대기
    const t = setTimeout(apply, 300);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
