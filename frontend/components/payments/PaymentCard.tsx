'use client';

import { Booking } from '@/app/types/payment';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Tag, CreditCard, DollarSign } from 'lucide-react';

interface PaymentCardProps {
  booking: Booking;
  isSelected: boolean;
  onSelect: (booking: Booking) => void;
}

export const PaymentCard = ({ booking, isSelected, onSelect }: PaymentCardProps) => {
  const getStatusColor = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect(booking)}
      className={`cursor-pointer bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden rounded-2xl border-2 transition-all ${
        isSelected
          ? 'border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/20'
          : 'border-rose-100 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100">
              {booking.serviceName}
            </h3>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              {booking.serviceCategory}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {booking.customerName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {booking.customerPhone}
            </span>
          </div>
        </div>

        {/* Queue & Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-rose-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Queue</p>
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                #{booking.queueNumber} - {booking.queueDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(booking.appointmentDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status & Amount */}
        <div className="flex items-center justify-between pt-4 border-t border-rose-100 dark:border-rose-800/30">
          <div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-rose-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              {booking.servicePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method if available */}
        {booking.paymentMethod && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <CreditCard className="w-3 h-3" />
            <span>Paid via {booking.paymentMethod}</span>
            {booking.paymentDate && (
              <>
                <span>•</span>
                <span>{new Date(booking.paymentDate).toLocaleDateString()}</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};