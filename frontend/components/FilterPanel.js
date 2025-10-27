"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  XCircle,
  Filter,
  Search,
  RotateCcw,
  Check,
} from "lucide-react";

/**
 * FilterPanel Component
 * 
 * A sophisticated filter panel with collapsible sections, search functionality,
 * and support for multiple filter types (categorical, boolean, numeric, date).
 * Features real-time validation, undo functionality, and responsive design.
 * 
 * @param {Object} filtersMeta - Metadata defining available filters and their types
 * @param {Object} activeFilters - Currently active filter selections
 * @param {Function} setActiveFilters - Callback to update active filters
 */
export default function FilterPanel({ filtersMeta, activeFilters, setActiveFilters }) {
  // State for expanded/collapsed filter sections
  const [expandedCols, setExpandedCols] = useState({});
  
  // State for search terms within categorical filters
  const [searchTerms, setSearchTerms] = useState({});
  
  // State for recently cleared filters (enables undo)
  const [recentlyCleared, setRecentlyCleared] = useState(null);
  
  // State for input validation errors
  const [inputErrors, setInputErrors] = useState({});
  
  // State for local range values (numeric/date filters)
  const [localRangeValues, setLocalRangeValues] = useState({});

  // Auto-expand first filter on initial load for better UX
  useEffect(() => {
    if (filtersMeta && 
        Object.keys(filtersMeta).length > 0 && 
        Object.keys(expandedCols).length === 0) {
      const firstCol = Object.keys(filtersMeta)[0];
      setExpandedCols({ [firstCol]: true });
    }
  }, [filtersMeta]);

  // Color palette for visual distinction between filter sections
  const COLOR_PALETTE = [
    { bg: "bg-blue-500", hover: "hover:bg-blue-400", text: "text-blue-400", 
      light: "bg-blue-900", border: "border-blue-700", checkbox: "text-blue-400" },
    { bg: "bg-green-500", hover: "hover:bg-green-400", text: "text-green-400", 
      light: "bg-green-900", border: "border-green-700", checkbox: "text-green-400" },
    { bg: "bg-purple-500", hover: "hover:bg-purple-400", text: "text-purple-400", 
      light: "bg-purple-900", border: "border-purple-700", checkbox: "text-purple-400" },
    { bg: "bg-orange-500", hover: "hover:bg-orange-400", text: "text-orange-400", 
      light: "bg-orange-900", border: "border-orange-700", checkbox: "text-orange-400" },
    { bg: "bg-pink-500", hover: "hover:bg-pink-400", text: "text-pink-400", 
      light: "bg-pink-900", border: "border-pink-700", checkbox: "text-pink-400" },
    { bg: "bg-indigo-500", hover: "hover:bg-indigo-400", text: "text-indigo-400", 
      light: "bg-indigo-900", border: "border-indigo-700", checkbox: "text-indigo-400" },
    { bg: "bg-teal-500", hover: "hover:bg-teal-400", text: "text-teal-400", 
      light: "bg-teal-900", border: "border-teal-700", checkbox: "text-teal-400" },
    { bg: "bg-amber-500", hover: "hover:bg-amber-400", text: "text-amber-400", 
      light: "bg-amber-900", border: "border-amber-700", checkbox: "text-amber-400" },
  ];

  /**
   * Get color scheme for a filter column based on its index
   * Cycles through color palette for visual variety
   */
  const getColumnColor = (columnIndex) => {
    return COLOR_PALETTE[columnIndex % COLOR_PALETTE.length];
  };

  /**
   * Get color for individual options within a filter column
   * Provides subtle color variations within the same column
   */
  const getOptionColor = (columnIndex, optionIndex) => {
    const baseColor = COLOR_PALETTE[columnIndex % COLOR_PALETTE.length];
    const optionColors = [
      { ...baseColor }, // Base color
      { ...COLOR_PALETTE[(columnIndex + 2) % COLOR_PALETTE.length] }, // Slightly different
      { ...COLOR_PALETTE[(columnIndex + 4) % COLOR_PALETTE.length] }, // More different
    ];
    return optionColors[optionIndex % optionColors.length];
  };

  // Show loading state while filters metadata is being fetched
  if (!filtersMeta) {
    return (
      <div className="p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 w-full min-h-[120px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <p>Loading filter options...</p>
        </div>
      </div>
    );
  }

  /**
   * Validate range input values (numeric or date)
   * Provides real-time validation with helpful error messages
   */
  const validateRangeInput = (col, value, meta, isMin, otherValue = null) => {
    // Allow empty values (will reset to default)
    if (value === "") return true;

    if (meta.type === "date") {
      const dateValue = new Date(value);
      
      // Check if date is valid
      if (isNaN(dateValue.getTime())) {
        return "Please enter a valid date";
      }

      const minDate = new Date(meta.min);
      const maxDate = new Date(meta.max);

      // Cross-validation between min and max inputs
      if (otherValue !== null) {
        const otherDate = new Date(otherValue);
        if (isMin && !isNaN(otherDate.getTime()) && dateValue > otherDate) {
          return "Minimum date cannot exceed maximum date";
        }
        if (!isMin && !isNaN(otherDate.getTime()) && dateValue < otherDate) {
          return "Maximum date cannot be less than minimum date";
        }
      }

      // Validate against absolute bounds
      if (isMin && dateValue > maxDate) {
        return `Minimum date cannot exceed ${maxDate.toLocaleDateString()}`;
      }
      if (!isMin && dateValue < minDate) {
        return `Maximum date cannot be less than ${minDate.toLocaleDateString()}`;
      }
      if (isMin && dateValue < minDate) {
        return `Minimum date cannot be less than ${minDate.toLocaleDateString()}`;
      }
      if (!isMin && dateValue > maxDate) {
        return `Maximum date cannot exceed ${maxDate.toLocaleDateString()}`;
      }
    } else {
      // Numeric validation
      const numValue = Number(value);
      if (isNaN(numValue)) return "Please enter a valid number";

      // Cross-validation between min and max
      if (otherValue !== null && otherValue !== "") {
        const otherNum = Number(otherValue);
        if (isMin && numValue > otherNum) {
          return "Minimum cannot exceed maximum value";
        }
        if (!isMin && numValue < otherNum) {
          return "Maximum cannot be less than minimum value";
        }
      }

      // Validate against absolute bounds
      if (isMin && numValue > meta.max) {
        return `Minimum cannot exceed ${meta.max}`;
      }
      if (!isMin && numValue < meta.min) {
        return `Maximum cannot be less than ${meta.min}`;
      }
      if (isMin && numValue < meta.min) {
        return `Minimum cannot be less than ${meta.min}`;
      }
      if (!isMin && numValue > meta.max) {
        return `Maximum cannot exceed ${meta.max}`;
      }
    }

    return true; // Validation passed
  };

  /**
   * Toggle categorical/boolean filter options
   * Includes haptic feedback for mobile devices
   */
  const onToggleOption = (col, value) => {
    const current = activeFilters[col] || [];
    let next;

    if (current.includes(value)) {
      next = current.filter((x) => x !== value);
    } else {
      next = [...current, value];
    }

    // Haptic feedback for better mobile UX
    if (navigator.vibrate) navigator.vibrate(10);

    setActiveFilters({ ...activeFilters, [col]: next.length ? next : undefined });
    
    // Clear any errors when making valid selections
    setInputErrors((prev) => ({ ...prev, [col]: undefined }));
  };

  /**
   * Handle range input changes with real-time validation
   */
  const onRangeInputChange = (col, isMin, value, meta) => {
    // Update local state for immediate feedback
    setLocalRangeValues(prev => ({
      ...prev,
      [col]: {
        ...prev[col],
        [isMin ? 'min' : 'max']: value
      }
    }));

    const currentValues = localRangeValues[col] || {};
    const otherValue = isMin ? currentValues.max : currentValues.min;

    // Real-time validation
    const validation = validateRangeInput(col, value, meta, isMin, otherValue);

    if (validation !== true) {
      setInputErrors((prev) => ({
        ...prev,
        [col]: { 
          ...prev[col],
          [isMin ? "min" : "max"]: validation 
        },
      }));
    } else {
      // Clear error if validation passes
      setInputErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[col]) {
          delete newErrors[col][isMin ? "min" : "max"];
          if (Object.keys(newErrors[col]).length === 0) {
            delete newErrors[col];
          }
        }
        return newErrors;
      });
    }
  };

  /**
   * Handle range input blur events - commit changes to active filters
   */
  const onRangeBlur = (col, isMin, value, meta) => {
    // Handle empty input - reset to default
    if (value === "") {
      const current = activeFilters[col] || [meta.min, meta.max];
      const newMin = isMin ? meta.min : current[0];
      const newMax = isMin ? current[1] : meta.max;

      if (newMin === meta.min && newMax === meta.max) {
        const newFilters = { ...activeFilters };
        delete newFilters[col];
        setActiveFilters(newFilters);
      } else {
        setActiveFilters({ ...activeFilters, [col]: [newMin, newMax] });
      }
      return;
    }

    const currentValues = localRangeValues[col] || {};
    const otherValue = isMin ? currentValues.max : currentValues.min;
    const validation = validateRangeInput(col, value, meta, isMin, otherValue);

    if (validation !== true) {
      return; // Don't update active filters if there's an error
    }

    const current = activeFilters[col] || [meta.min, meta.max];
    
    let newMin, newMax;
    
    if (meta.type === "date") {
      newMin = isMin ? value : current[0];
      newMax = isMin ? current[1] : value;
      
      // Ensure values are within bounds for dates
      const minDate = new Date(meta.min);
      const maxDate = new Date(meta.max);
      const safeMin = new Date(Math.max(minDate.getTime(), new Date(newMin).getTime())).toISOString().split('T')[0];
      const safeMax = new Date(Math.min(maxDate.getTime(), new Date(newMax).getTime())).toISOString().split('T')[0];
      
      if (safeMin !== meta.min || safeMax !== meta.max) {
        setActiveFilters({ ...activeFilters, [col]: [safeMin, safeMax] });
      } else {
        const newFilters = { ...activeFilters };
        delete newFilters[col];
        setActiveFilters(newFilters);
      }
    } else {
      // Numeric handling
      newMin = isMin ? Number(value) : current[0];
      newMax = isMin ? current[1] : Number(value);

      // Ensure values are within bounds
      const safeMin = Math.max(meta.min, Math.min(newMin, meta.max));
      const safeMax = Math.max(meta.min, Math.min(newMax, meta.max));

      if (safeMin !== meta.min || safeMax !== meta.max) {
        setActiveFilters({ ...activeFilters, [col]: [safeMin, safeMax] });
      } else {
        const newFilters = { ...activeFilters };
        delete newFilters[col];
        setActiveFilters(newFilters);
      }
    }
  };

  /**
   * Update search terms for categorical filters
   */
  const onSearchChange = (col, value) => {
    setSearchTerms((prev) => ({ ...prev, [col]: value.toLowerCase() }));
  };

  /**
   * Toggle expand/collapse for filter sections
   */
  const toggleExpand = (col) => {
    setExpandedCols((prev) => ({ ...prev, [col]: !prev[col] }));
  };

  /**
   * Clear all filters with undo capability
   */
  const handleClearAll = () => {
    const previousFilters = { ...activeFilters };
    setActiveFilters({});
    setExpandedCols({});
    setSearchTerms({});
    setInputErrors({});
    setLocalRangeValues({});

    // Show undo functionality for 5 seconds
    setRecentlyCleared(previousFilters);
    setTimeout(() => setRecentlyCleared(null), 5000);
  };

  /**
   * Undo the last clear all operation
   */
  const handleUndoClear = () => {
    if (recentlyCleared) {
      setActiveFilters(recentlyCleared);
      setRecentlyCleared(null);
    }
  };

  /**
   * Clear a specific filter and its associated state
   */
  const handleClearFilter = (col) => {
    const newFilters = { ...activeFilters };
    delete newFilters[col];
    setActiveFilters(newFilters);

    // Clear all associated state for this column
    const newSearchTerms = { ...searchTerms };
    delete newSearchTerms[col];
    setSearchTerms(newSearchTerms);

    const newErrors = { ...inputErrors };
    delete newErrors[col];
    setInputErrors(newErrors);

    const newLocalValues = { ...localRangeValues };
    delete newLocalValues[col];
    setLocalRangeValues(newLocalValues);
  };

  /**
   * Calculate active filter count, excluding default values
   */
  const filterCount = Object.keys(activeFilters).filter((key) => {
    const filter = activeFilters[key];
    if (Array.isArray(filter)) {
      if (filter.length === 0) return false;
      
      // For range filters, check if they're different from default
      const meta = filtersMeta[key];
      if (meta && (meta.type === "numeric" || meta.type === "integer" || meta.type === "date")) {
        return filter[0] !== meta.min || filter[1] !== meta.max;
      }
      return true;
    }
    
    return filter !== undefined;
  }).length;

  /**
   * Filter options based on search term
   */
  const getFilteredOptions = (col, meta) => {
    const searchTerm = searchTerms[col] || "";
    const options = meta.type === "boolean" ? [true, false] : meta.options || [];

    let filtered = options;

    // Apply search filter if present
    if (searchTerm) {
      filtered = filtered.filter((opt) => 
        String(opt).toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  return (
    <div className="w-full lg:w-80 flex flex-col p-5 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300 h-full max-h-screen overflow-hidden">
      {/* Header - Only show when filters are active */}
      <AnimatePresence>
        {filterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center pb-4 border-b border-gray-700 mb-4 flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              {/* Undo Button for Recently Cleared Filters */}
              {recentlyCleared && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleUndoClear}
                  className="flex items-center gap-1 text-xs text-green-400 font-semibold p-2 rounded-full hover:bg-green-900 transition-all"
                >
                  <RotateCcw size={14} />
                  Undo
                </motion.button>
              )}

              {/* Clear All Button */}
              <motion.button
                onClick={handleClearAll}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm text-red-400 font-semibold p-2 px-3 rounded-xl hover:bg-red-900 transition-all border border-red-700"
              >
                <XCircle size={20} />
                Clear All
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Count & Progress Indicator */}
      <AnimatePresence>
        {filterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-blue-900 rounded-xl border border-blue-700 flex-shrink-0"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-400 font-medium">
                {filterCount} filter{filterCount !== 1 ? "s" : ""} active
              </span>
              <div className="w-24 bg-blue-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((filterCount / Object.keys(filtersMeta).length) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently Cleared Notification */}
      <AnimatePresence>
        {recentlyCleared && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-green-900 rounded-xl border border-green-700 text-green-400 text-sm flex-shrink-0"
          >
            Filters cleared.{" "}
            <button onClick={handleUndoClear} className="font-semibold underline">
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Categories - Scrollable Area */}
      <div className={`flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar-dark ${filterCount === 0 ? 'pt-2' : ''}`}>
        <div className="flex flex-col gap-4 pb-2">
          {Object.entries(filtersMeta).map(([col, meta], colIndex) => {
            const isExpanded = expandedCols[col] ?? false;
            const isActive = activeFilters[col] !== undefined;
            const filteredOptions = getFilteredOptions(col, meta);
            const columnColor = getColumnColor(colIndex);

            // Calculate active option count for badge
            let activeCount = 0;
            if (meta.type === "categorical" || meta.type === "boolean") {
              activeCount = (activeFilters[col] || []).length;
            } else if (isActive) {
              if (["integer", "numeric", "date"].includes(meta.type)) {
                const [min, max] = activeFilters[col] || [meta.min, meta.max];
                if (min !== meta.min || max !== meta.max) {
                  activeCount = 1;
                }
              }
            }

            return (
              <motion.div
                key={col}
                layout
                className={`bg-gray-900 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? `${columnColor.border} shadow-lg ${columnColor.light.replace("bg-", "shadow-")}`
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                {/* Filter Header - Click to Expand/Collapse */}
                <div
                  className={`flex justify-between items-center px-4 py-3 cursor-pointer select-none rounded-xl transition-all ${
                    isExpanded ? `${columnColor.light} bg-opacity-80` : "hover:bg-gray-700"
                  }`}
                  onClick={() => toggleExpand(col)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Filter Icon */}
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? `${columnColor.bg} text-white` : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      <Filter size={14} />
                    </div>
                    
                    {/* Filter Title and Metadata */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-semibold text-sm block truncate transition-colors ${
                          isActive ? `${columnColor.text}` : "text-gray-200"
                        }`}
                      >
                        {col}
                      </span>
                      <span className="text-xs text-gray-400 block truncate">
                        {meta.type} • {meta.options?.length || 2} options
                      </span>
                    </div>
                    
                    {/* Active Filter Badge */}
                    {activeCount > 0 && (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`${columnColor.bg} text-white text-xs px-2 py-1 rounded-full font-bold min-w-[24px] flex items-center justify-center`}
                      >
                        {activeCount}
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-2">
                    {isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearFilter(col);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-900 transition-colors"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expandable Filter Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="border-t border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 flex flex-col gap-4">
                        {/* Search for categorical filters with many options */}
                        {meta.type === "categorical" && meta.options && meta.options.length > 5 && (
                          <div className="relative">
                            <Search
                              size={16}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            />
                            <input
                              type="text"
                              placeholder={`Search ${col}...`}
                              value={searchTerms[col] || ""}
                              onChange={(e) => onSearchChange(col, e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-gray-800 text-white"
                            />
                          </div>
                        )}

                        {/* Options List for Categorical and Boolean Filters */}
                        {["categorical", "boolean"].includes(meta.type) && (
                          <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar-dark">
                            {filteredOptions.length > 0 ? (
                              filteredOptions.map((opt, optIndex) => {
                                const value = meta.type === "boolean" ? opt : String(opt);
                                const isChecked = (activeFilters[col] || []).includes(value);
                                const optionColor = getOptionColor(colIndex, optIndex);

                                return (
                                  <motion.div
                                    key={optIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: optIndex * 0.03 }}
                                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all group ${
                                      isChecked
                                        ? `${optionColor.bg} text-white shadow-md ${optionColor.border.replace("border-", "shadow-")}`
                                        : `hover:bg-gray-800 border border-transparent hover:border-gray-700`
                                    }`}
                                    onClick={() => onToggleOption(col, value)}
                                  >
                                    {/* Custom Checkbox */}
                                    <div
                                      className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                                        isChecked
                                          ? "bg-white border-white"
                                          : `border-gray-500 group-hover:${optionColor.checkbox}`
                                      }`}
                                    >
                                      {isChecked && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className={`${optionColor.bg} rounded-sm w-3 h-3`}
                                        />
                                      )}
                                    </div>

                                    {/* Option Label */}
                                    <span
                                      className={`flex-1 font-medium text-sm transition-colors ${
                                        isChecked ? "text-white" : "text-gray-200"
                                      }`}
                                    >
                                      {String(opt)}
                                    </span>

                                    {/* Checkmark for Selected Options */}
                                    {isChecked && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-white"
                                      >
                                        <Check size={16} />
                                      </motion.div>
                                    )}
                                  </motion.div>
                                );
                              })
                            ) : (
                              <div className="text-center py-4 text-gray-400 text-sm">
                                No options found
                              </div>
                            )}
                          </div>
                        )}

                        {/* Range Inputs for Numeric and Date Filters */}
                        {["integer", "numeric", "date"].includes(meta.type) && (
                          <EnhancedRangeFilter
                            col={col}
                            meta={meta}
                            activeFilters={activeFilters}
                            onRangeInputChange={onRangeInputChange}
                            onRangeBlur={onRangeBlur}
                            type={meta.type === "date" ? "date" : "number"}
                            isDecimal={meta.type === "numeric"}
                            inputErrors={inputErrors[col]}
                            columnColor={columnColor}
                            localRangeValues={localRangeValues[col]}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2 flex-shrink-0">
        <button
          onClick={() => setExpandedCols({})}
          className="flex-1 py-2 px-3 text-gray-300 text-sm font-medium rounded-xl border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          Collapse All
        </button>
        <button
          onClick={() => {
            const allExpanded = Object.fromEntries(
              Object.keys(filtersMeta).map((key) => [key, true])
            );
            setExpandedCols(allExpanded);
          }}
          className="flex-1 py-2 px-3 text-blue-400 text-sm font-medium rounded-xl border border-blue-700 hover:bg-blue-900 transition-colors"
        >
          Expand All
        </button>
      </div>
    </div>
  );
}

/**
 * EnhancedRangeFilter Component
 * 
 * Handles numeric and date range inputs with validation and visual feedback.
 * Features stacked layout for dates and side-by-side layout for numbers.
 * 
 * @param {string} col - Column identifier
 * @param {Object} meta - Filter metadata
 * @param {Object} activeFilters - Current active filters
 * @param {Function} onRangeInputChange - Change handler
 * @param {Function} onRangeBlur - Blur handler
 * @param {string} type - Input type ('number' or 'date')
 * @param {boolean} isDecimal - Whether to allow decimal values
 * @param {Object} inputErrors - Validation errors
 * @param {Object} columnColor - Color scheme for this column
 * @param {Object} localRangeValues - Local state values
 */
const EnhancedRangeFilter = ({
  col,
  meta,
  activeFilters,
  onRangeInputChange,
  onRangeBlur,
  type,
  isDecimal = false,
  inputErrors,
  columnColor,
  localRangeValues = {},
}) => {
  const [minFilter, maxFilter] = activeFilters[col] || [];
  const currentMin = minFilter === undefined || minFilter === meta.min ? "" : minFilter;
  const currentMax = maxFilter === undefined || maxFilter === meta.max ? "" : maxFilter;

  // Use local values for real-time feedback, fallback to active filters
  const displayMin = localRangeValues?.min !== undefined ? localRangeValues.min : currentMin;
  const displayMax = localRangeValues?.max !== undefined ? localRangeValues.max : currentMax;

  /**
   * Format values for display, handling dates and numbers
   */
  const formatDisplayValue = (value, isDefault = false) => {
    if (value === undefined || value === null || value === "") return "-";
    if (type === "date") {
      try {
        const date = new Date(value);
        return isDefault ? date.toLocaleDateString() : date.toISOString().split('T')[0];
      } catch {
        return "-";
      }
    }
    return isDefault ? value.toLocaleString() : value;
  };

  /**
   * Get date attributes for date input constraints
   */
  const getDateAttributes = () => {
    if (type !== "date") return {};
    
    try {
      const minDate = new Date(meta.min);
      const maxDate = new Date(meta.max);
      
      return {
        min: minDate.toISOString().split('T')[0],
        max: maxDate.toISOString().split('T')[0]
      };
    } catch {
      return {};
    }
  };

  const dateAttributes = getDateAttributes();
  
  // Use stacked layout for dates, side-by-side for numbers
  const isDateInput = type === "date";
  const layoutClass = isDateInput ? "flex flex-col gap-3" : "flex gap-3 flex-col sm:flex-row";
  const inputClass = isDateInput ? "w-full" : "w-full";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400 font-medium">Select range:</span>
        <span className="text-gray-500 text-xs">
          Default: {formatDisplayValue(meta.min, true)} to {formatDisplayValue(meta.max, true)}
        </span>
      </div>

      {/* Dynamic Layout - Stacked for dates, side-by-side for numbers */}
      <div className={layoutClass}>
        {/* Minimum Input */}
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs text-gray-300 mb-2 font-medium flex items-center gap-1">
            <div className={`w-2 h-2 ${columnColor.bg} rounded-full`}></div>
            Minimum
          </label>
          <input
            type={type}
            step={isDecimal ? "any" : "1"}
            placeholder={String(meta.min ?? "")}
            value={type === "date" && displayMin ? formatDisplayValue(displayMin) : displayMin}
            {...(type === "date" ? dateAttributes : {})}
            onChange={(e) => onRangeInputChange(col, true, e.target.value, meta)}
            onBlur={(e) => onRangeBlur(col, true, e.target.value, meta)}
            className={`${inputClass} border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:border-blue-400 transition-all text-sm shadow-sm bg-gray-700 ${
              inputErrors?.min
                ? "border-red-400 focus:ring-red-400 bg-red-900"
                : "border-gray-600 focus:ring-blue-400"
            } ${type === "date" ? "date-input-dark" : ""}`}
          />
          {inputErrors?.min && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs mt-1 flex items-center gap-1"
            >
              <XCircle size={12} />
              {inputErrors.min}
            </motion.p>
          )}
        </div>

        {/* Maximum Input */}
        <div className="flex flex-col flex-1 min-w-0">
          <label className="text-xs text-gray-300 mb-2 font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Maximum
          </label>
          <input
            type={type}
            step={isDecimal ? "any" : "1"}
            placeholder={String(meta.max ?? "")}
            value={type === "date" && displayMax ? formatDisplayValue(displayMax) : displayMax}
            {...(type === "date" ? dateAttributes : {})}
            onChange={(e) => onRangeInputChange(col, false, e.target.value, meta)}
            onBlur={(e) => onRangeBlur(col, false, e.target.value, meta)}
            className={`${inputClass} border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:border-blue-400 transition-all text-sm shadow-sm bg-gray-700 ${
              inputErrors?.max
                ? "border-red-400 focus:ring-red-400 bg-red-900"
                : "border-gray-600 focus:ring-blue-400"
            } ${type === "date" ? "date-input-dark" : ""}`}
          />
          {inputErrors?.max && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs mt-1 flex items-center gap-1"
            >
              <XCircle size={12} />
              {inputErrors.max}
            </motion.p>
          )}
        </div>
      </div>

      {/* Visual Range Indicator */}
      <div className="pt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{formatDisplayValue(meta.min, true)}</span>
          <span>{formatDisplayValue(meta.max, true)}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className={`${columnColor.bg} h-2 rounded-full transition-all duration-500`}
            style={{
              width: displayMin || displayMax ? "100%" : "0%",
              opacity: displayMin || displayMax ? 1 : 0.3,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Custom CSS for dark theme scrollbar and date inputs
const styles = `
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

/* Date input specific styles for dark theme */
.date-input-dark::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

.date-input-dark {
  min-width: 100%;
}

/* Ensure consistent spacing for stacked layout */
.flex-col {
  gap: 12px;
}

/* Ensure date inputs don't overflow */
.date-input-dark {
  width: 100%;
}

/* Fix for input focus states */
input:focus {
  outline: none;
  ring: 2px;
}
`;

// Inject styles into document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  styleSheet.id = "dark-theme-scrollbar-styles";
  if (!document.getElementById(styleSheet.id)) {
    document.head.appendChild(styleSheet);
  }
}