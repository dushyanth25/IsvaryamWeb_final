import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Price from '../../components/Price/Price';
import Title from '../../components/Title/Title';
import { useCart } from '../../hooks/useCart';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import classes from './cartPage.module.css';

export default function CartPage() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const { cart, removeFromCart, changeQuantity } = useCart();
  const [bgColor, setBgColor] = useState('#ffffff'); // Default white

  useEffect(() => {
    axios.get('https://admin-isvaryam.onrender.com/colorcart')
      .then((res) => setBgColor(res.data.color))
      .catch((err) => console.error('Error fetching background color:', err));
  }, []);

  // ✅ Calculate total price of all cart items
  const totalPrice = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  return (
    <div className={classes.cart_wrapper} style={{ backgroundColor: bgColor }}>
      <Title title="Your Cart" fontSize="1.5rem" />

      {cart.items.length === 0 ? (
        <div className={classes.empty_cart}>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className={classes.shop_button}>Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className={classes.cart_items}>
            {cart.items.map(item => (
              item.food && (
                <div key={item.food._id + item.size} className={classes.cart_item}>
                  <img src={item.food.images?.[0]} alt={item.food.name} className={classes.product_img} />
                  <div className={classes.cart_info}>
                    <h4>{item.food.name} <span className={classes.size}>({item.size})</span></h4>
                    <div className={classes.price_qty}>
                      <Price price={item.price} />
                      <div className={classes.qty}>
                        <button
                          onClick={() => changeQuantity(item, item.quantity - 1)}
                          disabled={item.quantity === 1}
                        >-</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item, item.quantity + 1)}
                        >+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.food._id, item.size)} className={classes.remove_btn}>
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>

          <div className={classes.checkout_footer}>
  <div className={classes.amount_to_pay}>
    <strong>To Pay:</strong> ₹{totalPrice.toLocaleString()}
  </div>

  {totalPrice >= 1000 ? (
    <Link to="/checkout" className={classes.checkout_btn}>Continue</Link>
  ) : (
    <>
      <button
        className={classes.checkout_btn}
        onClick={() => alert("Minimum order amount must be ₹1000 to proceed to checkout.")}
        style={{ opacity: 0.9, cursor: 'pointer', backgroundColor: '#ccc' }}
      >
        Continue
      </button>
    </>
  )}
</div>

        </>
      )}
    </div>
  );
}
