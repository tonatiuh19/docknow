import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-3xl shadow-xl p-6 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info */}
        <div className="text-sm text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-900">{startItem}</span>{" "}
          to <span className="font-bold text-gray-900">{endItem}</span> of{" "}
          <span className="font-bold text-gray-900">{totalItems}</span> results
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white shadow-md hover:shadow-lg hover:scale-105"
            }`}
          >
            <FaChevronLeft className="text-sm" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative min-w-[40px] h-10 rounded-xl font-bold transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "text-white shadow-lg scale-110"
                      : "text-gray-700 bg-white hover:bg-gray-100 shadow-md hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
                    </>
                  )}
                  <span className="relative z-10">{pageNum}</span>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white shadow-md hover:shadow-lg hover:scale-105"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <FaChevronRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
