import React from 'react';
import { Link } from 'react-router-dom';
import Price from '../Price/Price';
import classes from './orderItemsList.module.css';

export default function OrderItemsList({ order }) {
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
          {order.items.map(item => (
            <tr key={`${item.product?._id || item.product}-${item.size}`} className={classes.itemRow}>
              <td className={classes.productCell}>
                {typeof item.product === 'object' && item.product !== null ? (
                  <Link to={`/food/${item.product.productId || item.product._id}`} className={classes.productLink}>
                    <img
                      src={item.product.images?.[0] || '/placeholder.png'}
                      alt={item.product.name || 'Product'}
                      className={classes.productImage}
                    />
                    <span className={classes.productName}>{item.product.name || 'Product'}</span>
                    <span className={classes.productSize}>({item.size})</span>
                  </Link>
                ) : (
                  <span>
                    <Link to={`/food/${item.product}`}>View Product</Link>
                    <span className={classes.productSize}>({item.size})</span>
                  </span>
                )}
              </td>
              <td className={classes.priceCell}>
                <Price price={item.price} />
              </td>
              <td className={classes.quantityCell}>
                {item.quantity}
              </td>
              <td className={classes.totalCell}>
                <Price price={item.price * item.quantity} className={classes.itemTotalPrice} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={classes.summaryRow}>
            <td colSpan="2" className={classes.summaryLabel}></td>
            <td className={classes.summaryLabel}>
              <strong>Order Total:</strong>
            </td>
            <td className={classes.summaryValue}>
              <Price price={order.totalPrice} className={classes.totalPrice} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}