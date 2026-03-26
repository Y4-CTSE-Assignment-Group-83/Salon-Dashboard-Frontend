'use client';

import { PaymentStats } from '@/app/types/payment';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';

interface PaymentStatsProps {
  stats: PaymentStats;
  loading?: boolean;
}

export const PaymentStatsDisplay = ({ stats, loading }: PaymentStatsProps) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Completed Payments',
      value: stats.completedPayments,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: Clock,
      gradient: 'from-yellow-500 to-amber-600',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Weekly Revenue',
      value: `$${stats.weeklyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: RefreshCw,
      gradient: 'from-indigo-500 to-purple-600',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 bg-rose-50 dark:bg-rose-950/20 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.text}`} />
            </div>
          </div>
          <div
            className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${card.gradient} opacity-50`}
          />
        </motion.div>
      ))}
    </div>
  );
};