import React from "react";
import "./shipping-policy.css";

const ShippingPolicy = () => {
  return (
    <div className="shipping-policy">
      <div className="shipping-container">
        <h1 className="shipping-title">Shipping Policy</h1>
        <p className="shipping-intro">
          At <strong>Isvaryam</strong>, we are committed to delivering your
          products in a safe and timely manner. Please read our shipping policy
          carefully to understand how we handle shipping and delivery.
        </p>

        <section className="shipping-section">
          <h2>Processing Time</h2>
          <p>
            Orders are processed within <strong>1-2 business days</strong> after
            payment confirmation. You will receive a confirmation email once
            your order has been shipped.
          </p>
        </section>

        <section className="shipping-section">
          <h2>Shipping Charges</h2>
          <p>
            Shipping charges are calculated at checkout based on your location
            and order weight. Free shipping may be available on selected orders
            or during promotional offers.
          </p>
        </section>

        <section className="shipping-section">
          <h2>Estimated Delivery Time</h2>
          <ul>
            <li>Within Tamil Nadu: <strong>2-4 business days</strong></li>
            <li>Other States in India: <strong>4-7 business days</strong></li>
            <li>Remote Areas: <strong>7-10 business days</strong></li>
          </ul>
        </section>

        <section className="shipping-section">
          <h2>Tracking Information</h2>
          <p>
            Once your order is shipped, we will provide a tracking ID via email
            or SMS. You can use this ID to track your order until it reaches you.
          </p>
        </section>

        <section className="shipping-section">
          <h2>International Shipping</h2>
          <p>
            Currently, we only ship within India. International shipping will be
            available in the near future.
          </p>
        </section>

        <section className="shipping-section">
          <h2>Delays</h2>
          <p>
            While we try our best to deliver within the promised time, delays
            may occur due to unforeseen circumstances such as natural
            calamities, strikes, or courier delays. We appreciate your
            understanding in such cases.
          </p>
        </section>

        <section className="shipping-section">
          <h2>Contact Us</h2>
          <p>
            For any questions related to shipping, please contact us at: <br />
            <strong>Email:</strong> support@isvaryam.com <br />
            <strong>Phone:</strong> +91 98765 43210
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
