"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(queryParams);
    if (page > 1) {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center">
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] transition-colors hover:border-[#1DBFDD] hover:text-[#1DBFDD]"
            rel="prev"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span className="flex cursor-not-allowed items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#9CA3AF]">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-[#9CA3AF]"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <Link
                key={page}
                href={buildUrl(page as number)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-[#1DBFDD] text-white"
                    : "border border-[#E5E7EB] text-[#374151] hover:border-[#1DBFDD] hover:text-[#1DBFDD]"
                }`}
                aria-current={isCurrent ? "page" : undefined}
                rel={isCurrent ? undefined : page === currentPage - 1 ? "prev" : page === currentPage + 1 ? "next" : undefined}
              >
                {page}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] transition-colors hover:border-[#1DBFDD] hover:text-[#1DBFDD]"
            rel="next"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex cursor-not-allowed items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#9CA3AF]">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
