import type { Metadata } from "next";
import seedPolicies from "@/lib/seed-policies.json";
import { PolicyPage } from "@/components/policies/PolicyPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: seedPolicies.terms.description,
};

export default function TermsPolicyPage() {
  return (
    <PolicyPage
      title={seedPolicies.terms.title}
      description={seedPolicies.terms.description}
      sections={seedPolicies.terms.sections}
    />
  );
}
