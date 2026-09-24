import type { getAdminData } from "@/lib/nercha.functions";

export type AdminData = Awaited<ReturnType<typeof getAdminData>>;

export type PanelProps = {
  data: AdminData;
  token: string;
  refresh: () => void;
};

export function whatsappLink(phone: string | null, message: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const withCountry = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
