import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import Header from "@/components/Header";
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
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-gray-100 dark:border-zinc-800 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-zinc-600">
            <span>© {new Date().getFullYear()} DEVIAN. All rights reserved.</span>
            <a href="mailto:enbraining@gmail.com" className="hover:text-gray-600 dark:hover:text-zinc-400 transition-colors">
              enbraining@gmail.com
            </a>
          </div>
        </footer>

        {/* ChannelIO */}
        <Script id="channel-io" strategy="afterInteractive">{`
          (function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
          ChannelIO('boot', { "pluginKey": "def40057-21d2-421f-8c2d-2e218aa88411" });
        `}</Script>
      </body>
    </html>
  );
}
