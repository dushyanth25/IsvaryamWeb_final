import React, { useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createOrder } from '../../services/orderService';
import { getCouponByCode, getAllCoupons } from '../../services/couponService';
import { getUserPurchaseCount } from '../../services/orderService';
import classes from './checkoutPage.module.css';
import { FaLock, FaArrowRight } from 'react-icons/fa';
import Map from '../../components/Map/Map';

export default function CheckoutPage() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const { cart } = useCart();
  const { user } = useAuth();
  // Eventually:

  const navigate = useNavigate();
  const [order, setOrder] = useState({ ...cart });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [userPurchaseCount, setUserPurchaseCount] = useState(0);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    async function fetchData() {
      try {
        const [coupons, count] = await Promise.all([
          getAllCoupons(),
          getUserPurchaseCount()
        ]);
        setUserPurchaseCount(count);
        // Filter coupons based on user purchase count
        const filtered = coupons.filter(c =>
          (!c.minPurchaseCount || count >= c.minPurchaseCount)
        );
        setAvailableCoupons(filtered);
      } catch (err) {
        setAvailableCoupons([]);
      }
    }
    fetchData();
  }, []);

  const submit = async data => {
    if (!order.addressLatLng) {
      toast.warning('Please select your location on the map');
      return;
    }

    const addressObj = {
      doorNumber: data.doorNumber,
      street: data.street,
      area: data.area,
      district: data.district,
      state: data.state,
      pincode: data.pincode
    };

    const orderToSend = {
      name: data.name,
      address: addressObj,
      state: data.state,
      pincode: data.pincode,
      addressLatLng: {
        lat: String(order.addressLatLng.lat),
        lng: String(order.addressLatLng.lng)
      },
      couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
      discount: Number(discount) || 0,
      totalPrice: Number(finalTotal) || 0,
      items: cart.items.map(item => ({
        product: item.food._id,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      }))
    };

    console.log("Order payload:", orderToSend);

    try {
      const createdOrder = await createOrder(orderToSend);
      if (!createdOrder || !createdOrder._id) {
        toast.error("Failed to retrieve order ID from response.");
        return;
      }
      navigate(`/payment/${createdOrder._id}`);
    } catch (err) {
      console.error('Order creation failed', err);
      toast.error('Failed to place order. Please try again.');
    }
  };


  const handleApplyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const coupon = await getCouponByCode(couponCode.trim());
      // Check expiry
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        setCouponError('Coupon expired');
        return;
      }
      // Check min purchase amount
      if (coupon.minPurchaseAmount && cart.totalPrice < coupon.minPurchaseAmount) {
        setCouponError(`Minimum purchase ₹${coupon.minPurchaseAmount} required`);
        return;
      }
      // Check min purchase count
      if (coupon.minPurchaseCount && userPurchaseCount < coupon.minPurchaseCount) {
        setCouponError(`You need at least ${coupon.minPurchaseCount} purchases`);
        return;
      }
      setAppliedCoupon(coupon);
    } catch (err) {
      setCouponError('Invalid coupon code');
    }
  };

  const discount = appliedCoupon ? (cart.totalPrice * appliedCoupon.offerPercentage) / 100 : 0;
  const finalTotal = cart.totalPrice - discount;

  const invalidItem = cart.items.find(item => !item.food || !item.food._id);
  if (invalidItem) {
    toast.error('Cart contains an invalid product. Please remove it and try again.');
    return;
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>Complete Your Order</h1>
        <p>Please review your items and provide your delivery details to proceed with your purchase</p>
      </div>
      
      <div className={classes.form_container}>
        <div className={classes.form_section}>
          <h2 className={classes.section_title}>Delivery Information</h2>
          <form onSubmit={handleSubmit(submit)}>
            <div className={classes.inputs}>
              <div className={classes.input_group}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  className={classes.input_field}
                  defaultValue={user.name}
                  placeholder="Enter your full name"
                  {...register('name', { required: true })}
                />
                {errors.name && <span className={classes.error}>Name is required</span>}
              </div>
              
              <div className={classes.input_group}>
                <label htmlFor="doorNumber">Door Number</label>
                <input
                  id="doorNumber"
                  className={classes.input_field}
                  defaultValue={user.address?.doorNumber}
                  {...register('doorNumber', { required: true })}
                />
                {errors.doorNumber && <span className={classes.error}>Door Number is required</span>}
              </div>
              <div className={classes.input_group}>
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  className={classes.input_field}
                  defaultValue={user.address?.street}
                  {...register('street', { required: true })}
                />
                {errors.street && <span className={classes.error}>Street is required</span>}
              </div>
              <div className={classes.input_group}>
                <label htmlFor="area">Area</label>
                <input
                  id="area"
                  className={classes.input_field}
                  defaultValue={user.address?.area}
                  {...register('area', { required: true })}
                />
                {errors.area && <span className={classes.error}>Area is required</span>}
              </div>
              <div className={classes.input_group}>
                <label htmlFor="district">District</label>
                <input
                  id="district"
                  className={classes.input_field}
                  defaultValue={user.address?.district}
                  {...register('district', { required: true })}
                />
                {errors.district && <span className={classes.error}>District is required</span>}
              </div>
              <div className={classes.input_group}>
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  className={classes.input_field}
                  defaultValue={user.address?.state}
                  {...register('state', { required: true })}
                />
                {errors.state && <span className={classes.error}>State is required</span>}
              </div>
              <div className={classes.input_group}>
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  className={classes.input_field}
                  defaultValue={user.address?.pincode}
                  {...register('pincode', { required: true })}
                />
                {errors.pincode && <span className={classes.error}>Pincode is required</span>}
              </div>
            </div>
            
            <h2 className={classes.section_title} style={{ marginTop: '2rem' }}>Select Delivery Location</h2>
            <div className={classes.map_container}>
              <Map
                location={order.addressLatLng}
                onChange={latlng => {
                  setOrder({ ...order, addressLatLng: latlng });
                }}
              />
            </div>
            
            <div className={classes.buttons_container}>
              <div className={classes.buttons}>
                <button type="submit" className={classes.payment_button}>
                  Proceed to Payment <FaArrowRight />
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div className={classes.form_section}>
          <div className={classes.summary_header}>
            <h2 className={classes.summary_title}>Order Summary</h2>
            <span>{cart.totalCount} items</span>
          </div>
          
          <div className={classes.order_summary}>
            <div className={classes.item_list}>
              {cart.items.map(item => (
                <div key={`${item.food._id}-${item.size}`} className={classes.item}>
                  <div className={classes.item_image}>
                    <img src={item.food.images?.[0]} alt={item.food.name} />
                  </div>
                  <div className={classes.item_info}>
                    <div className={classes.item_name}>{item.food.name} <span className={classes.size}>({item.size})</span></div>
                    <div className={classes.item_details}>
                      <span>Qty: {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={classes.total_summary}>
              <div className={classes.total_row}>
                <span>Subtotal:</span>
                <span>₹{cart.totalPrice.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className={classes.total_row}>
                  <span>Coupon Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className={classes.total_row}>
                <span>Total:</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className={classes.secure_checkout}>
            <FaLock className={classes.lock_icon} />
            <span>Secure SSL Encryption</span>
          </div>
        </div>
      </div>

      {availableCoupons.length > 0 && (
        <div className={classes.coupon_list}>
          <h3>Available Coupons</h3>
          <ul>
            {availableCoupons.map(c => (
              <li key={c._id}>
                <strong>{c.couponCode}</strong>: {c.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={classes.coupon_apply}>
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button type="button" onClick={handleApplyCoupon}>Apply</button>
        {couponError && <div className={classes.error}>{couponError}</div>}
        {appliedCoupon && (
          <div className={classes.success}>
            Coupon <strong>{appliedCoupon.couponCode}</strong> applied! {appliedCoupon.offerPercentage}% off.
          </div>
        )}
      </div>
    </div>
  );
}