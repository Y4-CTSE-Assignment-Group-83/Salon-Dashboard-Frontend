'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  Payment,
  PaymentStats,
  PaymentFilters,
  PaymentStatus,
  UpdatePaymentRequest,
} from '../types/payment';

const API_URL = 'http://ctse-alb-320060941.eu-north-1.elb.amazonaws.com';

const normalizeStatus = (status?: string): PaymentStatus => {
  const value = (status || '').toUpperCase();

  if (value === 'COMPLETED') return 'COMPLETED';
  if (value === 'PROCESSING') return 'PROCESSING';
  if (value === 'FAILED') return 'FAILED';
  if (value === 'REFUNDED') return 'REFUNDED';
  return 'PENDING';
};

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' && data !== null && 'message' in data
          ? String(data.message)
          : 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return 'Something went wrong';
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/payments/all`, {
        cache: 'no-store',
      });
      const data = await handleResponse(response);

      const normalized: Payment[] = Array.isArray(data)
        ? data.map((item: Payment) => ({
            ...item,
            status: normalizeStatus(item.status),
          }))
        : [];

      setPayments(normalized);
    } catch (error: unknown) {
      console.error('Error fetching payments:', error);
      toast.error(getErrorMessage(error) || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = async (id: string, payload: UpdatePaymentRequest) => {
    try {
      setProcessing(true);

      const response = await fetch(`${API_URL}/api/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const updatedPayment = await handleResponse(response);

      setPayments((prev) =>
        prev.map((payment) =>
          payment.paymentId === id
            ? { ...updatedPayment, status: normalizeStatus(updatedPayment.status) }
            : payment
        )
      );

      setSelectedPayment((prev) =>
        prev?.paymentId === id
          ? { ...updatedPayment, status: normalizeStatus(updatedPayment.status) }
          : prev
      );

      toast.success('Payment updated successfully');
      return updatedPayment;
    } catch (error: unknown) {
      console.error('Error updating payment:', error);
      toast.error(getErrorMessage(error) || 'Failed to update payment');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const deletePayment = async (id: string) => {
    try {
      setProcessing(true);

      const response = await fetch(`${API_URL}/api/payments/${id}`, {
        method: 'DELETE',
      });

      await handleResponse(response);

      setPayments((prev) => prev.filter((payment) => payment.paymentId !== id));

      setSelectedPayment((prev) => (prev?.paymentId === id ? null : prev));

      toast.success('Payment deleted successfully');
      return true;
    } catch (error: unknown) {
      console.error('Error deleting payment:', error);
      toast.error(getErrorMessage(error) || 'Failed to delete payment');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (
        filters.status &&
        filters.status !== 'all' &&
        normalizeStatus(payment.status) !== normalizeStatus(filters.status)
      ) {
        return false;
      }

      if (
        filters.customerName &&
        !payment.customerName
          .toLowerCase()
          .includes(filters.customerName.toLowerCase())
      ) {
        return false;
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        const createdAt = new Date(payment.createdAt);
        if (createdAt < fromDate) return false;
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        const createdAt = new Date(payment.createdAt);
        if (createdAt > toDate) return false;
      }

      return true;
    });
  }, [payments, filters]);

  const stats = useMemo<PaymentStats>(() => {
    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const completedPayments = payments.filter(
      (payment) => normalizeStatus(payment.status) === 'COMPLETED'
    );

    const pendingPayments = payments.filter(
      (payment) => normalizeStatus(payment.status) === 'PENDING'
    );

    const refundedPayments = payments.filter(
      (payment) => normalizeStatus(payment.status) === 'REFUNDED'
    );

    const todayRevenue = completedPayments
      .filter((payment) => {
        const date = new Date(payment.paidAt || payment.updatedAt || payment.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === todayStart.getTime();
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const weeklyRevenue = completedPayments
      .filter((payment) => {
        const date = new Date(payment.paidAt || payment.updatedAt || payment.createdAt);
        return date >= weekAgo;
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const monthlyRevenue = completedPayments
      .filter((payment) => {
        const date = new Date(payment.paidAt || payment.updatedAt || payment.createdAt);
        return date >= monthAgo;
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return {
      totalRevenue: completedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      totalPayments: payments.length,
      pendingPayments: pendingPayments.length,
      completedPayments: completedPayments.length,
      refundedAmount: refundedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
    };
  }, [payments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    filteredPayments,
    loading,
    processing,
    stats,
    filters,
    selectedPayment,
    setFilters,
    setSelectedPayment,
    updatePayment,
    deletePayment,
    refreshData: fetchPayments,
  };
};