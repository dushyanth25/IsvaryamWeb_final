import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import * as cartService from '../services/cartService';

const CartContext = createContext(null);

function mapCartItems(items) {
  return (items || []).map(item => ({
    food: item.productId, // productId is populated product object
    size: item.size,
    price: item.price,
    quantity: item.quantity,
  }));
}

export default function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartReady, setCartReady] = useState(false);

  // Fetch cart from backend on mount or user change
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setCartReady(true);
      return;
    }
    setCartReady(false);
    cartService.getCart().then(cart => {
      setCartItems(mapCartItems(cart.items));
      setCartReady(true);
    });
  }, [user]);

  // Cart actions
  async function addToCart(food, size) {
    const price = food.quantities
      ? food.quantities.find(q => q.size === size)?.price || 0
      : food.price || 0;
    const productId = food._id;
    const updatedCart = await cartService.addToCart(productId, size, price, 1);
    setCartItems(mapCartItems(updatedCart.items));
  }

  async function removeFromCart(productId, size) {
    if (!productId || !size) return;
    const updatedCart = await cartService.removeFromCart(productId, size);
    setCartItems(mapCartItems(updatedCart.items));
  }

  async function changeQuantity(cartItem, newQuantity) {
    const { food, size } = cartItem;
    const price = food.quantities
      ? food.quantities.find(q => q.size === size)?.price || 0
      : food.price || 0;
    const productId = food._id;
    const updatedCart = await cartService.updateCartItem(productId, size, price, newQuantity);
    setCartItems(mapCartItems(updatedCart.items));
  }

  async function clearCart() {
    await cartService.clearCart();
    setCartItems([]);
  }

  // Calculate totals
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!cartReady) return null;

  return (
    <CartContext.Provider
      value={{
        cart: { items: cartItems, totalPrice, totalCount },
        removeFromCart,
        changeQuantity,
        addToCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
