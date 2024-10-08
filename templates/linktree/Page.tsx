"use client";

import type { frameTable } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { linkIcons } from "./icons";
import type { Config } from "./index.ts";

export default function BrowserPage({
  frame,
}: {
  frame: InferSelectModel<typeof frameTable>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const config = frame.config as Config;
  const links = config.links;

  if (!(config && motion)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-md border border-gray-700 shadow-2xl rounded-lg overflow-hidden">
        <div className="flex flex-col items-center space-y-4 p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg overflow-hidden">
              <img
                src={config.userData.userImageUrl}
                alt={config.userData.username}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-purple-300"
          >
            @{config.userData.username}
          </motion.div>
          <motion.svg
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 240 240"
            className="text-purple-400"
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <path d="M108.5,44.5C115.833,44.5 123.167,44.5 130.5,44.5C130.333,56.5046 130.5,68.5046 131,80.5C139.333,72.1667 147.667,63.8333 156,55.5C160.833,60.3333 165.667,65.1667 170.5,70C162.137,78.6975 153.47,87.0308 144.5,95C157.18,95.1674 169.846,95.6674 182.5,96.5C181.54,102.773 181.207,109.107 181.5,115.5C169.149,115.168 156.815,115.501 144.5,116.5C153.14,124.806 161.807,133.139 170.5,141.5C166.167,146.5 161.5,151.167 156.5,155.5C143.864,144.199 131.531,132.532 119.5,120.5C106.864,131.801 94.5311,143.468 82.5,155.5C77.5,151.167 72.8333,146.5 68.5,141.5C77.1401,133.194 85.8068,124.861 94.5,116.5C81.8508,115.501 69.1842,115.168 56.5,115.5C56.5,108.833 56.5,102.167 56.5,95.5C69.1711,95.6666 81.8377,95.4999 94.5,95C85.6561,86.9885 76.9894,78.8218 68.5,70.5C72.8333,65.5 77.5,60.8333 82.5,56.5C91.4931,63.8267 99.8264,71.8267 107.5,80.5C108.499,68.5185 108.832,56.5185 108.5,44.5Z" />
          </motion.svg>
        </div>
        <div className="space-y-4 p-6">
          {links.map((link, index) => (
            <motion.div
              key={link.type + link.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Link href={link.url} target="_blank">
                <button
                  className="w-full text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-purple-100 shadow-md hover:shadow-lg py-2 px-4 rounded-md relative overflow-hidden"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="relative z-10 items-center justify-center flex gap-8">
                    <span className="flex gap-2 items-center">
                      <span>
                        {link.type[0].toUpperCase() +
                          link.type.slice(1).toLowerCase()}
                      </span>
                      <span className="w-8 h-8 flex items-center justify-center ">{linkIcons[link.type]}</span>
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </span>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute inset-0 bg-white/10 rounded-md"
                      layoutId="hoverBackground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
