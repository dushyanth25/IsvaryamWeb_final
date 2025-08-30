import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import classes from './paymentPage.module.css';
import { getOrderById } from '../../services/orderService';
import Map from '../../components/Map/Map';
import PaypalButtons from '../../components/PaypalButtons/PaypalButtons';
import { FaLock, FaMapMarkerAlt, FaUser, FaHome } from 'react-icons/fa';
import Price from '../../components/Price/Price';

// Hook to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
    console.log('getOrderById response:', response); // 👀 still useful for debugging

    // ✅ If response is an array, take the first item
    const data = Array.isArray(response) ? response[0] : response;

    if (!data || !Array.isArray(data.items)) {
      setError('Order not found or invalid order format');
      return;
    }

    setOrder(data);

    let actualTotal = 0;
    for (let item of data.items) {
      const product = item.product;
      const matched = product?.quantities?.find(q => q.size === item.size);
      const price = matched?.price || item.price;
      actualTotal += price * item.quantity;
    }

    setRealTotal(actualTotal);
    setDiscount(actualTotal - data.totalPrice);
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
              <div className={classes.info_value}>{order.address}</div>
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
          <div className={classes.paypal_container}>
            <PaypalButtons order={order} />
          </div>
        </div>
        <div className={classes.secure_payment}>
          <FaLock className={classes.lock_icon} />
          <span>Secure SSL Encryption • Your payment details are protected</span>
        </div>
      </div>
    </div>
  );
}
