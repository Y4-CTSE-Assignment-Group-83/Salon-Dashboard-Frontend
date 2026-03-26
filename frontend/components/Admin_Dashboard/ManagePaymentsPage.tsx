'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Printer,
  Download,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PaymentCard } from '@/components/payments/PaymentCard';
import { PaymentStatsDisplay } from '@/components/payments/PaymentStats';
import { PaymentFiltersComponent } from '@/components/payments/PaymentFilters';
import { Booking } from '@/app/types/payment';
import { usePayments } from '@/app/hooks/usePayments';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export default function ManagePaymentsPage() {
  const {
    bookings,
    filteredBookings,
    loading,
    processing,
    stats,
    selectedBooking,
    filters,
    setFilters,
    setSelectedBooking,
    processPayment,
    updatePaymentStatus,
    refreshData,
  } = usePayments();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDetails, setShowDetails] = useState(false);
  const [refundModal, setRefundModal] = useState<{ show: boolean; booking: Booking | null }>({
    show: false,
    booking: null,
  });

  const handleRefund = async (booking: Booking) => {
    try {
      const response = await axios.post(`${API_URL}/api/payments/refund`, {
        bookingId: booking._id,
        amount: booking.servicePrice,
      });

      if (response.data.success) {
        await updatePaymentStatus(booking._id, 'Refunded');
        toast.success('Refund processed successfully');
        setRefundModal({ show: false, booking: null });
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast.error('Failed to process refund');
    }
  };

  const exportToCSV = () => {
    const headers = ['Customer', 'Email', 'Phone', 'Service', 'Amount', 'Status', 'Date', 'Queue'];
    const data = filteredBookings.map(b => [
      b.customerName,
      b.customerEmail || 'N/A',
      b.customerPhone,
      b.serviceName,
      b.servicePrice,
      b.paymentStatus,
      new Date(b.appointmentDate).toLocaleDateString(),
      `#${b.queueNumber}`,
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const printReceipt = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${booking.customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .receipt { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
            .details { border-top: 2px dashed #ccc; border-bottom: 2px dashed #ccc; padding: 20px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { font-size: 20px; font-weight: bold; color: #e11d48; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">LUME Salon</div>
              <p>Payment Receipt</p>
            </div>
            <div class="details">
              <div class="row"><span>Receipt #:</span> <span>RCP-${booking._id.slice(-6)}</span></div>
              <div class="row"><span>Date:</span> <span>${new Date().toLocaleDateString()}</span></div>
              <div class="row"><span>Customer:</span> <span>${booking.customerName}</span></div>
              <div class="row"><span>Phone:</span> <span>${booking.customerPhone}</span></div>
              <div class="row"><span>Service:</span> <span>${booking.serviceName}</span></div>
              <div class="row"><span>Queue:</span> <span>#${booking.queueNumber} (${booking.queueDate})</span></div>
              <div class="row total"><span>Amount Paid:</span> <span>$${booking.servicePrice.toFixed(2)}</span></div>
              <div class="row"><span>Payment Status:</span> <span>${booking.paymentStatus}</span></div>
            </div>
            <div class="footer">
              <p>Thank you for choosing LUME Salon!</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
            Manage and process customer payments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-rose-100 dark:bg-rose-900/50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              List
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <PaymentStatsDisplay stats={stats} loading={loading} />

      {/* Filters */}
      <div className="flex items-center justify-between">
        <PaymentFiltersComponent filters={filters} onFilterChange={setFilters} />
        <div className="text-sm text-rose-600 dark:text-rose-400">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Bookings Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-rose-50 dark:bg-rose-950/20 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white/50 dark:bg-gray-900/50 rounded-2xl"
        >
          <DollarSign className="w-16 h-16 mx-auto text-rose-300 dark:text-rose-700 mb-4" />
          <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
            No Payments Found
          </h3>
          <p className="text-rose-600 dark:text-rose-400">
            {filters.status ? 'Try adjusting your filters' : 'No bookings available yet'}
          </p>
        </motion.div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredBookings.map((booking) => (
            <PaymentCard
              key={booking._id}
              booking={booking}
              isSelected={selectedBooking?._id === booking._id}
              onSelect={(b) => {
                setSelectedBooking(b);
                setShowDetails(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Selected Booking Details Modal */}
      <AnimatePresence>
        {showDetails && selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-10 lg:inset-20 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-rose-100 dark:border-rose-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-rose-900 dark:text-rose-100">
                        Payment Details
                      </h2>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        Booking #{selectedBooking.queueNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => printReceipt(selectedBooking)}
                      className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                        Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-rose-500" />
                          <div>
                            <p className="text-sm text-rose-600 dark:text-rose-400">Name</p>
                            <p className="font-medium text-rose-900 dark:text-rose-100">
                              {selectedBooking.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-rose-500" />
                          <div>
                            <p className="text-sm text-rose-600 dark:text-rose-400">Phone</p>
                            <p className="font-medium text-rose-900 dark:text-rose-100">
                              {selectedBooking.customerPhone}
                            </p>
                          </div>
                        </div>
                        {selectedBooking.customerEmail && (
                          <div className="flex items-center gap-3 md:col-span-2">
                            <Mail className="w-5 h-5 text-rose-500" />
                            <div>
                              <p className="text-sm text-rose-600 dark:text-rose-400">Email</p>
                              <p className="font-medium text-rose-900 dark:text-rose-100">
                                {selectedBooking.customerEmail}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                        Service Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Service</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {selectedBooking.serviceName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Category</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {selectedBooking.serviceCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Duration</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {selectedBooking.serviceDuration} minutes
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Price</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                            ${selectedBooking.servicePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Appointment & Queue */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                        <Calendar className="w-5 h-5 text-rose-500 mb-3" />
                        <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Appointment Date</p>
                        <p className="text-lg font-semibold text-rose-900 dark:text-rose-100">
                          {new Date(selectedBooking.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                        <Clock className="w-5 h-5 text-rose-500 mb-3" />
                        <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Queue Information</p>
                        <p className="text-lg font-semibold text-rose-900 dark:text-rose-100">
                          #{selectedBooking.queueNumber} - {selectedBooking.queueDate}
                        </p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                        Payment Status
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                            selectedBooking.paymentStatus === 'COMPLETED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : selectedBooking.paymentStatus === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : selectedBooking.paymentStatus === 'Failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {selectedBooking.paymentStatus}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          {selectedBooking.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => processPayment(selectedBooking)}
                              disabled={processing}
                              className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                            >
                              {processing ? 'Processing...' : 'Process Payment'}
                            </button>
                          )}
                          {selectedBooking.paymentStatus === 'COMPLETED' && (
                            <button
                              onClick={() => setRefundModal({ show: true, booking: selectedBooking })}
                              className="px-6 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment History */}
                    {selectedBooking.paymentMethod && (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                        <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                          Payment History
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-rose-500" />
                              <div>
                                <p className="font-medium text-rose-900 dark:text-rose-100">
                                  {selectedBooking.paymentMethod}
                                </p>
                                <p className="text-xs text-rose-600 dark:text-rose-400">
                                  {selectedBooking.paymentDate ? new Date(selectedBooking.paymentDate).toLocaleString() : 'Date not available'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-rose-900 dark:text-rose-100">
                                ${selectedBooking.servicePrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {selectedBooking.paymentId ? 'Transaction ID: ' + selectedBooking.paymentId.slice(-8) : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {refundModal.show && refundModal.booking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRefundModal({ show: false, booking: null })}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-[90%] max-w-md h-fit bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[70] p-6"
            >
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">
                Process Refund
              </h3>
              <p className="text-rose-600 dark:text-rose-400 mb-6">
                Are you sure you want to refund ${refundModal.booking.servicePrice.toFixed(2)} for {refundModal.booking.customerName}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRefund(refundModal.booking!)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  Confirm Refund
                </button>
                <button
                  onClick={() => setRefundModal({ show: false, booking: null })}
                  className="flex-1 px-4 py-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}