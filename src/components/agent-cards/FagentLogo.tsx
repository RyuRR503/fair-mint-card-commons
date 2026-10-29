import logo from "@/assets/fagent-logo-approved.png.asset.json";

export function FagentLogo({ className = "w-40 sm:w-48" }: { className?: string }) {
  return <img src={logo.url} alt="FAGENT" width={885} height={125} className={`${className} h-auto max-w-full object-contain`} />;
}