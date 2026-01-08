import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import Head from "next/head";
import { createContext, useState, useContext } from "react";

// ✅ DISABLE SSR FOR HEADER (FINAL FLICKER FIX)
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
});

// GLOBAL LAYOUT CONTEXT (Collapse persistence)
const LayoutContext = createContext<any>(null);

export const useLayout = () => useContext(LayoutContext);

export default function App({ Component, pageProps }: AppProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <UserProvider>
      <LayoutContext.Provider value={{ collapsed, setCollapsed }}>
        <div className="min-h-screen bg-white text-black">
          <Head>
            <title>Your-Tube Clone</title>
          </Head>

          {/* ✅ Header is now client-only */}
          <Header />

          <Toaster />

          <div className="flex">
            <Sidebar />
            <Component {...pageProps} />
          </div>
        </div>
      </LayoutContext.Provider>
    </UserProvider>
  );
}
