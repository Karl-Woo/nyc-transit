"use client";

import { BaseProvider, LightTheme } from "baseui";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-monolithic";

const getEngine = (() => {
  let engine: Styletron | null = null;
  return () => {
    if (!engine && typeof document !== "undefined") {
      engine = new Styletron();
    }
    return engine;
  };
})();

export default function Providers({ children }: { children: React.ReactNode }) {
  const engine = getEngine();

  if (!engine) {
    return <>{children}</>;
  }

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>{children}</BaseProvider>
    </StyletronProvider>
  );
}
