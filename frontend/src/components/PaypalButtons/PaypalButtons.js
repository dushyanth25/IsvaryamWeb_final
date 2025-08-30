import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import React, { useEffect, useState } from "react";
import { useLoading } from "../../hooks/useLoading";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { pay } from "../../services/orderService";

export default function PaypalButtons({ order }) {
  const [activeGateway, setActiveGateway] = useState("paypal");
  const [usdPrice, setUsdPrice] = useState(null);

  return (
    <div className="payment-gateway-container">
      <div className="gateway-selector">
        <button
          className={`gateway-tab ${activeGateway === "paypal" ? "active" : ""}`}
          onClick={() => setActiveGateway("paypal")}
        >
          PayPal
        </button>
        <button
          className={`gateway-tab ${activeGateway === "razorpay" ? "active" : ""}`}
          onClick={() => setActiveGateway("razorpay")}
        >
          Razorpay
        </button>
      </div>

      <div className="gateway-content">
        {activeGateway === "paypal" && (
          <PaypalGateway
            order={order}
            usdPrice={usdPrice}
            setUsdPrice={setUsdPrice}
          />
        )}
        {activeGateway === "razorpay" && <RazorpayGateway order={order} />}
      </div>
    </div>
  );
}

/* ==============================
   PAYPAL GATEWAY
================================= */
function PaypalGateway({ order, usdPrice, setUsdPrice }) {
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  // Convert INR → USD
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch(
          "https://api.exchangerate.host/convert?from=INR&to=USD"
        );
        const data = await res.json();
        const rate = data?.info?.rate || 0.012;
        setUsdPrice((order.totalPrice * rate).toFixed(2));
      } catch (err) {
        console.error("Currency conversion failed:", err);
        setUsdPrice((order.totalPrice * 0.012).toFixed(2));
      }
    }
    fetchRate();
  }, [order.totalPrice, setUsdPrice]);

  if (!usdPrice) return <div>Loading PayPal...</div>;

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: "USD",
      }}
    >
      <PaypalButtons order={order} usdPrice={usdPrice} />
    </PayPalScriptProvider>
  );
}

function PaypalButtons({ order, usdPrice }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [{ isPending }] = usePayPalScriptReducer();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    isPending ? showLoading() : hideLoading();
  }, [isPending, showLoading, hideLoading]);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: `Order Payment (₹${order.totalPrice})`,
          amount: {
            currency_code: "USD",
            value: usdPrice,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const payment = await actions.order.capture();

      // 🔑 Get user token
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem("user"));
      } catch (err) {
        console.error("❌ Failed to parse user from localStorage:", err);
      }

      if (!user?.token) {
        toast.error("Please log in to complete payment");
        navigate("/login");
        return;
      }

      const token = user.token.trim();
      console.log("🔑 Using token for PayPal save:", token);

      // Save payment to backend
      const orderId = await pay(payment.id, "paypal", token);
      clearCart();
      toast.success("Payment Saved Successfully");
      navigate("/track/" + orderId);
    } catch (error) {
      toast.error("Payment Save Failed");
      console.error(error);
    }
  };

  const onError = (err) => {
    toast.error("Payment Failed");
    console.error("PayPal Error:", err);
  };

  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
}

/* ==============================
   RAZORPAY GATEWAY (with Token)
================================= */
// Razorpay Gateway Component
function RazorpayGateway({ order }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    showLoading();

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      hideLoading();
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 🔑 Get token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("You must be logged in to make a payment.");
        hideLoading();
        return;
      }

      // ✅ Step 1: Create Razorpay order in backend
      const createOrderRes = await fetch('/api/orders/razorpay/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,   // attach token
        },
      });
      const razorpayOrder = await createOrderRes.json();

      if (!razorpayOrder?.orderId) {
        toast.error('Failed to create Razorpay order');
        hideLoading();
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Your Company Name',
        description: `Order #${order._id}`,
        order_id: razorpayOrder.orderId,
        handler: async function (response) {
          try {
            // ✅ Step 3: Verify payment
            const verifyRes = await fetch('/api/orders/razorpay/verify-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // attach token
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              toast.success('Payment Successful');
              navigate('/track/' + verifyData.orderId);
            } else {
              toast.error(verifyData.error || 'Payment Verification Failed');
            }
          } catch (err) {
            console.error('Verify Error:', err);
            toast.error('Payment Verification Failed');
          } finally {
            hideLoading();
          }
        },
        prefill: {
          name: order.name,
          email: order.email,
          contact: order.phone,
        },
        notes: {
          address: JSON.stringify(order.address || {}),
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Razorpay Init Error:', err);
      toast.error('Error initializing Razorpay');
      hideLoading();
    }
  };

  return (
    <div className={classes.razorpayContainer}>
      <button 
        onClick={displayRazorpay}
        className={classes.razorpayButton}
      >
        Pay with Razorpay
      </button>
      <p className={classes.razorpayNote}>
        You will be redirected to Razorpay's secure payment page
      </p>
    </div>
  );
}

