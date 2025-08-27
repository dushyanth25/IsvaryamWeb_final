import React from "react";
import "./RefundPolicy.css";

const RefundPolicy = () => {
  return (
    <div className="refund-container">
      <h1>Refund, Exchange & Cancellation Policy</h1>

      <section>
        <h2>Exchange & Return Policy</h2>
        <p>
          We offer a <strong>5-day exchange/return policy</strong>, meaning you
          can request a replacement or return within 5 days of receiving your
          order.
        </p>
        <p>
          To request, contact us at{" "}
          <a href="mailto:isvaryam@hotmail.com">isvaryam@hotmail.com</a>.
        </p>
      </section>

      <section>
        <h2>Conditions</h2>
        <ul>
          <li>Item must be unused, in original condition & packaging.</li>
          <li>Invoice/bill must be provided at pickup.</li>
          <li>Used products are not eligible.</li>
        </ul>
      </section>

      <section>
        <h2>Allowed Cases</h2>
        <ul>
          <li>Damaged or wrong item received.</li>
          <li>Not sealed properly at delivery.</li>
          <li>Expired at time of delivery.</li>
        </ul>
        <p>
          If approved, items will be picked up from your delivery address.
        </p>
        <p>
          <strong>Exchanges:</strong> Delivered within 3–5 working days after
          pickup.
        </p>
        <p>
          <strong>Delivery discrepancies:</strong> Report within 48 hours of
          delivery.
        </p>
        <p>
          📞 For quality issues, contact us at{" "}
          <a href="tel:+917373611000">73736 11000</a> or{" "}
          <a href="mailto:isvaryam@hotmail.com">isvaryam@hotmail.com</a>.
        </p>
      </section>

      <section>
        <h2>Order Cancellations</h2>
        <ul>
          <li>
            Cancellations <strong>within 5 hours</strong> of placing the order →
            full refund processed automatically.
          </li>
          <li>Cancellations after shipping are not allowed.</li>
          <li>
            We may cancel orders due to:
            <ul>
              <li>Out-of-stock items</li>
              <li>Pricing/information errors</li>
              <li>Customer detail issues</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          Once your return is received & inspected, we’ll notify you of
          approval/rejection.
        </p>
        <p>
          If approved, refund will be issued to your original payment method.
        </p>
        <p>Refunds usually take 5–7 business days to reflect.</p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          📧 Email:{" "}
          <a href="mailto:isvaryam@hotmail.com">isvaryam@hotmail.com</a>
        </p>
        <p>
          📞 Phone: <a href="tel:+917373611000">73736 11000</a>
        </p>
      </section>
    </div>
  );
};

export default RefundPolicy;
