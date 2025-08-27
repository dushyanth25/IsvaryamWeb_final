import React from 'react';
import { Link } from 'react-router-dom';
import Price from '../Price/Price';
import classes from './orderItemsList.module.css';

export default function OrderItemsList({ order, compact = false }) {
  // Handle empty orders
  if (!order || !order.items || order.items.length === 0) {
    return (
      <div className={classes.container}>
        <p className={classes.emptyMessage}>No items found in this order.</p>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.productHeader}>Product</th>
            <th className={classes.priceHeader}>Price</th>
            <th className={classes.quantityHeader}>Quantity</th>
            <th className={classes.totalHeader}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => {
            // Safely handle product object
            const product = item.product && typeof item.product === 'object'
              ? item.product
              : { _id: item.product, name: 'Product', images: [] };

            const productId = product._id || `unknown-${index}`;
            const productName = product.name || 'Unnamed Product';
            const productImage = product.images?.[0] || '/placeholder.png';

            return (
              <tr key={`${productId}-${item.size}-${index}`} className={classes.itemRow}>
                <td className={classes.productCell}>
                  <Link to={`/food/${productId}`} className={classes.productLink}>
                    <img
                      src={productImage}
                      alt={productName}
                      className={classes.productImage}
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                    <div>
                      <span className={classes.productName}>{productName}</span>
                      {item.size && <span className={classes.productSize}> ({item.size})</span>}
                    </div>
                  </Link>
                </td>
                <td className={classes.priceCell}>
                  <Price price={item.price} />
                </td>
                <td className={classes.quantityCell}>{item.quantity}</td>
                <td className={classes.totalCell}>
                  <Price price={item.price * item.quantity} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className={classes.summaryRow}>
            <td colSpan="2"></td>
            <td className={classes.summaryLabel}><strong>Order Total:</strong></td>
            <td className={classes.summaryValue}>
              <Price price={order.totalPrice} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
