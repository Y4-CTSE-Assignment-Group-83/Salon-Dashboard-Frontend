'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle,
  Download,
  ArrowRight,
  History
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthContext } from '@/app/context/AuthContext';
import { Booking, Payment } from '@/app/types/payment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = 'http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com';
const API_URL2 = 'http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com';

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};
export default function CustomerPaymentsPage() {
  const { user } = useAuthContext();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [completedPayments, setCompletedPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  // useEffect(() => {
  //   fetchData();
  // }, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPendingBookings(), fetchCompletedPayments()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const fetchPendingBookings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings`);
      const allBookings = response.data.data;
      // Filter bookings that are not yet paid (paymentStatus is PENDING)
      const pending = allBookings.filter((booking: Booking) => booking.status === 'PENDING');
      console.log('dd',pending)
      setPendingBookings(pending);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      toast.error('Failed to load pending bookings');
    }
  };

  const fetchCompletedPayments = async () => {
    try {
      const response = await axios.get(`${API_URL2}/api/payments/all`);
      // Assuming the API returns { success: true, data: Payment[] }
       // response.data is the array
    const payments = Array.isArray(response.data) ? response.data : [];

    // Filter only COMPLETED
    const completed = payments.filter(
      (payment: Payment) => payment.status === 'COMPLETED'
    );
      setCompletedPayments(completed);
    } catch (error) {
      console.error('Error fetching completed payments:', error);
      toast.error('Failed to load payment history');
    }
  };

  const handlePayment = async (booking: Booking) => {
    if (booking.paymentStatus === 'COMPLETED') {
      toast.info('This booking is already paid');
      return;
    }

    setProcessing(booking._id);
    try {
      const response = await axios.post(`${API_URL2}/api/payments/create`, {
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
    } catch (error: unknown) {
      console.error('Payment error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to process payment');
      } else {
        toast.error('Failed to process payment');
      }
    } finally {
      setProcessing(null);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'COMPLETED':
  //       return <CheckCircle className="w-5 h-5 text-green-500" />;
  //     case 'Failed':
  //       return <XCircle className="w-5 h-5 text-red-500" />;
  //     case 'PENDING':
  //       return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  //     default:
  //       return <Clock className="w-5 h-5 text-gray-500" />;
  //   }
  // };

  const totalSpent = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = pendingBookings.reduce((sum, booking) => sum + booking.servicePrice, 0);
  const totalPayments = completedPayments.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generatePDFReceipt = (payment: Payment, booking?: Booking) => {
     const doc = new jsPDF() as JsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add gradient-like effect with colors
    doc.setFillColor(245, 158, 11, 0.1);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Header with logo and salon name
    doc.setFontSize(28);
    doc.setTextColor(225, 29, 72);
    doc.text('LUME', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(245, 158, 11);
    doc.text('Salon', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text('Where Beauty Begins', pageWidth / 2, 36, { align: 'center' });
    
    // Receipt title
    doc.setFontSize(20);
    doc.setTextColor(225, 29, 72);
    doc.text('PAYMENT RECEIPT', pageWidth / 2, 55, { align: 'center' });
    
    // Add decorative line
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.line(40, 60, pageWidth - 40, 60);
    
    // Receipt info
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Receipt #: RCP-${payment._id.slice(-8)}`, 20, 75);
    doc.text(`Date: ${formatDateTime(payment.paidAt || payment.createdAt)}`, 20, 82);
    doc.text(`Transaction ID: ${payment.transactionId || payment._id.slice(-8)}`, 20, 89);
    
    if (payment.lemonSqueezyOrderId) {
      doc.text(`Order ID: ${payment.lemonSqueezyOrderId}`, 20, 96);
    }
    
    // Customer details section
    doc.setFontSize(12);
    doc.setTextColor(225, 29, 72);
    doc.text('Customer Information', 20, 110);
    doc.setDrawColor(245, 158, 11);
    doc.line(20, 112, 70, 112);
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Name: ${payment.customerName}`, 20, 122);
    doc.text(`Email: ${payment.customerEmail}`, 20, 129);
    
    let startY = 136;
    
    // Service details if booking is available
    if (booking) {
      doc.setFontSize(12);
      doc.setTextColor(225, 29, 72);
      doc.text('Service Details', 20, startY);
      doc.setDrawColor(245, 158, 11);
      doc.line(20, startY + 2, 70, startY + 2);
      
      startY += 12;
      
      const serviceData = [
        ['Service:', booking.serviceName],
        ['Category:', booking.serviceCategory],
        ['Duration:', `${booking.serviceDuration} minutes`],
        ['Appointment Date:', formatDate(booking.appointmentDate)],
        ['Queue Number:', `#${booking.queueNumber}`],
        ['Queue Date:', booking.queueDate],
      ];
      
      autoTable(doc, {
        startY: startY,
        head: [],
        body: serviceData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: [55, 65, 81],
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [225, 29, 72] },
          1: { textColor: [55, 65, 81] },
        },
        margin: { left: 20, right: 20 },
      });
      
      startY = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Payment details table
    doc.setFontSize(12);
    doc.setTextColor(225, 29, 72);
    doc.text('Payment Summary', 20, startY);
    doc.setDrawColor(245, 158, 11);
    doc.line(20, startY + 2, 70, startY + 2);
    
    startY += 12;
    
    autoTable(doc, {
      startY: startY,
      head: [['Description', 'Amount']],
      body: [
        ['Service Payment', `$${payment.amount.toFixed(2)}`],
        ['Tax', '$0.00'],
        ['Total', `$${payment.amount.toFixed(2)}`],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 10,
      },
      footStyles: {
        fillColor: [225, 29, 72],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
      },
      margin: { left: 20, right: 20 },
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for choosing LUME Salon!', pageWidth / 2, finalY, { align: 'center' });
    doc.text('We look forward to seeing you soon.', pageWidth / 2, finalY + 6, { align: 'center' });
    doc.text('For any inquiries, please contact us at support@lumesalon.com', pageWidth / 2, finalY + 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(8);
    doc.setTextColor(209, 213, 219);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, finalY + 25, { align: 'center' });
    
    // Save the PDF
    doc.save(`receipt-${payment._id.slice(-8)}.pdf`);
  };

  const fetchBookingForPayment = async (bookingId: string): Promise<Booking | null> => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings/${bookingId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking for payment:', error);
      return null;
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    let booking: Booking | null = null;
    // if (payment.bookingId) {
    //   booking = await fetchBookingForPayment(payment.bookingId);
    // }
    generatePDFReceipt(payment, booking || undefined);
    toast.success('Receipt downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-600 dark:text-rose-400">Loading your payments...</p>
        </div>
      </div>
    );
  }

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

      {/* Filters - Only Pending and Completed */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'pending'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
          }`}
        >
          Pending Payments
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'completed'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
              : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50'
          }`}
        >
          Completed Payments
        </button>
      </div>

      {/* Pending Payments List */}
      {filter === 'pending' && (
        <>
          {pendingBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/50 dark:bg-gray-900/50 rounded-2xl"
            >
              <History className="w-16 h-16 mx-auto text-rose-300 dark:text-rose-700 mb-4" />
              <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
                No Pending Payments
              </h3>
              <p className="text-rose-600 dark:text-rose-400">
                You don&apos;t have any pending payments at the moment
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking, index) => (
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
        </>
      )}

      {/* Completed Payments List */}
      {filter === 'completed' && (
        <>
          {completedPayments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/50 dark:bg-gray-900/50 rounded-2xl"
            >
              <CheckCircle className="w-16 h-16 mx-auto text-rose-300 dark:text-rose-700 mb-4" />
              <h3 className="text-lg font-medium text-rose-900 dark:text-rose-100 mb-2">
                No Completed Payments
              </h3>
              <p className="text-rose-600 dark:text-rose-400">
                You haven&apos;t made any payments yet
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {completedPayments.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Section - Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
                          Payment Receipt
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-rose-600 dark:text-rose-400">Transaction ID</p>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100 truncate">
                            {payment.transactionId || payment._id.slice(-8)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-rose-600 dark:text-rose-400">Date</p>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            {formatDateTime(payment.paidAt || payment.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-rose-600 dark:text-rose-400">Amount</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                            ${payment.amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-rose-600 dark:text-rose-400">Customer</p>
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100 truncate">
                            {payment.customerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownloadReceipt(payment)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                      
                      <button
                        onClick={() => setSelectedPayment(payment)}
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
        </>
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

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 p-6"
            >
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">
                Payment Details
              </h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    Payment Completed
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {formatDateTime(selectedPayment.paidAt || selectedPayment.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Transaction ID</p>
                    <p className="font-mono text-sm font-medium text-rose-900 dark:text-rose-100">
                      {selectedPayment.transactionId || selectedPayment._id.slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Order ID</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {selectedPayment.lemonSqueezyOrderId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Customer</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100">
                      {selectedPayment.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 dark:text-rose-400">Email</p>
                    <p className="font-medium text-rose-900 dark:text-rose-100 truncate">
                      {selectedPayment.customerEmail}
                    </p>
                  </div>
                </div>

                <div className="border-t border-rose-100 dark:border-rose-800/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-rose-600 dark:text-rose-400">Amount Paid</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                      ${selectedPayment.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedPayment(null)}
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