'use client';

import { Payment } from '@/app/types/payment';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  Mail,
  CreditCard,
  DollarSign,
  Hash,
} from 'lucide-react';

interface PaymentCardProps {
  payment: Payment;
  isSelected: boolean;
  onSelect: (payment: Payment) => void;
}

export const PaymentCard = ({
  payment,
  isSelected,
  onSelect,
}: PaymentCardProps) => {
  const getStatusColor = (status: string) => {
    const colors = {
      COMPLETED:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      PROCESSING:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PENDING:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      FAILED:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      REFUNDED:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
      colors[status as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(payment)}
      className={`cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden rounded-2xl border-2 transition-all ${
        isSelected
          ? 'border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/20'
          : 'border-rose-100 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
              {payment.customerName}
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              {payment.customerEmail || 'No email'}
            </p>
          </div>

          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
              payment.status
            )}`}
          >
            {payment.status}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Hash className="w-4 h-4 text-rose-500" />
            <span>Booking ID: {payment.bookingId}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Mail className="w-4 h-4 text-rose-500" />
            <span>{payment.customerEmail || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>Created: {formatDate(payment.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CreditCard className="w-4 h-4 text-rose-500" />
            <span>Currency: {payment.currency}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-rose-100 dark:border-rose-800/30">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {payment.transactionId
              ? `TXN: ${payment.transactionId}`
              : 'No transaction yet'}
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-rose-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              {Number(payment.amount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};