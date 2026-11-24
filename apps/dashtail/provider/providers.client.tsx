"use client";
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const TanstackProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(new QueryClient());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as unknown as { __DASHTAIL_SECURITY_WARNING_INITIALIZED__?: boolean };
    if (win.__DASHTAIL_SECURITY_WARNING_INITIALIZED__) return;

    if (process.env.NODE_ENV === "production") {
      win.__DASHTAIL_SECURITY_WARNING_INITIALIZED__ = true;
      const warn = console.warn || console.log;
      warn(
        "%cStop!",
        "color: #ef4444; font-size: 48px; font-weight: 900; -webkit-text-stroke: 1px black; font-family: sans-serif;"
      );
      warn(
        "%cThis is a browser feature intended only for developers. If someone told you to copy and paste code or tokens here, it is a SCAM.\n\nPasting code here can compromise your account and organization data.",
        "font-size: 14px; font-weight: 600; color: #1f2937; line-height: 1.5; font-family: sans-serif;"
      );
      warn(
        "%cFor more information, see https://en.wikipedia.org/wiki/Self-XSS",
        "font-size: 12px; color: #6b7280; font-style: italic;"
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanstackProvider;
