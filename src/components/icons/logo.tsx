import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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
    <path d="M7.7 7.7 2 22" />
    <path d="M17.7 17.7 22 12l-4-4-3 3-4-4-3 3-4-4-4 4 4 4Z" />
    <path d="m14 6 3 3" />
    <path d="M22 2 12 12" />
  </svg>
);

export default Logo;
