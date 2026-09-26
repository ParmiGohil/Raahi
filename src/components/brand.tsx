export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`}>
      <svg
        className="brand-mark"
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
      >
        <rect width="44" height="44" rx="13" fill="currentColor" />
        <path
          d="M13 32V19a9 9 0 0 1 18 0c0 5-4 9-9 9h-9m9 0 9 5"
          stroke="var(--brand-line, #fff8ed)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="31" cy="11" r="3.5" fill="#e6b978" />
      </svg>
      <span className="brand-word">
        raahi<span>.</span>
      </span>
    </span>
  );
}
