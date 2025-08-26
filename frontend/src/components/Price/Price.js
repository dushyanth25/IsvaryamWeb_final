import React from 'react';

export default function Price({ price, locale, currency }) {
  const formatPrice = () =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(price);

  return <span>{formatPrice()}</span>;
}

// Default props for Indian currency
Price.defaultProps = {
  locale: 'en-IN',
  currency: 'INR',
};
