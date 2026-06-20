import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import ConditionalShell from "@/components/ConditionalShell";
import ChannelIOController from "@/components/ChannelIOController";
import Script from "next/script";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "DEVIAN",
  description: "국내 테크 기업 블로그 모아보기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${spaceMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ConditionalShell>{children}</ConditionalShell>
        <ChannelIOController />

        {/* ChannelIO */}
        <Script id="channel-io" strategy="afterInteractive">{`
          (function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
          ChannelIO('boot', { "pluginKey": "def40057-21d2-421f-8c2d-2e218aa88411" });
        `}</Script>
      </body>
    </html>
  );
}
