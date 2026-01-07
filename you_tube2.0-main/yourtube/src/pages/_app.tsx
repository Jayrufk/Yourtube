import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import Head from "next/head";
import { createContext, useState, useContext } from "react";

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

          {/* Header now uses global collapse */}
          <Header />
          

          <Toaster />

          <div className="flex">
            {/* Sidebar now reads global collapse */}
            <Sidebar />

            <Component {...pageProps} />
          </div>
        </div>
      </LayoutContext.Provider>
    </UserProvider>
  );
}
