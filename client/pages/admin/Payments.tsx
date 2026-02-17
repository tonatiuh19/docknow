import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminPayments } from "@/store/slices/adminPaymentsSlice";

const AdminPayments = () => {
  const dispatch = useAppDispatch();
  const { payments, totals, loading, error } = useAppSelector(
    (state) => state.adminPayments,
  );

  useEffect(() => {
    dispatch(fetchAdminPayments());
  }, [dispatch]);

  const getStripeStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; text: string }
    > = {
      succeeded: {
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle className="w-3 h-3" />,
        text: "Success",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-700",
        icon: <Calendar className="w-3 h-3" />,
        text: "Pending",
      },
      requires_confirmation: {
        color: "bg-blue-100 text-blue-700",
        icon: <AlertCircle className="w-3 h-3" />,
        text: "Requires Confirmation",
      },
      requires_action: {
        color: "bg-orange-100 text-orange-700",
        icon: <AlertCircle className="w-3 h-3" />,
        text: "Requires Action",
      },
      error: {
        color: "bg-red-100 text-red-700",
        icon: <AlertCircle className="w-3 h-3" />,
        text: "Error",
      },
      no_payment_intent: {
        color: "bg-gray-100 text-gray-700",
        icon: <AlertCircle className="w-3 h-3" />,
        text: "No Payment Intent",
      },
    };

    const config = statusConfig[status] || statusConfig.error;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="w-4 h-4 text-navy-600" />;
  };

  const formatAmount = (amount: number | undefined) => {
    return amount ? `$${Number(amount).toFixed(2)}` : "N/A";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <MetaHelmet
        title="Admin Payments"
        description="Track revenue, payouts, and payment transaction status for managed marinas in DockNow admin."
        noindex
      />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-navy-900 mb-2"
          >
            Payments & Revenue
          </motion.h1>
          <p className="text-navy-600 mb-4">Track your earnings and payouts</p>
          <Button className="bg-gradient-ocean shadow-lg">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-navy-500">Total Earnings</p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {formatAmount(totals.total_earned)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-500 to-navy-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-navy-500">Pending Payout</p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {formatAmount(totals.pending_payout)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-navy-500">Total Transactions</p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {totals.total_transactions || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
            <CardTitle className="flex items-center gap-2 text-navy-900">
              <DollarSign className="w-5 h-5 text-ocean-600" />
              Payment Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-navy-500">Loading payments...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ocean-50">
                      <TableHead className="font-semibold text-navy-700">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Guest
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Marina
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Booking ID
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Payment Method
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Stripe Status
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700 text-right">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <DollarSign className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                          <p className="text-navy-500">No transactions yet</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow
                          key={payment.booking_id}
                          className="hover:bg-ocean-25"
                        >
                          <TableCell className="text-navy-700">
                            {formatDate(payment.booking_date)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-navy-900">
                                {payment.guest_name}
                              </p>
                              <p className="text-sm text-navy-500">
                                {payment.guest_email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-navy-700">
                            {payment.marina_name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-ocean-600 border-ocean-200"
                            >
                              #{payment.booking_id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {payment.stripe_payment_method &&
                                getPaymentMethodIcon(
                                  payment.stripe_payment_method,
                                )}
                              <span className="capitalize text-navy-700">
                                {payment.stripe_payment_method || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStripeStatusBadge(
                              payment.stripe_status || "error",
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-navy-900">
                            <div className="flex flex-col items-end">
                              <span>{formatAmount(payment.total_amount)}</span>
                              {payment.stripe_amount &&
                                payment.stripe_amount !==
                                  payment.total_amount && (
                                  <span className="text-sm text-navy-500">
                                    (Stripe:{" "}
                                    {formatAmount(payment.stripe_amount)})
                                  </span>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
