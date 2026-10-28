import type { Metadata } from "next";
import seedPolicies from "@/lib/seed-policies.json";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: seedPolicies.privacy.description,
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title={seedPolicies.privacy.title}
      description={seedPolicies.privacy.description}
      sections={seedPolicies.privacy.sections}
    />
  );
}
