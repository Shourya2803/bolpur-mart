"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useOrderStore } from "@/stores/useOrderStore";
import {
  X,
  Check,
  Clock,
  Phone,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Star,
  CreditCard,
  Banknote,
  Smartphone,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { Order } from "@/types";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  orders: Order[];
  onRefresh?: (orderId: string) => Promise<void>;
}

interface OrderStatusStep {
  id: Order["status"];
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: Date;
  icon: React.ComponentType<any>;
}

interface PaymentStatusStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: Date;
  icon: React.ComponentType<any>;
}

export function OrderTrackingModal({
  isOpen,
  onClose,
  orderId,
  orders,
  onRefresh,
}: OrderTrackingModalProps) {
  const [orderStatusSteps, setOrderStatusSteps] = useState<OrderStatusStep[]>(
    []
  );
  const [paymentStatusSteps, setPaymentStatusSteps] = useState<
    PaymentStatusStep[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const { cancelOrder } = useOrderStore();
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!order) return;

    // Order Status Steps
    const statusSteps: OrderStatusStep[] = [
      {
        id: "placed",
        label: "Order Placed",
        description: "Order received and confirmed",
        completed: true,
        active: false,
        timestamp: order.orderTracking?.placedAt || order.createdAt,
        icon: CheckCircle,
      },
      {
        id: "confirmed",
        label: "Order Confirmed",
        description: "Vendor accepted your order",
        completed: [
          "confirmed",
          "preparing",
          "out_for_delivery",
          "delivered",
        ].includes(order.status),
        active: order.status === "confirmed",
        timestamp: order.orderTracking?.confirmedAt,
        icon: Check,
      },
      {
        id: "preparing",
        label: "Preparing Order",
        description: "Your order is being prepared",
        completed: ["preparing", "out_for_delivery", "delivered"].includes(
          order.status
        ),
        active: order.status === "preparing",
        timestamp: order.orderTracking?.preparingAt,
        icon: Package,
      },
      {
        id: "out_for_delivery",
        label: "Out for Delivery",
        description: "Delivery partner is on the way",
        completed: ["out_for_delivery", "delivered"].includes(order.status),
        active: order.status === "out_for_delivery",
        timestamp: order.orderTracking?.outForDeliveryAt,
        icon: Truck,
      },
      {
        id: "delivered",
        label: "Delivered",
        description: "Order delivered successfully",
        completed: order.status === "delivered",
        active: false,
        timestamp: order.orderTracking?.deliveredAt,
        icon: CheckCircle,
      },
    ];

    setOrderStatusSteps(statusSteps);

    // Payment Status Steps - Updated to use verificationStatus
    const verificationStatus =
      order.paymentDetails?.verificationStatus || "pending";
    const paymentSteps: PaymentStatusStep[] = [
      {
        id: "initiated",
        label: "Payment Initiated",
        description:
          order.paymentMethod === "cash_on_delivery"
            ? "Cash on delivery selected"
            : "Online payment initiated",
        completed: true, // This should ALWAYS be completed since order exists
        active: false,
        timestamp: order.createdAt,
        icon:
          order.paymentMethod === "cash_on_delivery" ? Banknote : Smartphone,
      },
      {
        id: "processing",
        label:
          order.paymentMethod === "cash_on_delivery"
            ? "Awaiting Delivery"
            : "Payment Verification",
        description:
          order.paymentMethod === "cash_on_delivery"
            ? "Cash will be collected upon delivery"
            : "Verifying payment details and receipt",
        completed: verificationStatus === "verified", // Only completed when verified
        active: verificationStatus === "pending", // Active when still pending
        timestamp:
          verificationStatus === "verified" ? order.createdAt : undefined,
        icon: order.paymentMethod === "cash_on_delivery" ? Truck : CreditCard,
      },
      {
        id: "completed",
        label:
          order.paymentMethod === "cash_on_delivery"
            ? "Payment Collected"
            : "Payment Verified",
        description:
          order.paymentMethod === "cash_on_delivery"
            ? "Cash payment received successfully"
            : "Payment verified and confirmed",
        completed: verificationStatus === "verified", // Only completed when verified
        active: false, // Never active, just completed or not
        timestamp:
          verificationStatus === "verified" ? order.createdAt : undefined,
        icon: CheckCircle,
      },
    ];

    // Handle rejected payments
    if (verificationStatus === "rejected") {
      paymentSteps[1] = {
        ...paymentSteps[1],
        label: "Payment Rejected",
        description:
          order.paymentMethod === "cash_on_delivery"
            ? "Cash collection failed"
            : "Payment verification failed",
        completed: false,
        active: false, // Not active when rejected
        icon: X,
      };

      paymentSteps[2] = {
        ...paymentSteps[2],
        completed: false,
        active: false,
      };
    }

    setPaymentStatusSteps(paymentSteps);
  }, [order]);

  const getOrderProgress = () => {
    if (!order) return 0;

    // Handle cancelled and refunded orders
    if (order.status === "cancelled" || order.status === "refunded") {
      return 0;
    }

    const statusOrder = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusOrder.length) * 100
      : 0;
  };

  const getPaymentProgress = () => {
    if (!order) return 0;

    const verificationStatus =
      order.paymentDetails?.verificationStatus || "pending";

    switch (verificationStatus) {
      case "verified":
        return 100; // All 3 steps completed
      case "pending":
        return 33; // Only step 1 completed (initiated)
      case "rejected":
        return 33; // Only step 1 completed, step 2 failed
      default:
        return 33; // Default to first step completed
    }
  };

  const getEstimatedDelivery = () => {
    if (
      !order ||
      order.status === "delivered" ||
      order.status === "cancelled" ||
      order.status === "refunded"
    ) {
      return null;
    }

    // Create a proper mapping with all possible statuses
    const getEstimatedMinutes = (status: Order["status"]): number => {
      switch (status) {
        case "placed":
          return 45;
        case "confirmed":
          return 35;
        case "preparing":
          return 25;
        case "out_for_delivery":
          return 15;
        case "delivered":
          return 0;
        case "cancelled":
          return 0;
        case "refunded":
          return 0;
        default:
          return 30;
      }
    };

    const estimatedMinutes = getEstimatedMinutes(order.status);

    if (estimatedMinutes <= 0) {
      return null;
    }

    return `${Math.max(5, estimatedMinutes - 5)}-${estimatedMinutes} mins`;
  };

  const formatTime = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "");
  };

  const handleRefresh = async () => {
    if (orderId && onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh(orderId);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleCancelOrder = async () => {
    if (orderId) {
      await cancelOrder(orderId, "Cancelled by customer");
      onClose();
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md sm:max-w-md max-h-[90vh] flex flex-col"
        data-testid="order-tracking-modal"
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              Order Tracking
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 w-8"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mobile-scroll space-y-6 py-2">
          {/* Order Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <h3 className="font-bold text-lg" data-testid="order-number">
                Order #{order.orderNumber.slice(-6)}
              </h3>
              <Badge variant="outline" className="text-xs">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)} at{" "}
              {formatTime(order.createdAt)}
            </div>

            {getEstimatedDelivery() &&
              order.status !== "delivered" &&
              order.status !== "cancelled" &&
              order.status !== "refunded" && (
                <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4 mr-1" />
                  Arriving in {getEstimatedDelivery()}
                </div>
              )}

            {/* Show cancelled/refunded status */}
            {(order.status === "cancelled" || order.status === "refunded") && (
              <div className="inline-flex items-center bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm font-medium">
                <X className="w-4 h-4 mr-1" />
                {order.status === "cancelled"
                  ? "Order Cancelled"
                  : "Order Refunded"}
              </div>
            )}

            {/* Show payment verification status */}
            {order.paymentDetails?.verificationStatus === "rejected" && (
              <div className="inline-flex items-center bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-sm font-medium">
                <X className="w-4 h-4 mr-1" />
                Payment Verification Failed
              </div>
            )}
          </div>

          {/* Order Progress Section - Only show for active orders */}
          {order.status !== "cancelled" && order.status !== "refunded" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base">Order Status</h4>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(getOrderProgress())}% Complete
                </Badge>
              </div>

              <Progress value={getOrderProgress()} className="h-2" />

              <div className="space-y-3">
                {orderStatusSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            step.completed
                              ? "bg-primary border-primary text-white"
                              : step.active
                              ? "bg-primary/20 border-primary text-primary animate-pulse"
                              : "bg-muted border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {index < orderStatusSteps.length - 1 && (
                          <div
                            className={`absolute top-8 left-1/2 w-0.5 h-6 transform -translate-x-1/2 transition-colors ${
                              step.completed
                                ? "bg-primary"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p
                            className={`font-medium text-sm ${
                              step.completed || step.active
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.timestamp && (
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {formatDate(step.timestamp)} •{" "}
                              {formatTime(step.timestamp)}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Progress Section - Updated Logic */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">Payment Status</h4>
              <Badge variant="secondary" className="text-xs">
                {Math.round(getPaymentProgress())}% Complete
              </Badge>
            </div>

            <Progress value={getPaymentProgress()} className="h-2" />

            <div className="space-y-3">
              {paymentStatusSteps.map((step, index) => {
                const Icon = step.icon;
                const verificationStatus =
                  order.paymentDetails?.verificationStatus || "pending";

                return (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          step.completed
                            ? "bg-success border-success text-white" // Green when completed
                            : step.active
                            ? "bg-warning/20 border-warning text-warning animate-pulse" // Orange when active/processing
                            : verificationStatus === "rejected" &&
                              step.id === "processing"
                            ? "bg-destructive/20 border-destructive text-destructive" // Red when rejected
                            : "bg-muted border-muted-foreground/30 text-muted-foreground" // Gray when not started
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {index < paymentStatusSteps.length - 1 && (
                        <div
                          className={`absolute top-8 left-1/2 w-0.5 h-6 transform -translate-x-1/2 transition-colors ${
                            step.completed
                              ? "bg-success" // Green line when step is completed
                              : verificationStatus === "rejected" &&
                                step.id === "processing"
                              ? "bg-destructive" // Red line when rejected
                              : "bg-muted-foreground/30" // Gray line when not completed
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p
                          className={`font-medium text-sm ${
                            step.completed
                              ? "text-foreground" // Dark text when completed
                              : step.active
                              ? "text-warning font-semibold" // Orange text when active
                              : verificationStatus === "rejected" &&
                                step.id === "processing"
                              ? "text-destructive" // Red text when rejected
                              : "text-muted-foreground" // Gray text when not started
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.timestamp && (
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {formatTime(step.timestamp)}
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          step.active
                            ? "text-muted-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Show additional info for UPI payments */}
                      {order.paymentMethod === "upi_online" &&
                        step.id === "processing" &&
                        order.paymentDetails && (
                          <div className="mt-2 text-xs">
                            {"upiTransactionId" in order.paymentDetails && (
                              <p className="text-muted-foreground">
                                UPI ID: {order.paymentDetails.upiId}
                              </p>
                            )}
                            {"upiTransactionId" in order.paymentDetails && (
                              <p className="text-muted-foreground">
                                Transaction ID:{" "}
                                {order.paymentDetails.upiTransactionId}
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              <span className="text-muted-foreground mr-2">
                                Status:
                              </span>
                              <Badge
                                variant={
                                  verificationStatus === "verified"
                                    ? "default"
                                    : verificationStatus === "rejected"
                                    ? "destructive"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {verificationStatus.charAt(0).toUpperCase() +
                                  verificationStatus.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rest of your component remains the same... */}
          {/* Delivery Partner Info - Only show for active delivery statuses */}
          {(order.status === "out_for_delivery" ||
            order.status === "preparing") && (
            <div
              className="bg-card border rounded-xl p-4 space-y-3"
              data-testid="delivery-person-info"
            >
              <h4 className="font-semibold text-sm">Delivery Partner</h4>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">RK</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
                </div>

                <div className="flex-1">
                  <h3
                    className="font-medium text-sm"
                    data-testid="delivery-person-name"
                  >
                    Rajesh Kumar
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Delivery Partner
                  </p>
                  <div className="flex items-center text-xs mt-1">
                    <Star className="w-3 h-3 text-warning fill-current" />
                    <span className="ml-1 font-medium">4.8</span>
                    <span className="text-muted-foreground ml-1">
                      (250+ deliveries)
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  data-testid="call-delivery-person"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Order Items Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-sm">Order Summary</h4>

            <div className="space-y-3">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-10 h-10 rounded-md object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × ₹{formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    ₹{formatCurrency(item.total)}
                  </span>
                </div>
              ))}

              {order.items.length > 3 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{formatCurrency(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>₹{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              {order.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Taxes & Charges</span>
                  <span>₹{formatCurrency(order.taxes)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount</span>
                  <span>-₹{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total Amount</span>
                <span>₹{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-sm">Delivery Address</h4>
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {order.deliveryAddress.receiverName}
                </p>
                <p className="text-muted-foreground">
                  {order.deliveryAddress.receiverPhone}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {order.deliveryAddress.fullAddress}
                </p>
                <Badge variant="outline" className="text-xs">
                  {order?.deliveryAddress?.addressType?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {order.status !== "delivered" &&
            order.status !== "cancelled" &&
            order.status !== "refunded" && (
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                {order.isCancellable && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            )}

          {/* Show refund/support info for cancelled/refunded orders */}
          {(order.status === "cancelled" || order.status === "refunded") && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-sm">
                {order.status === "cancelled"
                  ? "Order Cancelled"
                  : "Order Refunded"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {order.status === "cancelled"
                  ? "Your order has been cancelled. If you were charged, a refund will be processed within 3-5 business days."
                  : "Your refund has been processed and will reflect in your account within 3-5 business days."}
              </p>
              <Button variant="outline" className="w-full" size="sm">
                Contact Support
              </Button>
            </div>
          )}

          {/* Show payment verification failed info */}
          {order.paymentDetails?.verificationStatus === "rejected" && (
            <div className="bg-destructive/10 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-sm text-destructive">
                Payment Verification Failed
              </h4>
              <p className="text-sm text-muted-foreground">
                {order.paymentMethod === "cash_on_delivery"
                  ? "Cash collection was unsuccessful. Please contact support to resolve this issue."
                  : "Your payment could not be verified. Please check your payment details or try again with a different payment method."}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Contact Support
                </Button>
                {order.paymentMethod === "upi_online" && (
                  <Button variant="default" size="sm" className="flex-1">
                    Retry Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
