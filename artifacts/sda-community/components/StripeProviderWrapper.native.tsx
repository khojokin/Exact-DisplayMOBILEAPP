import React from "react";
import { StripeProvider } from "@stripe/stripe-react-native";

interface Props {
  publishableKey: string;
  children: React.ReactElement | React.ReactElement[];
}

export function StripeProviderWrapper({ publishableKey, children }: Props) {
  return <StripeProvider publishableKey={publishableKey}>{children}</StripeProvider>;
}
