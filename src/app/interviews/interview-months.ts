export const INTERVIEW_MONTHS = [
  { slug: "january-2026", label: "January 2026" },
  { slug: "february-2026", label: "February 2026" },
  { slug: "march-2026", label: "March 2026" },
  { slug: "april-2026", label: "April 2026" },
  { slug: "may-2026", label: "May 2026" },
  { slug: "june-2026", label: "June 2026" },
  { slug: "july-2026", label: "July 2026" },
  { slug: "august-2026", label: "August 2026" },
  { slug: "september-2026", label: "September 2026" },
  { slug: "october-2026", label: "October 2026" },
  { slug: "november-2026", label: "November 2026" },
  { slug: "december-2026", label: "December 2026" },
] as const;

export type InterviewMonthSlug = (typeof INTERVIEW_MONTHS)[number]["slug"];
