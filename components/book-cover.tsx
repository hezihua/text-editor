type CoverTheme = {
  bg: string;
  fg: string;
  accent: string;
  motif: "paper" | "blocks" | "poster";
};

const THEMES: CoverTheme[] = [
  { bg: "#f3efe4", fg: "#2b2723", accent: "#6d8c98", motif: "paper" },
  { bg: "#e2b423", fg: "#16130f", accent: "#111111", motif: "blocks" },
  { bg: "#c45c38", fg: "#fff7f1", accent: "#f3d5c8", motif: "poster" },
  { bg: "#1f3d36", fg: "#f4eee4", accent: "#d4b483", motif: "poster" },
  { bg: "#efe4cf", fg: "#322b24", accent: "#3e6d86", motif: "paper" },
  { bg: "#8d3b32", fg: "#fff6ee", accent: "#f0c9a0", motif: "poster" },
  { bg: "#d7b15a", fg: "#1a1612", accent: "#111111", motif: "blocks" },
  { bg: "#2a3344", fg: "#f6f1e7", accent: "#d9c7a6", motif: "poster" },
  { bg: "#e7dcc8", fg: "#2c261f", accent: "#8a704e", motif: "paper" },
  { bg: "#b85a3d", fg: "#fff8f3", accent: "#1a1612", motif: "blocks" },
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function blockLines(title: string): string[] {
  const text = title.replace(/\s+/g, "");
  const chunk = text.length > 16 ? 5 : 7;
  const lines: string[] = [];
  for (let i = 0; i < text.length && lines.length < 3; i += chunk) {
    lines.push(text.slice(i, i + chunk));
  }
  return lines.length > 0 ? lines : [title];
}

function PaperMotif({
  accent,
  variant,
}: {
  accent: string;
  variant: number;
}) {
  if (variant % 3 === 1) {
    return (
      <svg viewBox="0 0 120 88" className="h-[88px] w-[112px]" aria-hidden>
        <circle
          cx="60"
          cy="44"
          r="26"
          fill="none"
          stroke={accent}
          strokeWidth="1.15"
        />
        <circle
          cx="60"
          cy="44"
          r="14"
          fill="none"
          stroke={accent}
          strokeWidth="1.15"
        />
        <path d="M22 44 H98" stroke={accent} strokeWidth="1" />
      </svg>
    );
  }
  if (variant % 3 === 2) {
    return (
      <svg viewBox="0 0 120 88" className="h-[88px] w-[112px]" aria-hidden>
        <path
          d="M24 68 L60 16 L96 68"
          fill="none"
          stroke={accent}
          strokeWidth="1.15"
        />
        <path
          d="M36 68 L60 32 L84 68"
          fill="none"
          stroke={accent}
          strokeWidth="1.15"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 88" className="h-[88px] w-[112px]" aria-hidden>
      <path
        d="M8 44 C 28 12, 48 12, 60 44 C 72 76, 92 76, 112 44"
        fill="none"
        stroke={accent}
        strokeWidth="1.15"
      />
      <path
        d="M8 44 C 28 76, 48 76, 60 44 C 72 12, 92 12, 112 44"
        fill="none"
        stroke={accent}
        strokeWidth="1.15"
      />
    </svg>
  );
}

type BookCoverProps = {
  title: string;
  seed: string;
  footer?: string;
  /** 整本书用完整书名，不按文章封面的色块切行。 */
  layout?: "auto" | "title";
};

const POSTER_THEMES: Array<Omit<CoverTheme, "motif">> = [
  { bg: "#e2b423", fg: "#1a1612", accent: "#6b5014" },
  { bg: "#c45c38", fg: "#fff7f1", accent: "#f3d5c8" },
  { bg: "#1f3d36", fg: "#f4eee4", accent: "#d4b483" },
  { bg: "#8d3b32", fg: "#fff6ee", accent: "#f0c9a0" },
  { bg: "#2a3344", fg: "#f6f1e7", accent: "#d9c7a6" },
  { bg: "#efe4cf", fg: "#322b24", accent: "#8a704e" },
];

export function BookCover({ title, seed, footer, layout = "auto" }: BookCoverProps) {
  const hash = hashString(seed);
  const theme =
    layout === "title"
      ? { ...POSTER_THEMES[hash % POSTER_THEMES.length]!, motif: "poster" as const }
      : THEMES[hash % THEMES.length]!;
  const posterSize =
    title.length <= 8
      ? "text-[26px]"
      : title.length <= 16
        ? "text-[20px]"
        : "text-[16px]";

  return (
    <div
      className="relative aspect-[168/228] w-full overflow-hidden rounded-[3px] border border-black/10 shadow-[0_14px_28px_-16px_rgba(60,40,20,0.55)]"
      style={{ backgroundColor: theme.bg, color: theme.fg }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[6px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.22), rgba(0,0,0,0.02))",
        }}
      />
      {theme.motif !== "paper" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 3px)",
          }}
        />
      )}

      {theme.motif === "paper" && (
        <div className="relative flex h-full flex-col px-4 pb-4 pt-5">
          <p className="book-serif line-clamp-3 text-center text-[15px] leading-snug">
            {title}
          </p>
          <div className="flex flex-1 items-center justify-center">
            <PaperMotif accent={theme.accent} variant={hash} />
          </div>
          {footer && (
            <p
              className="truncate text-center text-[9px] tracking-[0.16em]"
              style={{ color: theme.accent }}
            >
              {footer}
            </p>
          )}
        </div>
      )}

      {theme.motif === "blocks" && (
        <div className="relative flex h-full flex-col items-center justify-center gap-2 px-4">
          {blockLines(title).map((line, index) => (
            <span
              key={`${line}-${index}`}
              className="book-serif max-w-full truncate px-1.5 py-1 text-[16px] font-semibold leading-none"
              style={{
                background: index % 2 === 0 ? "#161616" : "#f7f4ee",
                color: index % 2 === 0 ? "#f7f4ee" : "#161616",
              }}
            >
              {line}
            </span>
          ))}
          {footer && (
            <p className="mt-5 max-w-full truncate text-[10px] opacity-70">
              {footer}
            </p>
          )}
        </div>
      )}

      {theme.motif === "poster" && (
        <div className="relative flex h-full flex-col justify-end p-4 pl-5">
          <p
            className={`${layout === "title" ? "font-sans" : "book-serif"} line-clamp-5 font-semibold leading-[1.28] ${posterSize}`}
          >
            {title}
          </p>
          {footer && (
            <p
              className="mt-3 truncate text-[10px] tracking-[0.12em]"
              style={{ color: theme.accent }}
            >
              {footer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
