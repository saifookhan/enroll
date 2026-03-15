"use client";

type Props = {
  className?: string;
  size?: number;
  markOnly?: boolean;
};

/** Logo mark: tern in flight — open wing shape with forward motion. */
function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Wing spread: left wing, body, right wing — flowing upward */}
      <path
        d="M8 22 L16 10 L24 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Beak/head pointing forward */}
      <path
        d="M16 10 L20 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FlowTernLogo({ className = "", size = 24, markOnly = false }: Props) {
  if (markOnly) {
    return <LogoMark size={size} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} className="flex-shrink-0 text-primary" />
      <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        FlowTern
      </span>
    </span>
  );
}
