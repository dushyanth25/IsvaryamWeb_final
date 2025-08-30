import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import classes from './paymentPage.module.css';
import { getOrderById } from '../../services/orderService';
import Map from '../../components/Map/Map';
import { FaLock, FaMapMarkerAlt, FaUser, FaHome } from 'react-icons/fa';
import Price from '../../components/Price/Price';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useLoading } from '../../hooks/useLoading';
import { pay } from '../../services/orderService';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Hook to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// PaymentButtons Component (Combined PayPal and Razorpay)
function PaymentButtons({ order }) {
  const [activeGateway, setActiveGateway] = useState('paypal');
  const [usdPrice, setUsdPrice] = useState(null);

  return (
    <div className={classes.paymentGatewayContainer}>
      <div className={classes.gatewaySelector}>
        <button 
          className={`${classes.gatewayTab} ${activeGateway === 'paypal' ? classes.active : ''}`}
          onClick={() => setActiveGateway('paypal')}
        >
          PayPal
        </button>
        <button 
          className={`${classes.gatewayTab} ${activeGateway === 'razorpay' ? classes.active : ''}`}
          onClick={() => setActiveGateway('razorpay')}
        >
          Razorpay
        </button>
      </div>

      <div className={classes.gatewayContent}>
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

// PayPal Gateway Component
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

// PayPal Buttons Component
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

// Razorpay Gateway Component
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

    // Load Razorpay SDK
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      hideLoading();
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // ✅ Step 1: Create Razorpay order in backend
      const user = JSON.parse(localStorage.getItem("user"));
const token = user?.token?.trim();
      const createOrderRes = await fetch('/api/orders/razorpay/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  credentials: 'include', // optional, only needed if backend uses cookies
});
      const razorpayOrder = await createOrderRes.json();
      if (!razorpayOrder?.orderId) {
        toast.error('Failed to create Razorpay order');
        hideLoading();
        return;
      }

      // ✅ Step 2: Open Razorpay Checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount, // already in paise
        currency: razorpayOrder.currency,
        name: 'Your Company Name',
        description: `Order #${order._id}`,
        order_id: razorpayOrder.orderId, // razorpay orderId from backend
        handler: async function (response) {
          try {
            // ✅ Step 3: Verify Payment with backend
            const verifyRes = await fetch('/api/orders/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
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

// Main PaymentPage Component
export default function PaymentPage() {
  useEffect(() => {
    const scrollToTop = () => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    const timeout = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timeout);
  }, []);

  const { orderId: routeOrderId } = useParams();
  const query = useQuery();
  const queryOrderId = query.get('orderId');
  const orderId = routeOrderId || queryOrderId; // ✅ Handle both /payment/:orderId and /payment?orderId=

  const [order, setOrder] = useState(null);
  const [realTotal, setRealTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setError('Invalid Order ID');
          return;
        }

        const response = await getOrderById(orderId);

        // ✅ If response is an array, take the first item
        const data = Array.isArray(response) ? response[0] : response;


        if (!data || !Array.isArray(data.items)) {
          setError('Order not found or invalid order format');
          return;
        }

        setOrder(data);

        let actualSubtotal = 0;
        for (let item of data.items) {
          const product = item.product;
          const matched = product?.quantities?.find(q => q.size === item.size);
          const price = matched?.price || item.price;
          actualSubtotal += price * item.quantity;
        }

        setRealTotal(actualSubtotal); // Subtotal (without delivery charge)
        setDiscount(data.discount || 0); // Discount from backend
      } catch (err) {
        console.error(err);
        setError('Failed to load order. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    return () => controller.abort();
  }, [orderId]);

  if (loading) return <div className={classes.loading}></div>;
  if (error) return <div className={classes.error}>{error}</div>;
  if (!order) return null;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>Complete Your Payment</h1>
        <p>Review your order details and complete the payment to finalize your purchase.</p>
      </div>

      <div className={classes.content}>
        <div className={classes.order_summary}>
          <h2 className={classes.section_title}>Order Summary</h2>

          <div className={classes.customer_info}>
            <div className={classes.info_row}>
              <div className={classes.info_label}><FaUser /> Customer Name</div>
              <div className={classes.info_value}>{order.name}</div>
            </div>
            <div className={classes.info_row}>
              <div className={classes.info_label}><FaHome /> Delivery Address</div>
              <div className={classes.info_value}>
                {order.address
                  ? `${order.address.doorNumber}, ${order.address.street}, ${order.address.area}, ${order.address.district}, ${order.address.state}, ${order.address.pincode}`
                  : order.address}
              </div>
            </div>
          </div>

          <div className={classes.price_summary}>
            <div className={classes.summary_row}>
              <span className={classes.summary_label}>Subtotal</span>
              <span className={classes.summary_value}><Price price={realTotal} /></span>
            </div>
            {discount > 0 && (
              <div className={classes.summary_row}>
                <span className={classes.summary_label}>Discount</span>
                <span className={classes.summary_value}>-<Price price={discount} /></span>
              </div>
            )}
            <div className={classes.summary_row}>
              <span className={classes.summary_label}>Delivery Charge</span>
              <span className={classes.summary_value}>
                {order.deliveryCharge && Number(order.deliveryCharge) > 0 ? (
                  <Price price={Number(order.deliveryCharge)} />
                ) : (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Free</span>
                )}
              </span>
            </div>
            <div className={`${classes.summary_row} ${classes.final_total}`}>
              <span className={classes.summary_label}>Final Total</span>
              <span className={classes.summary_value}><Price price={order.totalPrice} /></span>
            </div>
          </div>

          <h2 className={classes.section_title}>Order Items</h2>
          <div className={classes.items_list}>
            {order.items.map((item, index) => {
              const product = item.product || {};
              const imageUrl = Array.isArray(product.images) ? product.images[0] : '/fallback.jpg';
              const matched = product.quantities?.find(q => q.size === item.size);
              const unitPrice = matched?.price ?? item.price;
              const totalPrice = unitPrice * item.quantity;

              return (
                <div key={index} className={classes.item_card}>
                  <div className={classes.item_image}>
                    <img src={imageUrl} alt={product.name || 'Product'} loading="lazy" />
                  </div>
                  <div className={classes.item_details}>
                    <div className={classes.item_name}>
                      {product.name || 'Unnamed Product'} <span className={classes.item_size}>({item.size})</span>
                    </div>
                    <div className={classes.item_quantity}>Qty: {item.quantity}</div>
                    <div className={classes.item_price}><Price price={totalPrice} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={classes.map_container}>
          <div className={classes.map_header}>
            <h2 className={classes.section_title}><FaMapMarkerAlt /> Delivery Location</h2>
          </div>
          <div className={classes.map_content}>
            <Map readonly={true} location={order.addressLatLng} />
          </div>
        </div>
      </div>

      <h2 className={classes.payment_header}>Payment Method</h2>
      <div className={classes.payment_section}>
        <div className={classes.payment_methods}>
          <PaymentButtons order={order} />
        </div>
        <div className={classes.secure_payment}>
          <FaLock className={classes.lock_icon} />
          <span>Secure SSL Encryption • Your payment details are protected</span>
        </div>
      </div>
    </div>
  );
}
