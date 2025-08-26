import React, { useEffect, useReducer, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAll, getAllStatus, deleteOrder as deleteOrderApi } from '../../services/orderService';
import classes from './ordersPage.module.css';
import Title from '../../components/Title/Title';
import DateTime from '../../components/DateTime/DateTime';
import Price from '../../components/Price/Price';
import NotFound from '../../components/NotFound/NotFound';
import Loading from '../../components/Loading/Loading';
import { FaMapMarkerAlt, FaRedoAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const initialState = { allStatus: [], orders: [], loading: true };

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'ALL_STATUS_FETCHED':
      return { ...state, allStatus: payload };
    case 'ORDERS_FETCHED':
      return { ...state, orders: payload, loading: false };
    case 'FETCH_ERROR':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function OrdersPage() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const [{ allStatus, orders, loading }, dispatch] = useReducer(reducer, initialState);
  const { filter } = useParams();
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'LOADING' });
        const [status, orderData] = await Promise.all([
          getAllStatus(),
          getAll(filter)
        ]);
        dispatch({ type: 'ALL_STATUS_FETCHED', payload: status });
        dispatch({ type: 'ORDERS_FETCHED', payload: orderData });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR' });
      }
    };
    fetchData();
  }, [filter]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderApi(orderId);
        dispatch({
          type: 'ORDERS_FETCHED',
          payload: orders.filter(o => o._id !== orderId)
        });
      } catch (error) {
        const errMsg = error?.response?.data?.message || 'Failed to delete order';
        alert(errMsg);
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={classes.container}>
      <Title title="Your Orders" margin="0 0 2rem 0" fontSize="2.2rem" />

      {allStatus && (
        <div className={classes.filter_tabs}>
          <Link
            to="/orders"
            className={`${classes.tab} ${!filter ? classes.active : ''}`}
          >
            All Orders
          </Link>
          {allStatus.map(state => (
            <Link
              key={state}
              className={`${classes.tab} ${state === filter ? classes.active : ''}`}
              to={`/orders/${state}`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </Link>
          ))}
        </div>
      )}

      {orders?.length === 0 ? (
        <NotFound
          linkRoute={filter ? '/orders' : '/'}
          linkText={filter ? 'Show All Orders' : 'Back to Home'}
          message={`No ${filter ? filter : ''} orders found`}
        />
      ) : (
        <div className={classes.orders_list}>
          {orders.map(order => (
            <div
              key={order._id}
              className={`${classes.order_card} ${expandedOrder === order._id ? classes.expanded : ''}`}
            >
              <div
                className={classes.order_header}
                onClick={() => toggleOrderExpand(order._id)}
              >
                <div className={classes.order_info}>
                  <div className={classes.order_id}>
 {order.items.map((item, index) => (
  <span key={index}>
    {item?.product?.name || "N/A"}
    {index !== order.items.length - 1 && ', '}
  </span>
))}

</div>

                  <div className={classes.order_date}>
                    <DateTime date={order.createdAt} />
                  </div>
                </div>

                <div className={classes.order_status_wrapper}>
                  <div className={classes.order_status} data-status={order.status}>
                    {order.status}
                  </div>
                  <div
                    className={`${classes.payment_status} ${
                      order.paymentStatus === 'COMPLETED' ? classes.completed : classes.pending
                    }`}
                  >
                    {order.paymentStatus || 'PENDING'}
                  </div>
                </div>

                <div className={classes.order_total}>
                  <Price price={order.totalPrice} />
                </div>

                <div className={classes.expand_icon}>
                  {expandedOrder === order._id ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className={classes.order_details}>
                  <div className={classes.items_grid}>
                    {order.items.map(item => (
                      <Link
                        key={`${item.product._id}-${item.size}`}
                        to={`/food/${item.product._id}`}
                        className={classes.item_card}
                      >
                        <div className={classes.item_image}>
                          <img
                            src={item.product.images?.[0]}
                            alt={item.product.name}
                            loading="lazy"
                          />
                        </div>
                        <div className={classes.item_info}>
                          <div className={classes.item_name}>
                            {item.product.name}
                            <span className={classes.size}>({item.size})</span>
                          </div>
                          <div className={classes.item_quantity}>Quantity: {item.quantity}</div>
                          <div className={classes.item_price}>
                            <Price price={item.price} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className={classes.order_actions}>
                    <Link to={`/track/${order._id}`} className={classes.track_button}>
                      <FaMapMarkerAlt className={classes.action_icon} /> Order details
                    </Link>

                    <button className={classes.reorder_button}>
                      <FaRedoAlt className={classes.action_icon} /> Reorder
                    </button>

                    {order.status === 'NEW' && (
                      <button
                        className={classes.delete_button}
                        onClick={() => deleteOrder(order._id)}
                      >
                        Delete order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
