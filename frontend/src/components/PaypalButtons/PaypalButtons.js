import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import React, { useEffect, useState } from 'react';
import { useLoading } from '../../hooks/useLoading';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { pay } from '../../services/orderService';

export default function PaymentButtons({ order }) {
  const [activeGateway, setActiveGateway] = useState('paypal');
  const [usdPrice, setUsdPrice] = useState(null);

  return (
    <div className="payment-gateway-container">
      <div className="gateway-selector">
        <button
          className={`gateway-tab ${activeGateway === 'paypal' ? 'active' : ''}`}
          onClick={() => setActiveGateway('paypal')}
        >
          PayPal
        </button>
        <button
          className={`gateway-tab ${activeGateway === 'razorpay' ? 'active' : ''}`}
          onClick={() => setActiveGateway('razorpay')}
        >
          Razorpay
        </button>
      </div>

      <div className="gateway-content">
        {activeGateway === 'paypal' && (
          <PaypalGateway order={order} usdPrice={usdPrice} setUsdPrice={setUsdPrice} />
        )}
        {activeGateway === 'razorpay' && (
          <RazorpayGateway order={order} />
        )}
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
        const res = await fetch("https://api.exchangerate.host/convert?from=INR&to=USD");
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
            currency_code: 'USD',
            value: usdPrice,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const payment = await actions.order.capture();
      const orderId = await pay(payment.id, 'paypal');
      clearCart();
      toast.success('Payment Saved Successfully');
      navigate('/track/' + orderId);
    } catch (error) {
      toast.error('Payment Save Failed');
      console.error(error);
    }
  };

  const onError = (err) => {
    toast.error('Payment Failed');
    console.error('PayPal Error:', err);
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
   RAZORPAY GATEWAY
================================= */
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

    // Load Razorpay SDK
    const sdkLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!sdkLoaded) {
      hideLoading();
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // ✅ Step 1: Ask backend to create Razorpay Order
      // Step 1: Ask backend to create Razorpay Order
const createOrderRes = await fetch('/api/orders/razorpay/create-order', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}` // ✅ add this
  },
  credentials: 'include',
});

      const razorpayOrder = await createOrderRes.json();

      if (!razorpayOrder?.orderId) {
        toast.error('Failed to create Razorpay order');
        hideLoading();
        return;
      }

      // ✅ Step 2: Open Razorpay Checkout
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Isvaryam',
        description: `Order #${order._id}`,
        order_id: razorpayOrder.orderId,
        handler: async function (response) {
          try {
            // ✅ Step 3: Verify payment with backend
            const verifyRes = await fetch('/api/orders/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // if using JWT
              },
              credentials: 'include',
              body: JSON.stringify(response),
            });

            const result = await verifyRes.json();
            if (result.success) {
              clearCart();
              toast.success('Payment Successful');
              navigate('/track/' + result.orderId);
            } else {
              toast.error(result.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error(error);
            toast.error('Payment Save Failed');
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
          order_id: order._id,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Razorpay Init Error:', error);
      toast.error('Error initializing Razorpay');
      hideLoading();
    }
  };

  return (
    <div className="razorpay-container">
      <button
        onClick={displayRazorpay}
        className="razorpay-button"
      >
        Pay with Razorpay
      </button>
      <p className="razorpay-note">
        You will be redirected to Razorpay's secure payment page
      </p>
    </div>
  );
}
