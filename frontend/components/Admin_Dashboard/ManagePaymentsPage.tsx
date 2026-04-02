'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Mail,
  Calendar,
  CreditCard,
  RefreshCw,
  Download,
  ArrowLeft,
  Trash2,
  Pencil,
  Save,
  XCircle,
  Hash,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Payment, PaymentStatus } from '@/app/types/payment';
import { PaymentCard } from '@/components/payments/PaymentCard';
import { PaymentStatsDisplay } from '@/components/payments/PaymentStats';
import { PaymentFiltersComponent } from '@/components/payments/PaymentFilters';
import { usePayments } from '@/app/hooks/usePayments';

type EditFormState = {
  customerName: string;
  customerEmail: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
};

export default function ManagePaymentsPage() {
  const {
    payments,
    filteredPayments,
    loading,
    processing,
    stats,
    selectedPayment,
    filters,
    setFilters,
    setSelectedPayment,
    updatePayment,
    deletePayment,
    refreshData,
  } = usePayments();

  console.log('Payments:', payments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    payment: Payment | null;
  }>({
    show: false,
    payment: null,
  });

  const [editForm, setEditForm] = useState<EditFormState>({
    customerName: '',
    customerEmail: '',
    amount: '',
    currency: 'USD',
    status: 'PENDING',
  });

  // useEffect(() => {
  //   if (selectedPayment) {
  //     setEditForm({
  //       customerName: selectedPayment.customerName || '',
  //       customerEmail: selectedPayment.customerEmail || '',
  //       amount: String(selectedPayment.amount ?? ''),
  //       currency: selectedPayment.currency || 'USD',
  //       status: selectedPayment.status,
  //     });
  //   }
  // }, [selectedPayment]);

  const exportToCSV = () => {
    const headers = [
      'Payment ID',
      'Booking ID',
      'Customer Name',
      'Customer Email',
      'Amount',
      'Currency',
      'Status',
      'Transaction ID',
      'Created At',
      'Paid At',
    ];

    const data = filteredPayments.map((payment) => [
      payment.paymentId,
      payment.bookingId,
      payment.customerName,
      payment.customerEmail || 'N/A',
      payment.amount,
      payment.currency,
      payment.status,
      payment.transactionId || 'N/A',
      new Date(payment.createdAt).toLocaleString(),
      payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'N/A',
    ]);

    const csv = [headers, ...data]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReceipt = (payment: Payment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${payment.customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .receipt { max-width: 500px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #e11d48; }
            .details { border-top: 2px dashed #ccc; border-bottom: 2px dashed #ccc; padding: 20px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; gap: 20px; }
            .row span:last-child { text-align: right; }
            .total { font-size: 20px; font-weight: bold; color: #e11d48; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">Salon Payment</div>
              <p>Payment Receipt</p>
            </div>
            <div class="details">
              <div class="row"><span>Payment ID:</span> <span>${payment.paymentId}</span></div>
              <div class="row"><span>Booking ID:</span> <span>${payment.bookingId}</span></div>
              <div class="row"><span>Date:</span> <span>${new Date(payment.createdAt).toLocaleString()}</span></div>
              <div class="row"><span>Customer:</span> <span>${payment.customerName}</span></div>
              <div class="row"><span>Email:</span> <span>${payment.customerEmail || 'N/A'}</span></div>
              <div class="row"><span>Status:</span> <span>${payment.status}</span></div>
              <div class="row"><span>Currency:</span> <span>${payment.currency}</span></div>
              <div class="row total"><span>Amount:</span> <span>${Number(payment.amount).toFixed(2)}</span></div>
              <div class="row"><span>Transaction ID:</span> <span>${payment.transactionId || 'N/A'}</span></div>
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleSave = async () => {
    if (!selectedPayment) return;

    if (!editForm.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!editForm.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }

    if (!editForm.amount || Number(editForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const result = await updatePayment(selectedPayment.paymentId, {
      customerName: editForm.customerName.trim(),
      customerEmail: editForm.customerEmail.trim(),
      amount: Number(editForm.amount),
      currency: editForm.currency.trim() || 'USD',
      status: editForm.status,
    });

    if (result) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.payment) return;

    const success = await deletePayment(deleteModal.payment.paymentId);

    if (success) {
      setDeleteModal({ show: false, payment: null });
      setShowDetails(false);
    }
  };

  const statusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
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

    return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
            Manage all payment records from payment service only
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={exportToCSV}
            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={refreshData}
            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <PaymentStatsDisplay stats={stats} loading={loading} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PaymentFiltersComponent filters={filters} onFilterChange={setFilters} />
        <div className="text-sm text-rose-600 dark:text-rose-400">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-rose-50 dark:bg-rose-950/20 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
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
            Try adjusting your filters
          </p>
        </motion.div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredPayments.map((payment) => (
            <PaymentCard
              key={payment.paymentId}
              payment={payment}
              isSelected={selectedPayment?.paymentId === payment.paymentId}
              onSelect={(p) => {
  setSelectedPayment(p);
  setShowDetails(true);
  setIsEditing(false);

  setEditForm({
    customerName: p.customerName || '',
    customerEmail: p.customerEmail || '',
    amount: String(p.amount ?? ''),
    currency: p.currency || 'USD',
    status: p.status,
  });
}}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showDetails && selectedPayment && (
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
                <div className="p-6 border-b border-rose-100 dark:border-rose-800/30 flex items-center justify-between gap-4">
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
                        Payment ID: {selectedPayment.paymentId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => printReceipt(selectedPayment)}
                      className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors"
                    >
                      Print
                    </button>

                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleSave}
                        disabled={processing}
                        className="px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setDeleteModal({ show: true, payment: selectedPayment })
                      }
                      className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-rose-500 mt-1" />
                          <div className="w-full">
                            <p className="text-sm text-rose-600 dark:text-rose-400">Customer Name</p>
                            {isEditing ? (
                              <input
                                value={editForm.customerName}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    customerName: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-800 text-rose-900 dark:text-rose-100"
                              />
                            ) : (
                              <p className="font-medium text-rose-900 dark:text-rose-100">
                                {selectedPayment.customerName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-rose-500 mt-1" />
                          <div className="w-full">
                            <p className="text-sm text-rose-600 dark:text-rose-400">Customer Email</p>
                            {isEditing ? (
                              <input
                                value={editForm.customerEmail}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    customerEmail: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-800 text-rose-900 dark:text-rose-100"
                              />
                            ) : (
                              <p className="font-medium text-rose-900 dark:text-rose-100">
                                {selectedPayment.customerEmail}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-rose-500 mt-1" />
                          <div className="w-full">
                            <p className="text-sm text-rose-600 dark:text-rose-400">Amount</p>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    amount: e.target.value,
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-800 text-rose-900 dark:text-rose-100"
                              />
                            ) : (
                              <p className="font-bold text-2xl text-rose-900 dark:text-rose-100">
                                ${Number(selectedPayment.amount).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <CreditCard className="w-5 h-5 text-rose-500 mt-1" />
                          <div className="w-full">
                            <p className="text-sm text-rose-600 dark:text-rose-400">Currency</p>
                            {isEditing ? (
                              <input
                                value={editForm.currency}
                                onChange={(e) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    currency: e.target.value.toUpperCase(),
                                  }))
                                }
                                className="mt-1 w-full px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-800 text-rose-900 dark:text-rose-100"
                              />
                            ) : (
                              <p className="font-medium text-rose-900 dark:text-rose-100">
                                {selectedPayment.currency}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-rose-800/30">
                      <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-100 mb-4">
                        Payment Metadata
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Booking ID</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {selectedPayment.bookingId}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Status</p>
                          {isEditing ? (
                            <select
                              value={editForm.status}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  status: e.target.value as PaymentStatus,
                                }))
                              }
                              className="mt-1 w-full px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-800 text-rose-900 dark:text-rose-100"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="FAILED">FAILED</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block mt-1 px-4 py-2 text-sm font-medium rounded-full ${statusBadgeClass(
                                selectedPayment.status
                              )}`}
                            >
                              {selectedPayment.status}
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Transaction ID</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100 break-all">
                            {selectedPayment.transactionId || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Checkout URL</p>
                          {selectedPayment.checkoutUrl ? (
                            <a
                              href={selectedPayment.checkoutUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-blue-600 dark:text-blue-400 break-all underline"
                            >
                              Open checkout
                            </a>
                          ) : (
                            <p className="font-medium text-rose-900 dark:text-rose-100">N/A</p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Created At</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {new Date(selectedPayment.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Updated At</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {new Date(selectedPayment.updatedAt).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Paid At</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100">
                            {selectedPayment.paidAt
                              ? new Date(selectedPayment.paidAt).toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-rose-600 dark:text-rose-400">Order ID</p>
                          <p className="font-medium text-rose-900 dark:text-rose-100 break-all">
                            {selectedPayment.lemonSqueezyOrderId || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              customerName: selectedPayment.customerName || '',
                              customerEmail: selectedPayment.customerEmail || '',
                              amount: String(selectedPayment.amount ?? ''),
                              currency: selectedPayment.currency || 'USD',
                              status: selectedPayment.status,
                            });
                          }}
                          className="px-5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>

                        <button
                          onClick={handleSave}
                          disabled={processing}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal.show && deleteModal.payment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ show: false, payment: null })}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-[90%] max-w-md h-fit bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[70] p-6"
            >
              <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-100 mb-4">
                Delete Payment
              </h3>

              <p className="text-rose-600 dark:text-rose-400 mb-6">
                Are you sure you want to delete payment for{' '}
                <span className="font-semibold">{deleteModal.payment.customerName}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? 'Deleting...' : 'Confirm Delete'}
                </button>

                <button
                  onClick={() => setDeleteModal({ show: false, payment: null })}
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