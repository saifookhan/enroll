"use client";

import Image from "next/image";

type Props = {
  className?: string;
  size?: number;
  markOnly?: boolean;
};

export default function FlowTernLogo({ className = "", size = 24, markOnly = false }: Props) {
  const img = (
    <Image
      src="/logo.png?v=2"
      alt="FlowTern"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
      unoptimized
    />
  );

  if (markOnly) {
    return img;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {img}
      <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        FlowTern
      </span>
    </span>
  );
}
