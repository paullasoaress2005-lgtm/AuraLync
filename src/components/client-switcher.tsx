import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  Command,
  Plus,
  Sparkles,
} from "lucide-react";

type Props = {
  current: "camila" | "auralync";
  currentName: string;
  basePath: string;
};

function hrefFor(basePath: string, view: "camila" | "auralync") {
  if (view === "camila") return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}view=auralync`;
}

export function ClientSwitcher({ current, currentName, basePath }: Props) {
  const items = [
    {
      id: "camila" as const,
      label: "Dra. Camila Guimaraes Espindola",
      description: "Clinica demo",
      icon: Command,
      href: hrefFor(basePath, "camila"),
    },
    {
      id: "auralync" as const,
      label: "AuraLync",
      description: "Vitrine institucional",
      icon: Sparkles,
      href: hrefFor(basePath, "auralync"),
    },
  ];

  return (
    <details className="group relative hidden md:block">
      <summary className="client-switcher-trigger flex h-10 min-w-[280px] cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-[#dfe8e7] bg-white px-3 text-sm text-[#4d676b] transition hover:bg-[#f1f7f6] [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-[#0b5d6b]" />
          <span className="truncate">{currentName}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
      </summary>

      <div className="client-switcher-menu absolute right-0 z-40 mt-2 w-[320px] overflow-hidden rounded-xl border border-[#dfe8e7] bg-white shadow-[0_24px_70px_rgba(15,60,67,0.14)]">
        <div className="border-b border-[#e8f0ef] px-4 py-3">
          <p className="client-switcher-muted text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
            Trocar perfil
          </p>
        </div>
        <div className="p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`client-switcher-option flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition ${
                  active
                    ? "client-switcher-active bg-[#edf6f5]"
                    : "hover:bg-[#f8fbfb]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="client-switcher-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f8f7] text-[#0b5d6b]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[#102f36]">
                      {item.label}
                    </span>
                    <span className="client-switcher-muted mt-0.5 block text-xs text-[#789093]">
                      {item.description}
                    </span>
                  </span>
                </span>
                {active ? <Check className="h-4 w-4 text-[#0b5d6b]" /> : null}
              </Link>
            );
          })}
          <div className="my-2 border-t border-[#e8f0ef]" />
          <Link
            href="/api/auth/logout?next=/login"
            className="client-switcher-option flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-[#f8fbfb]"
          >
            <span className="client-switcher-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#bad4d1] bg-white text-[#0b5d6b]">
              <Plus className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-[#102f36]">
                Adicionar perfil
              </span>
              <span className="client-switcher-muted mt-0.5 block text-xs text-[#789093]">
                Entrar com outra conta
              </span>
            </span>
          </Link>
        </div>
      </div>
    </details>
  );
}
