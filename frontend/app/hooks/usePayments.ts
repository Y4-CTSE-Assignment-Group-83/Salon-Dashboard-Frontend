import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Booking, Payment, PaymentStats, PaymentFilters } from '../types/payment';

const API_URL = 'http://localhost:5002';

export const usePayments = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    refundedAmount: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({});

  const handleResponse = async (response: Response) => {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Request failed');
    }

    return data;
  };

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/bookings`);
      const data = await handleResponse(response);
      setBookings(data.data);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/payments`);
      const data = await handleResponse(response);
      setPayments(data.data);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const currentDate = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === 'COMPLETED'
    );

    const pendingBookings = bookings.filter(
      (booking) => booking.paymentStatus === 'Pending'
    );

    const todayRevenue = paidBookings
      .filter((booking) => {
        if (!booking.paymentDate) return false;
        const paymentDate = new Date(booking.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() === todayStart.getTime();
      })
      .reduce((sum, booking) => sum + booking.servicePrice, 0);

    const weeklyRevenue = paidBookings
      .filter((booking) => {
        if (!booking.paymentDate) return false;
        return new Date(booking.paymentDate) >= weekAgo;
      })
      .reduce((sum, booking) => sum + booking.servicePrice, 0);

    const monthlyRevenue = paidBookings
      .filter((booking) => {
        if (!booking.paymentDate) return false;
        return new Date(booking.paymentDate) >= monthAgo;
      })
      .reduce((sum, booking) => sum + booking.servicePrice, 0);

    setStats({
      totalRevenue: paidBookings.reduce(
        (sum, booking) => sum + booking.servicePrice,
        0
      ),
      totalPayments: paidBookings.length,
      pendingPayments: pendingBookings.length,
      completedPayments: paidBookings.length,
      refundedAmount: bookings
        .filter((booking) => booking.paymentStatus === 'Refunded')
        .reduce((sum, booking) => sum + booking.servicePrice, 0),
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
    });
  }, [bookings]);

  // Process payment
  const processPayment = async (booking: Booking) => {
    if (booking.paymentStatus === 'COMPLETED') {
      toast.info('This booking is already paid');
      return null;
    }

    setProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking._id,
          amount: booking.servicePrice,
          customerEmail: booking.customerEmail || booking.customerName,
          customerName: booking.customerName,
          variantId: '1408974',
        }),
      });

      const payment = await handleResponse(response);

      if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      }

      return payment;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: status,
        }),
      });

      await handleResponse(response);
      await fetchBookings();
      toast.success('Payment status updated');
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (
      filters.status &&
      filters.status !== 'all' &&
      booking.paymentStatus !== filters.status
    ) {
      return false;
    }

    if (
      filters.customerName &&
      !booking.customerName
        .toLowerCase()
        .includes(filters.customerName.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.dateFrom &&
      new Date(booking.appointmentDate) < new Date(filters.dateFrom)
    ) {
      return false;
    }

    if (
      filters.dateTo &&
      new Date(booking.appointmentDate) > new Date(filters.dateTo)
    ) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    fetchBookings();
    fetchPayments();
  }, [fetchBookings, fetchPayments]);

  useEffect(() => {
    calculateStats();
  }, [bookings, calculateStats]);

  return {
    bookings,
    filteredBookings,
    payments,
    loading,
    processing,
    stats,
    selectedBooking,
    filters,
    setFilters,
    setSelectedBooking,
    processPayment,
    updatePaymentStatus,
    refreshData: fetchBookings,
  };
};