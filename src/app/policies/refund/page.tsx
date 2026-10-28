import type { Metadata } from "next";
import seedPolicies from "@/lib/seed-policies.json";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: seedPolicies.refund.description,
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title={seedPolicies.refund.title}
      description={seedPolicies.refund.description}
      sections={seedPolicies.refund.sections}
    />
  );
}
