// frontend/pages/index.js
import React, {useState, useEffect, useCallback} from "react";
import FilterPanel from "../../components/FilterPanel";
import DataTable from "../../components/DataTable";
import { fetchFilters, fetchData, fetchDataCount } from "./api/Dynamic_filter_sys_API";

function useDebounce(value, delay=400) {
  const [v, setV] = useState(value);
  useEffect(()=> {
    const t = setTimeout(()=> setV(value), delay);
    return ()=> clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Home() {
  const [filtersMeta, setFiltersMeta] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  
  const debouncedFilters = useDebounce(activeFilters, 450);

  const loadFilters = useCallback(async (currentFilters) => {
    const data = await fetchFilters(currentFilters);
    setFiltersMeta(data.filters);
  }, []);

  const loadDataCount = useCallback(async (currentFilters) => {
    const data = await fetchDataCount(currentFilters);
    setTotalCount(data.count);
  }, []);

  const loadData = useCallback(async (currentFilters, page, size) => {
    setLoading(true);
    try {
      const data = await fetchData(currentFilters, size, page * size);
      setRows(data.rows);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((newPage, newPageSize) => {
    setCurrentPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  }, [pageSize]);

  // initial load - only load count and first page
  useEffect(()=> {
    loadFilters(null);
    loadDataCount(null);
    loadData(null, 0, pageSize);
  }, []);

  // whenever debouncedFilters change, update filters, count, and reset to first page
  useEffect(()=> {
    setCurrentPage(0); // Reset to first page when filters change
    loadFilters(debouncedFilters);
    loadDataCount(debouncedFilters);
  }, [debouncedFilters]);

  // Load data when page, pageSize, or filters change
  useEffect(()=> {
    loadData(debouncedFilters, currentPage, pageSize);
  }, [debouncedFilters, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            
            {/* Enhanced Header */}
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl mb-4 p-6 sm:p-8 flex flex-col gap-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-md leading-tight">
                            Dynamic Filtering System
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mt-3 max-w-2xl leading-relaxed">
                            Use the intelligent filters to refine Data results in real-time with advanced Filtering capabilities.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {totalCount.toLocaleString()} Cars
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="mt-2 flex items-center gap-4">
                    <span className="inline-block w-24 h-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-full shadow-lg"></span>
                    <span className="inline-block w-8 h-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 rounded-full shadow-lg"></span>
                    <span className="inline-block w-4 h-2 bg-pink-600 dark:bg-pink-400 rounded-full shadow-lg"></span>
                </div>
            </div>

            {/* Main Content: Filter and Results Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-start">
                
                {/* Enhanced Filters Column (Sticky on Desktop) */}
                <div className="xl:sticky xl:top-8 self-start transition-transform duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filters</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Refine your results</p>
                                </div>
                            </div>
                        </div>
                        <FilterPanel 
                            filtersMeta={filtersMeta} 
                            activeFilters={activeFilters} 
                            setActiveFilters={setActiveFilters} 
                        />
                    </div>
                </div>

                {/* Enhanced Results Column */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-green-900/20 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Dynamically Filtered Results</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {loading ? 'Loading...' : `Showing ${rows.length} of ${totalCount.toLocaleString()} items`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-2 bg-green-500/10 dark:bg-green-400/10 rounded-2xl border border-green-200 dark:border-green-800">
                                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                            Page {currentPage + 1} of {Math.ceil(totalCount / pageSize)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-1">
                            <DataTable 
                                rows={rows} 
                                pageSize={pageSize}
                                currentPage={currentPage}
                                totalCount={totalCount}
                                onPageChange={handlePageChange}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Footer */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl mt-4 p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex-1">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Powered by Advanced Filtering API Engine
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Real-Time Data Filtering, Faster Data Retrieval and Intelligent Data Handling.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {loading ? 'Loading data...' : 'Updated just now'}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}