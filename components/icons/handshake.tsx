import { LucideProps } from "lucide-react"

export function Handshake(props: LucideProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 15l5 5 4-4 4 4 5-5" />
      <path d="M6 15V9l6-3 6 3v6" />
      <path d="M8 10l4 4 4-4" />
    </svg>
  )
}
