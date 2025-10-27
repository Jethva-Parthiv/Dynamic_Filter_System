"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Maximize,
  Minimize,
  ChevronFirst,
  ChevronLast,
  Columns,
  Check,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for Sort Indicator
const SortIcon = ({ direction }) => {
  if (direction === "asc") return <ArrowUp size={14} className="text-blue-400" />;
  if (direction === "desc") return <ArrowDown size={14} className="text-blue-400" />;
  return <ArrowUpDown size={14} className="text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />;
};

// Memoized table row component
const TableRow = React.memo(({ row, cols, index, showRowNumbers, globalRowIndex }) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: index * 0.01 }}
    className="bg-white dark:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
  >
    {/* Row Number */}
    {showRowNumbers && (
      <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">
        {globalRowIndex}
      </td>
    )}

    {/* Data Cells */}
    {cols.map((c) => (
      <td 
        key={c} 
        className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
        title={String(row[c] ?? "")}
      >
        {String(row[c] ?? "")}
      </td>
    ))}
  </motion.tr>
));

TableRow.displayName = 'TableRow';

// Loading skeleton component
const LoadingSkeleton = ({ cols, rowsCount, showRowNumbers }) => (
  <>
    {Array.from({ length: rowsCount }).map((_, i) => (
      <tr key={i} className="bg-white dark:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800/50">
        {/* Row number column skeleton */}
        {showRowNumbers && (
          <td className="px-3 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-6"></div>
          </td>
        )}
        
        {/* Data columns skeleton */}
        {cols.map((c) => (
          <td key={c} className="px-3 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

// Column Selector Component
const ColumnSelector = ({ allColumns, visibleColumns, onColumnsChange, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = useMemo(() => {
    return allColumns.filter(col => 
      col.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allColumns, searchTerm]);

  const toggleColumn = (column) => {
    const newVisibleColumns = visibleColumns.includes(column)
      ? visibleColumns.filter(col => col !== column)
      : [...visibleColumns, column];
    onColumnsChange(newVisibleColumns);
  };

  const selectAll = () => {
    onColumnsChange(allColumns);
  };

  const selectNone = () => {
    // When no columns are selected, show first 8 columns by default
    onColumnsChange(allColumns.slice(0, Math.min(8, allColumns.length)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Columns</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Check size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={selectAll}
            className="flex-1 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Reset to Default
          </button>
        </div>

        {/* Columns List */}
        <div className="max-h-64 overflow-y-auto custom-scrollbar-dark">
          <div className="space-y-1">
            {filteredColumns.map((column) => (
              <label
                key={column}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {column}
                </span>
                {visibleColumns.includes(column) ? (
                  <Eye size={14} className="text-blue-500" />
                ) : (
                  <EyeOff size={14} className="text-gray-400" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Selection Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {visibleColumns.length} of {allColumns.length} columns selected
          </p>
          {visibleColumns.length === 0 && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
              Showing first 8 columns by default
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function DataTable({ 
  rows = [], 
  pageSize = 10,
  currentPage = 0,
  totalCount = 0,
  onPageChange,
  loading = false,
  title = "Data Table",
  enableColumnSelection = true,
  defaultVisibleColumns = null
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [search, setSearch] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [showRowNumbers, setShowRowNumbers] = useState(true);

  // Memoize all columns
  const allColumns = useMemo(() => 
    rows.length ? Object.keys(rows[0]).slice(0, 100) : [], 
    [rows]
  );

  // Initialize visible columns - show first 8 by default if none selected
  useEffect(() => {
    if (!visibleColumns && allColumns.length > 0) {
      setVisibleColumns(allColumns.slice(0, Math.min(8, allColumns.length)));
    }
  }, [allColumns, visibleColumns]);

  // Ensure visibleColumns is never empty
  useEffect(() => {
    if (visibleColumns && visibleColumns.length === 0 && allColumns.length > 0) {
      setVisibleColumns(allColumns.slice(0, Math.min(8, allColumns.length)));
    }
  }, [visibleColumns, allColumns]);

  // Optimized sorting
  const sortedRows = useMemo(() => {
    if (!sortConfig.key || rows.length === 0) return rows;
    
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (aStr === bStr) return 0;
      return sortConfig.direction === "asc" 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [rows, sortConfig]);

  // Optimized search
  const filteredRows = useMemo(() => {
    if (!search.trim() || sortedRows.length === 0) return sortedRows;
    
    const lowerSearch = search.toLowerCase();
    return sortedRows.filter((row) =>
      allColumns.some((key) => {
        const value = row[key];
        return value != null && String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [search, sortedRows, allColumns]);

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(totalCount / localPageSize) || 1, 
    [totalCount, localPageSize]
  );

  // Display rows
  const displayRows = filteredRows;

  // Calculate global row numbers (across all pages)
  const getGlobalRowNumber = useCallback((index) => {
    return (currentPage * localPageSize) + index + 1;
  }, [currentPage, localPageSize]);

  // Page navigation
  const handlePageNavigation = useCallback((newPage) => {
    if (onPageChange && !loading) {
      onPageChange(newPage, localPageSize);
    }
  }, [onPageChange, loading, localPageSize]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    if (loading) return;
    setLocalPageSize(newPageSize);
    if (onPageChange) {
      onPageChange(0, newPageSize);
    }
  }, [onPageChange, loading]);

  // Sort handler
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }, []);

  // Column management
  const handleColumnsChange = useCallback((newColumns) => {
    // If no columns are selected, show first 8 by default
    if (newColumns.length === 0 && allColumns.length > 0) {
      setVisibleColumns(allColumns.slice(0, Math.min(8, allColumns.length)));
    } else {
      setVisibleColumns(newColumns);
    }
  }, [allColumns]);

  // Page numbers generation
  const getPageNumbers = useCallback(() => {
    if (totalPages <= 1) return [1];
    
    const pages = [];
    const maxVisiblePages = 5;
    const current = currentPage + 1;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, current - 1);
      let end = Math.min(totalPages - 1, current + 1);

      if (current <= 2) end = 4;
      if (current >= totalPages - 1) start = totalPages - 3;

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  const pageNumbers = useMemo(() => getPageNumbers(), [getPageNumbers]);

  // Table height calculation
  const tableHeight = useMemo(() => {
    const minRows = 10;
    const rowHeight = 48;
    const headerHeight = 57;
    const minHeight = minRows * rowHeight + headerHeight;
    
    return isMaximized ? 'calc(100vh - 200px)' : `${Math.max(minHeight, 400)}px`;
  }, [isMaximized]);

  if (!rows.length && !loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
        No data available to display.
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 ${
        isMaximized ? "fixed inset-0 z-50 overflow-auto m-0 rounded-none shadow-none" : "m-2 md:m-4 lg:m-8"
      }`}
    >
      {/* Header: Title, Search & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
        <div className="flex items-center gap-3">
          <h2 className={`font-bold text-gray-800 dark:text-white transition-all ${
            isMaximized ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}>
            {title}
          </h2>
          
          {loading && (
            <span className="text-sm font-normal text-blue-500 animate-pulse">
              Loading...
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Mobile Controls */}
          <div className="flex items-center gap-2 sm:hidden">
            <label htmlFor="rows-per-page-mobile" className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Rows:
            </label>
            <select
              id="rows-per-page-mobile"
              value={localPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          {/* Search bar */}
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search current page..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Desktop Rows Selector */}
            <div className="hidden sm:flex items-center gap-2">
              <label htmlFor="rows-per-page" className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Rows:
              </label>
              <select
                id="rows-per-page"
                value={localPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                disabled={loading}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            {/* Feature Buttons */}
            <div className="flex items-center gap-1">
              {/* Row Numbers Toggle */}
              <button
                onClick={() => setShowRowNumbers(!showRowNumbers)}
                disabled={loading}
                className={`p-2 rounded-full transition-colors ${
                  showRowNumbers 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
                aria-label={showRowNumbers ? "Hide row numbers" : "Show row numbers"}
              >
                {showRowNumbers ? (
                  <Eye size={18} className="text-blue-200" />
                ) : (
                  <EyeOff size={18} className="text-gray-400" />
                )}
              </button>

              {/* Column Selector */}
              {enableColumnSelection && (
                <div className="relative">
                  <button
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    disabled={loading}
                    className={`p-2 rounded-full transition-colors ${
                      showColumnSelector
                        ? "bg-blue-500 text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                    aria-label="Column selector"
                  >
                    <Columns size={18} />
                  </button>

                  <AnimatePresence>
                    {showColumnSelector && (
                      <ColumnSelector
                        allColumns={allColumns}
                        visibleColumns={visibleColumns || []}
                        onColumnsChange={handleColumnsChange}
                        onClose={() => setShowColumnSelector(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Maximize Button */}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                disabled={loading}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm transition-colors hover:shadow-md disabled:opacity-50"
                aria-label={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
        <div 
          className="overflow-auto"
          style={{ 
            height: tableHeight,
            maxHeight: isMaximized ? 'calc(100vh - 200px)' : '70vh'
          }}
        >
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {/* Row Number Header */}
                  {showRowNumbers && (
                    <th className="px-3 py-3 font-semibold text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap w-12">
                      #
                    </th>
                  )}

                  {/* Data Column Headers */}
                  {(visibleColumns || allColumns.slice(0, Math.min(8, allColumns.length))).map((c) => (
                    <th
                      key={c}
                      onClick={() => handleSort(c)}
                      className="px-3 py-3 font-semibold text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none transition-colors group whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{c}</span>
                        <SortIcon direction={sortConfig.key === c ? sortConfig.direction : null} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <LoadingSkeleton 
                    cols={visibleColumns || allColumns.slice(0, Math.min(8, allColumns.length))} 
                    rowsCount={localPageSize}
                    showRowNumbers={showRowNumbers}
                  />
                ) : displayRows.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={
                        (visibleColumns || allColumns.slice(0, Math.min(8, allColumns.length))).length + 
                        (showRowNumbers ? 1 : 0)
                      } 
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {search ? `No results found for "${search}" in current page.` : 'No data available in current page.'}
                    </td>
                  </tr>
                ) : (
                  displayRows.map((r, i) => (
                    <TableRow 
                      key={i} 
                      row={r} 
                      cols={visibleColumns || allColumns.slice(0, Math.min(8, allColumns.length))} 
                      index={i}
                      showRowNumbers={showRowNumbers}
                      globalRowIndex={getGlobalRowNumber(i)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer: Pagination and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 gap-3">
        {/* Row Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
            {loading ? (
              "Loading data..."
            ) : (
              <>
                Page {currentPage + 1} of {totalPages} • {displayRows.length} rows
                {search && ` (filtered)`}
              </>
            )}
          </span>
          {!loading && totalCount > 0 && (
            <span className="text-gray-400 dark:text-gray-500">
              Total: {totalCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageNavigation(0)}
              disabled={currentPage === 0 || loading}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <ChevronFirst size={18} />
            </button>

            <button
              onClick={() => handlePageNavigation(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && handlePageNavigation(pageNum - 1)}
                  disabled={pageNum === '...' || loading}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === currentPage + 1
                      ? 'bg-blue-500 text-white shadow-md'
                      : pageNum === '...'
                      ? 'text-gray-400 cursor-default'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageNavigation(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={() => handlePageNavigation(totalPages - 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <ChevronLast size={18} />
            </button>
          </div>
        )}

        <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium">
          {localPageSize} rows per page • {(visibleColumns || allColumns.slice(0, Math.min(8, allColumns.length))).length} columns
        </div>
      </div>

      {/* Quick Page Jump */}
      {totalPages > 10 && (
        <div className="flex justify-center items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">Go to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage + 1}
            onChange={(e) => {
              const newPage = parseInt(e.target.value);
              if (!isNaN(newPage) && !loading) {
                handlePageNavigation(Math.max(1, Math.min(newPage, totalPages)) - 1);
              }
            }}
            disabled={loading}
            className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">of {totalPages}</span>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .overflow-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        .dark .overflow-auto::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        
        .dark .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        .overflow-auto {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        
        .dark .overflow-auto {
          scrollbar-color: #4b5563 transparent;
        }

        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
