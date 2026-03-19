'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  ArrowRight,
  History
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthContext } from '@/app/context/AuthContext';
import { Booking } from '@/app/types/payment';

const API_URL = 'http://localhost:5002';

export default function CustomerPaymentsPage() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'COMPLETED'>('all');

  // console.log(bookings);
  
  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    // if (!user?.email) return;
    
    try {
      setLoading(true);
      // Assuming there's an endpoint to get bookings by customer email
      const response = await axios.get(`${API_URL}/api/bookings`);
      console.log('All bookings:', response);
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (booking: Booking) => {
    if (booking.paymentStatus === 'COMPLETED') {
      toast.info('This booking is already paid');
      return;
    }

    setProcessing(booking._id);
    try {
      const response = await axios.post(`${API_URL}/api/payments/create`, {
        bookingId: booking._id,
        amount: booking.servicePrice,
        customerEmail: booking.customerEmail || user?.email,
        customerName: booking.customerName,
        variantId: "1408974",
      });

      const payment = response.data;
      
      if (payment.checkoutUrl) {
        // Save current booking to localStorage for reference after redirect
        localStorage.setItem('pendingPayment', JSON.stringify({
          bookingId: booking._id,
          amount: booking.servicePrice,
        }));
        window.location.href = payment.checkoutUrl;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessing(null);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'pending') return booking.paymentStatus === 'Pending';
    if (filter === 'COMPLETED') return booking.paymentStatus === 'COMPLETED';
    return true;
  });

  const totalSpent = bookings
    .filter(b => b.paymentStatus === 'COMPLETED')
    .reduce((sum, b) => sum + b.servicePrice, 0);

  const pendingAmount = bookings
    .filter(b => b.paymentStatus === 'Pending')
    .reduce((sum, b) => sum + b.servicePrice, 0);

  const totalPayments = bookings
    .filter(b => b.paymentStatus === 'COMPLETED')
    .length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const downloadReceipt = (booking: Booking) => {
    // Generate PDF-like HTML receipt
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - LUME Salon</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 40px; 
              background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
            }
            .receipt { 
              max-width: 500px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 24px; 
              padding: 32px; 
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #fecdd3; 
              padding-bottom: 20px;
            }
            .logo { 
              font-size: 28px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #e11d48, #f59e0b);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .details { 
              padding: 20px 0; 
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 15px; 
              padding: 10px 0;
              border-bottom: 1px dashed #fecdd3;
            }
            .total { 
              font-size: 24px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #e11d48, #f59e0b);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-top: 20px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #9f1239; 
              font-size: 14px;
            }
            .queue-number {
              background: #fecdd3;
              padding: 15px;
              border-radius: 16px;
              text-align: center;
              margin: 20px 0;
            }
            .queue-number h2 {
              font-size: 48px;
              color: #9f1239;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">LUME Salon</div>
              <p style="color: #9f1239; margin-top: 5px;">Where Beauty Begins</p>
            </div>
            
            <div class="queue-number">
              <p style="color: #9f1239; margin-bottom: 5px;">Your Queue Number</p>
              <h2>#${booking.queueNumber}</h2>
              <p style="color: #9f1239;">${booking.queueDate}</p>
            </div>
            
            <div class="details">
              <div class="row">
                <span style="color: #9f1239;">Receipt #:</span>
                <span style="color: #1e293b; font-weight: 500;">RCP-${booking._id.slice(-8)}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Date:</span>
                <span style="color: #1e293b;">${new Date().toLocaleDateString()}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Customer:</span>
                <span style="color: #1e293b;">${booking.customerName}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Phone:</span>
                <span style="color: #1e293b;">${booking.customerPhone}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Service:</span>
                <span style="color: #1e293b;">${booking.serviceName}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Category:</span>
                <span style="color: #1e293b;">${booking.serviceCategory}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Appointment:</span>
                <span style="color: #1e293b;">${formatDate(booking.appointmentDate)}</span>
              </div>
              <div class="row">
                <span style="color: #9f1239;">Duration:</span>
                <span style="color: #1e293b;">${booking.serviceDuration} minutes</span>
              </div>
              <div class="row total">
                <span>Total Paid:</span>
                <span>$${booking.servicePrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing LUME Salon!</p>
              <p>We look forward to seeing you.</p>
              <p style="margin-top: 20px; font-size: 12px;">${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px]">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-rose-600 dark:text-rose-400">Loading your payments...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
          My Payments
        </h1>
        <p className="text-rose-600 dark:text-rose-400 mt-1">
          View and manage your payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-rose-500 to-amber-500 rounded-2xl p-6 text-white"
        >
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90 mb-1">Total Spent</p>
          <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30"
        >
          <CreditCard className="w-8 h-8 text-rose-500 mb-3" />
          <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Total Payments</p>
          <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">
            {totalPayments}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30"
        >
          <Clock className="w-8 h-8 text-amber-500 mb-3" />
          <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Pending Amount</p>
          <p className="text-3xl font-bold text-amber-600">${pendingAmount.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'pending'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'COMPLETED'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Payments List */}
      {filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white/50 dark:bg-gray-900/50 rounded-2xl"
        >
          <History className="w-16 h-16 mx-auto text-rose-300 dark:text-rose-700 mb-4" />
          <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
            No Payments Found
          </h3>
          <p className="text-rose-600 dark:text-rose-400">
            {filter === 'pending' 
              ? "You don't have any pending payments" 
              : filter === 'COMPLETED'
              ? "You haven't made any payments yet"
              : "No payment history available"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Section - Service Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
                      {booking.serviceName}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-rose-600 dark:text-rose-400">Queue</p>
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                        #{booking.queueNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-rose-600 dark:text-rose-400">Date</p>
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                        {formatDate(booking.appointmentDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-rose-600 dark:text-rose-400">Amount</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                        ${booking.servicePrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-rose-600 dark:text-rose-400">Category</p>
                      <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                        {booking.serviceCategory}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-3">
                  {booking.paymentStatus === 'Pending' && (
                    <button
                      onClick={() => handlePayment(booking)}
                      disabled={processing === booking._id}
                      className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {processing === booking._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay Now
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                  
                  {booking.paymentStatus === 'COMPLETED' && (
                    <button
                      onClick={() => downloadReceipt(booking)}
                      className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
                      title="Download Receipt"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 p-6"
            >
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">
                Booking Details
              </h3>
              
              <div className="space-y-4">
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4">
                  <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">Queue Number</p>
                  <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">
                    #{selectedBooking.queueNumber}
                  </p>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    {selectedBooking.queueDate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Service</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {selectedBooking.serviceName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Category</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {selectedBooking.serviceCategory}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Date</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {formatDate(selectedBooking.appointmentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Duration</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {selectedBooking.serviceDuration} min
                    </p>
                  </div>
                </div>

                <div className="border-t border-rose-100 dark:border-rose-800/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-rose-600 dark:text-rose-400">Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                      ${selectedBooking.servicePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-6 py-2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-medium hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}