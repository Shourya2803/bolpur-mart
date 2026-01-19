// components/ui/order-confirmation-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Package, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export function OrderConfirmationDialog({
  isOpen,
  order,
  onClose,
}: OrderConfirmationDialogProps) {
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !order) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShowCountdown(false);
          clearInterval(timer);
          // Auto redirect to orders page
          setTimeout(() => {
            router.push("/orders");
            onClose();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, order, router, onClose]);

  const handleViewOrders = () => {
    router.push("/orders");
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price).replace('₹', '');
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-sm mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="text-center py-6">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full animate-bounce">
              <span className="text-white text-xs font-bold flex items-center justify-center h-full">✓</span>
            </div>
          </div>

          {/* Countdown or Success Message */}
          {showCountdown ? (
            <div className="mb-6">
              <div className="text-6xl font-bold text-green-600 animate-pulse mb-2">
                {countdown}
              </div>
              <p className="text-gray-600">Redirecting to your orders...</p>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                🎉 Order Placed Successfully!
              </h2>
              <p className="text-gray-600">
                Your order has been confirmed and is being processed
              </p>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-green-100">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono font-bold text-green-700">
                  {order.orderNumber}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-lg text-green-800">
                  ₹{formatPrice(order.total)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method</span>
                <span className="capitalize font-medium">
                  {order.paymentMethod.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-gray-600">Delivery Address</span>
                <div className="text-right max-w-48">
                  <p className="font-medium">{order.deliveryAddress.receiverName}</p>
                  <p className="text-xs text-gray-500">{order.deliveryAddress.street}</p>
                  <p className="text-xs text-gray-500">
                    {order.deliveryAddress.city}, {order.deliveryAddress.pinCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-blue-50 rounded-lg p-3 mb-6 border border-blue-100">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Estimated Delivery: {order.estimatedDeliveryTime.toLocaleString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleViewOrders}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              size="lg"
            >
              <Package className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
            
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50"
            >
              Continue Shopping
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
            <p className="text-green-800 font-medium">
              Thank you for choosing Bolpur Mart! 🛒
            </p>
            <p className="text-green-600 text-sm mt-1">
              We'll keep you updated on your order status
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
