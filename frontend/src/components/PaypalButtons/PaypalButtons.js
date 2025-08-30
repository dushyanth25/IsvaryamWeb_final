// PaypalButtons.js → Razorpay integration with token auth + better debug
import React, { useEffect } from "react";
import { useLoading } from "../../hooks/useLoading";
import { pay } from "../../services/orderService";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PaypalButtons({ order }) {
  return <Buttons order={order} />;
}

function Buttons({ order }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("✅ Razorpay SDK loaded");
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    try {

      const user = JSON.parse(localStorage.getItem("user"));
      console.log("🔍 User object from localStorage:", user);

      if (!user?.token) {
        toast.error("Please log in to complete your payment");
        navigate("/login");
        return;
      }

      const token = user.token.trim();
      console.log("🔑 Using token:", token);

      showLoading();

      const res = await fetch("https://final-isvaryam-backend-with-razorpay.onrender.com/api/orders/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order?._id || null }),
      });

      if (res.status === 401) {
        hideLoading();
        console.error("❌ Unauthorized: Token invalid or expired");
        toast.error("Unauthorized: Please log in again");
        return;
      }

      if (!res.ok) {
        hideLoading();
        const errorText = await res.text();
        console.error("❌ Backend error:", errorText);
        toast.error("Payment request failed: " + errorText);
        return;
      }

      const data = await res.json();
      hideLoading();
      console.log("📦 Razorpay order created:", data);

      if (!data.orderId) {
        toast.error("Could not create Razorpay order");
        return;
      }

      const options = {
        key:'rzp_live_nOE6tIqppebXYT',
        amount: data.amount,
        currency: data.currency,
        name: "Your Store Name",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          console.log("📥 Razorpay Payment Response:", response);

          const verifyRes = await fetch("https://final-isvaryam-backend-with-razorpay.onrender.com/api/orders/razorpay/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            console.log("✅ Payment verified:", verifyData);

            await pay(verifyData.paymentId);
            clearCart();
            toast.success("Payment Successful", { autoClose: 3000 });
            navigate("/track/" + verifyData.orderId);
          } else {
            const errText = await verifyRes.text();
            console.error("❌ Payment verification failed:", errText);
            toast.error("Payment verification failed: " + errText);
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      hideLoading();
      console.error("❌ Razorpay Payment Error:", error);
      toast.error("Razorpay Payment Failed");
    }
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        background: "#4CAF50",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
      }}
    >
      Pay with Razorpay
    </button>
  );
}
