"use client";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

interface WrapConnectKitProviderProps {
  children: React.ReactNode;
}

export const WrapConnectKitProvider = ({
  children,
}: WrapConnectKitProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
