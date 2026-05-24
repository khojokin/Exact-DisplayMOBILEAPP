import React from "react";

interface Props {
  publishableKey: string;
  children: React.ReactNode;
}

export function StripeProviderWrapper({ publishableKey: _publishableKey, children }: Props) {
  return <>{children}</>;
}
