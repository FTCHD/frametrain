import type { SVGProps } from "react";
import {
  BookOpen,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import type { LinkType } from "./index.ts";

function Farcaster({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="1000" height="1000" rx="200" fill="white" />
      <path
        d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"
        fill="#855DCD"
      />
      <path
        d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"
        fill="#855DCD"
      />
      <path
        d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"
        fill="#855DCD"
      />
    </svg>
  );
}
function LinkTree(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="240px"
      height="240px"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g>
        <path
          opacity={0.996}
          d="M 108.5,44.5 C 115.833,44.5 123.167,44.5 130.5,44.5C 130.333,56.5046 130.5,68.5046 131,80.5C 139.333,72.1667 147.667,63.8333 156,55.5C 160.833,60.3333 165.667,65.1667 170.5,70C 162.137,78.6975 153.47,87.0308 144.5,95C 157.18,95.1674 169.846,95.6674 182.5,96.5C 181.54,102.773 181.207,109.107 181.5,115.5C 169.149,115.168 156.815,115.501 144.5,116.5C 153.14,124.806 161.807,133.139 170.5,141.5C 166.167,146.5 161.5,151.167 156.5,155.5C 143.864,144.199 131.531,132.532 119.5,120.5C 106.864,131.801 94.5311,143.468 82.5,155.5C 77.5,151.167 72.8333,146.5 68.5,141.5C 77.1401,133.194 85.8068,124.861 94.5,116.5C 81.8508,115.501 69.1842,115.168 56.5,115.5C 56.5,108.833 56.5,102.167 56.5,95.5C 69.1711,95.6666 81.8377,95.4999 94.5,95C 85.6561,86.9885 76.9894,78.8218 68.5,70.5C 72.8333,65.5 77.5,60.8333 82.5,56.5C 91.4931,63.8267 99.8264,71.8267 107.5,80.5C 108.499,68.5185 108.832,56.5185 108.5,44.5 Z"
        />
      </g>
    </svg>
  );
}
const linkIcons: Record<LinkType, React.ReactNode> = {
  twitter: <Twitter className="w-full h-full" />,
  warpcast: <Farcaster className="w-full h-full" />,
  website: <Globe className="w-full h-full" />,
  blog: <BookOpen className="w-full h-full" />,
  github: <Github className="w-full h-full" />,
  linkedin: <Linkedin className="w-full h-full" />,
  instagram: <Instagram className="w-full h-full" />,
};
export { Farcaster, LinkTree, linkIcons };
