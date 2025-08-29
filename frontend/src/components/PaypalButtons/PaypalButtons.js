import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import React, { useEffect, useState } from 'react';
import { useLoading } from '../../hooks/useLoading';
import { pay } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

function PaypalGateway({ order, usdPrice, setUsdPrice }) {
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

  // ✅ fetch INR → USD conversion rate dynamically
  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch(
          "https://api.exchangerate.host/convert?from=INR&to=USD"
        );
        const data = await res.json();
        const rate = data?.info?.rate || 0.012; // fallback to ~0.012
        setUsdPrice((order.totalPrice * rate).toFixed(2));
      } catch (err) {
        console.error("Currency conversion failed:", err);
        // fallback approx
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
        currency: "USD", // ✅ use USD in PayPal
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
          description: `Order Payment (₹${order.totalPrice})`, // optional
          amount: {
            currency_code: 'USD', // ✅ PayPal accepts USD
            value: usdPrice,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const payment = await actions.order.capture();
      const orderId = await pay(payment.id);
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

function RazorpayGateway({ order }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    showLoading();
    
    // Load Razorpay SDK
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!res) {
      hideLoading();
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // Create order data for Razorpay
    const options = {
      key: 'rzp_test_9SiLlGXPcCjPhi',
      amount: order.totalPrice * 100, // Razorpay expects amount in paise (so *100)
      currency: 'INR',
      name: 'Isvaryam',
      description: `Order #${order._id}`,
      image: '/logo.png', // Your company logo
      handler: async function (response) {
        // Payment successful
        try {
          const orderId = await pay(response.razorpay_payment_id, 'razorpay');
          clearCart();
          toast.success('Payment Saved Successfully');
          navigate('/track/' + orderId);
        } catch (error) {
          toast.error('Payment Save Failed');
          console.error(error);
        } finally {
          hideLoading();
        }
      },
      prefill: {
        name: order.name,
        email: order.email,
        contact: order.phone
      },
      notes: {
        address: order.address,
        order_id: order._id
      },
      theme: {
        color: '#3399cc'
      }
    };

    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Error initializing Razorpay');
      console.error(error);
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
      <p className="razorpay-note">You will be redirected to Razorpay's secure payment page</p>
    </div>
  );
}
