export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  status: 'PENDING' | 'Processing' | 'COMPLETED' | 'Failed' | 'Refunded';
  lemonSqueezyOrderId?: string;
  lemonSqueezyVariantId?: string;
  lemonSqueezyCheckoutRequestId?: string;
  checkoutUrl?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  serviceCategory: string;
  servicePrice: number;
  serviceDuration: number;
  appointmentDate: string;
  queueDate: string;
  queueNumber: number;
  status: 'PENDING' | 'Confirmed' | 'COMPLETED' | 'Cancelled';
  paymentStatus: 'PENDING' | 'Processing' | 'COMPLETED' | 'Failed' | 'Refunded';
  paymentId?: string;
  paymentMethod?: string;
  paymentDate?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  refundedAmount: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

export interface PaymentFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
}