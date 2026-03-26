'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Calendar, DollarSign } from 'lucide-react';
import { PaymentFilters } from '@/app/types/payment';

interface PaymentFiltersProps {
  filters: PaymentFilters;
  onFilterChange: (filters: PaymentFilters) => void;
}

export const PaymentFiltersComponent = ({ filters, onFilterChange }: PaymentFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Refunded', label: 'Refunded' },
  ];

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleSearchChange = (customerName: string) => {
    onFilterChange({ ...filters, customerName });
  };

  const handleDateChange = (type: 'dateFrom' | 'dateTo', value: string) => {
    onFilterChange({ ...filters, [type]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            isOpen || hasFilters
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-white text-rose-600 text-xs flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </motion.button>

        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearFilters}
            className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-80 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-800/30 z-50 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                  Filter Payments
                </h3>

                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">
                    Search Customer
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                    <input
                      type="text"
                      value={filters.customerName || ''}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Enter customer name..."
                      className="w-full pl-10 pr-4 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-900 dark:text-rose-100 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">
                    Payment Status
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={filters.status === option.value}
                          onChange={() => handleStatusChange(option.value)}
                          className="w-4 h-4 text-rose-600 border-rose-300 focus:ring-rose-500"
                        />
                        <span className="text-sm text-rose-700 dark:text-rose-300 group-hover:text-rose-900 dark:group-hover:text-rose-100">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-rose-700 dark:text-rose-300 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                      <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                      <input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={(e) => handleDateChange('dateTo', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-medium hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};