import { notFound } from "next/navigation";
import { INTERVIEW_MONTHS } from "../interview-months";
import InterviewMonthClient from "./InterviewMonthClient";

const SLUGS: Set<string> = new Set(INTERVIEW_MONTHS.map((m) => m.slug));

export function generateStaticParams() {
  return INTERVIEW_MONTHS.map(({ slug }) => ({ month: slug }));
}

function monthLabel(slug: string): string {
  const found = INTERVIEW_MONTHS.find((m) => m.slug === slug);
  return found ? found.label : slug;
}

export default async function InterviewMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  if (!SLUGS.has(month)) notFound();
  const label = monthLabel(month);

  return <InterviewMonthClient month={month} label={label} />;
}
