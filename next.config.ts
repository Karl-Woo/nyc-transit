import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["baseui", "styletron-react", "styletron-engine-monolithic"],
};

export default nextConfig;
