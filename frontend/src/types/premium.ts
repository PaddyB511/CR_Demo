export type BillingCycle = "monthly" | "yearly" | "lifetime";

export interface Plan {
  id: BillingCycle;
  title: string;
  price: string;
  highlight?: boolean;
  features: string[];
}
