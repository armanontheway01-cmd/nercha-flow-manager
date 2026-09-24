import { Link } from "@tanstack/react-router";

export function StatusBand({
  ongoing,
  headline,
  subline,
  packets,
  tokens,
}: {
  ongoing: boolean;
  headline: string;
  subline: string;
  packets: number;
  tokens: number;
}) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-forest/85 backdrop-blur-xl ring-1 ring-white/10 shadow-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block size-2.5 rounded-full shrink-0 ${ongoing ? "live-dot bg-sage" : "bg-clay"}`}
          />
          <div>
            <p className="text-sm font-semibold text-cream">{headline}</p>
            <p className="text-xs text-sage">{subline}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-sage">Packets issued</p>
            <p className="font-display text-2xl text-cream leading-none">{packets.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-sage">Tokens active</p>
            <p className="font-display text-2xl text-cream leading-none">{tokens}</p>
          </div>
          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-2 rounded-md bg-saffron text-forest-deep hover:bg-saffron/90"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
