import VaultSpecCell from "@/components/vault/VaultSpecCell";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

/** Archive stat cell — Vault spec-cell anatomy (big number over label). */
export default function StatCard({ label, value, helper }: StatCardProps) {
  return <VaultSpecCell value={value} label={label} sublabel={helper} />;
}
