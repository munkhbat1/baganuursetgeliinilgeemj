// The signature line-art bloom used as a small recurring mark
// beside eyebrows, dividers, and empty states — never as heavy decoration.
export default function PetalMark({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 20C20 20 14 14 14 8C14 4.5 16.5 2 20 2C23.5 2 26 4.5 26 8C26 14 20 20 20 20Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M20 20C20 20 26 14 32 14C35.5 14 38 16.5 38 20C38 23.5 35.5 26 32 26C26 26 20 20 20 20Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M20 20C20 20 26 26 26 32C26 35.5 23.5 38 20 38C16.5 38 14 35.5 14 32C14 26 20 20 20 20Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M20 20C20 20 14 26 8 26C4.5 26 2 23.5 2 20C2 16.5 4.5 14 8 14C14 14 20 20 20 20Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="20" cy="20" r="2.4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
