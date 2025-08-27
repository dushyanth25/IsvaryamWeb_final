  import React, { useEffect, useState, useCallback } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  import axios from 'axios';
  import { format } from 'date-fns';
  import StarRating from '../../components/StarRating/StarRating';
  import { useCart } from '../../hooks/useCart';
  import { useWishlist } from '../../hooks/usewishlist';
  import { getById } from '../../services/foodService';
  import NotFound from '../../components/NotFound/NotFound';
  import classes from './foodPage.module.css';
  import { useMemo } from 'react';

  export default function FoodPage() {
    useEffect(() => {
      const scrollToTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };

      const timeout = setTimeout(scrollToTop, 100);
      return () => clearTimeout(timeout);
    }, []);

    const [food, setFood] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [reviewImage, setReviewImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [avgRating, setAvgRating] = useState(0);
    const [ratingStats, setRatingStats] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [allFoods, setAllFoods] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [showZoomModal, setShowZoomModal] = useState(false);

    const { id } = useParams();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId") || "mockCustomerId";

    const relatedFoods = useMemo(() => {
      if (!food || allFoods.length === 0) return [];
      return allFoods.filter(f => f._id !== food._id);
    }, [food, allFoods]);

    useEffect(() => {
      getById(id).then(data => {
        if (data) {
          setFood(data);
          setSelectedImage(0);
          setSelectedSize(data.quantities?.[0]?.size || '');
        } else {
          setFood(null);
        }
      });
    }, [id]);

    useEffect(() => {
      if (food?.quantities?.length > 0) {
        setSelectedSize(food.quantities[0].size);
      }
    }, [food]);

    useEffect(() => {
      axios.get('/api/foods')
        .then(res => setAllFoods(res.data || []))
        .catch(err => console.error('Error fetching foods:', err));
    }, []);

    const fetchReviews = useCallback(async () => {
      try {
        const res = await axios.get(`/api/reviews/product/${id}`);
        const fetchedReviews = res.data;
        setReviews(fetchedReviews);

        const total = fetchedReviews.reduce((sum, r) => sum + r.rating, 0);
        const average = fetchedReviews.length ? total / fetchedReviews.length : 0;
        setAvgRating(average);

        const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        fetchedReviews.forEach(r => {
          const star = Math.floor(r.rating);
          stats[star] = (stats[star] || 0) + 1;
        });
        setRatingStats(stats);
      } catch {
        setReviews([]);
        setAvgRating(0);
        setRatingStats({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
    }, [id]);

    useEffect(() => {
      fetchReviews();
    }, [id, fetchReviews]);

    const handleAddToCart = () => {
      if (food && selectedSize) {
        addToCart(food, selectedSize);
        navigate('/cart');
      }
    };

    const getDiscountedPrice = (price, discount) =>
      discount ? price - (price * discount) / 100 : price;

    const isFavorite = isInWishlist(food?._id);

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    };

    const handleSubmitReview = async () => {
      if (!rating || !reviewText || !reviewImage) {
        alert('All fields are required: rating, review text, and image.');
        return;
      }

      const userReviewCount = reviews.filter(r => r.CustomerId === userId).length;
      if (userReviewCount >= 2) {
        alert("You have already submitted 2 reviews for this product.");
        return;
      }

      try {
        setSubmitting(true);
        const base64Image = await convertToBase64(reviewImage);

        const reviewData = {
          productId: id,
          rating,
          review: reviewText,
          image: base64Image,
          CustomerId: userId
        };

        await axios.post('/api/reviews', reviewData);
        alert('Review submitted!');
        setShowDialog(false);
        setReviewText('');
        setRating(0);
        setReviewImage(null);
        await fetchReviews();
      } catch (err) {
        console.error(err);
        alert('Error submitting review');
      } finally {
        setSubmitting(false);
      }
    };

    if (!food) return <NotFound message="" linkText="Back To Homepage" />;

    const selectedQuantity = food.quantities.find(q => q.size === selectedSize);
    const originalPrice = selectedQuantity?.price || 0;
    const discountedPrice = getDiscountedPrice(originalPrice, food.discount);
    const totalReviews = reviews.length;
    const userImages = reviews.filter(rev => rev.image).slice(0, 4);
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
      <div className={classes.container}>
        <div className={classes.mobileWrapper}>
          {/* Image Gallery Section */}
          <div className={classes.imageGallerySection}>
            <div className={classes.imageWrapper}>
              <img
                className={classes.image}
                src={food.images?.[hoveredImageIndex ?? selectedImage] || food.imageUrl}
                alt={food.name}
                onClick={() => {
                  setZoomedImage(food.images?.[hoveredImageIndex ?? selectedImage] || food.imageUrl);
                  setShowZoomModal(true);
                }}
                style={{ cursor: 'zoom-in' }}
              />

              <button
                className={`${classes.favoriteButton} ${isFavorite ? classes.active : ''}`}
                onClick={() => toggleWishlist(food)}
                title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <span className={classes.heartIcon}>{isFavorite ? '❤' : '♡'}</span>
              </button>
            </div>

            {food.images?.length > 1 && (
              <div className={classes.thumbnailContainer}>
                {food.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${classes.thumbnail} ${idx === selectedImage ? classes.active : ''}`}
                    onClick={() => setSelectedImage(idx)}
                    onMouseEnter={() => setHoveredImageIndex(idx)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className={classes.thumbImg} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className={classes.detailsSection}>
            <div className={classes.headerSection}>
              <h1 className={classes.foodTitle}>{food.name}</h1>
              
              <div className={classes.ratingSummary}>
                <span className={classes.ratingValueLarge}>{avgRating.toFixed(1)}</span>
                <div>
                  <div className={classes.ratingStarsLarge}>
                    <StarRating stars={avgRating} size={24} />
                  </div>
                  <div className={classes.ratingCount}>{totalReviews} Ratings & {reviews.length} Reviews</div>
                </div>
              </div>
              
              <div className={classes.priceContainer}>
                {food.discount ? (
                  <>
                    <span className={classes.originalPrice}>₹{originalPrice}</span>
                    <span className={classes.discountedPrice}>
                      ₹{discountedPrice.toFixed(2)} 
                      <span className={classes.discountTag}>({food.discount}% OFF)</span>
                    </span>
                  </>
                ) : (
                  <span className={classes.regularPrice}>₹{originalPrice}</span>
                )}
              </div>
            </div>

            <p className={classes.description}>{food.description}</p>

            <div className={classes.sizeSelectorContainer}>
              <select 
                value={selectedSize} 
                onChange={e => setSelectedSize(e.target.value)}
                className={classes.sizeSelector}
              >
                {food.quantities.map(q => (
                  <option key={q.size} value={q.size}>{q.size} - ₹{q.price}</option>
                ))}
              </select>
            </div>

            <div className={classes.actionButtons}>
              <button onClick={handleAddToCart} className={classes.addToCartBtn}>
                <span className={classes.cartIcon}>🛒</span> Add to Cart
              </button>
              <button onClick={() => setShowDialog(true)} className={classes.reviewBtn}>
                <span className={classes.reviewIcon}>✍️</span> Write a Review
              </button>
            </div>

            {Array.isArray(food.specifications) && (
              <div className={classes.specsSection}>
                <h3 className={classes.sectionTitle}>Specifications</h3>
                <table className={classes.specTable}>
                  <thead>
                    <tr>
                      <th className={classes.tableHeader}>Parameter</th>
                      <th className={classes.tableHeader}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {food.specifications.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? classes.evenRow : classes.oddRow}>
                        <td className={classes.tableCell} data-label="Parameter">{spec.name}</td>
                        <td className={classes.tableCell} data-label="Value">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className={classes.ingredientsSection}>
              <h2 className={classes.sectionTitle}>Ingredients</h2>
              <ul className={classes.ingredientList}>
                {food.ingredients.map((ing, idx) => (
                  <li key={ing._id} className={classes.ingredientItem}>
                    {ing.name} - {ing.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rating Section */}
          <div className={classes.ratingSection}>
            <h2>Reviews</h2>
            <div className={classes.ratingBars}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingStats[star];
                const percent = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={star} className={classes.ratingBarContainer}>
                    <span className={classes.starLabel}>{star} star</span>
                    <div className={classes.ratingBarBackground}>
                      <div 
                        className={classes.ratingBarFill} 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={classes.ratingPercent}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Photos Section */}
          {userImages.length > 0 && (
            <div className={classes.reviewImagesContainer}>
              <h4 className={classes.reviewImagesTitle}>Review Photos</h4>
              <div className={classes.reviewImagesGrid}>
                {userImages.map((rev, idx) => (
                  <div key={idx} className={classes.reviewImageItem}>
                    <img src={rev.image} alt={`Review ${idx}`} />
                  </div>
                ))}
                {reviews.length > userImages.length && (
                  <div className={`${classes.reviewImageItem} ${classes.moreImages}`}>
                    +{reviews.length - userImages.length}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Section */}
          <div className={classes.reviewSection}>
            <h2 className={classes.sectionTitle}>Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className={classes.noReviews}>No reviews yet. Be the first to review!</p>
            ) : (
              <div className={classes.reviewList}>
                {displayedReviews.map(rev => (
                  <div key={rev._id} className={classes.reviewCard}>
                    <div className={classes.reviewHeader}>
                      <div className={classes.reviewerInfo}>
                        <div className={classes.reviewerAvatar}>
                          {rev.CustomerId?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <strong className={classes.reviewerName}>
                            {rev.CustomerId?.name || 'Anonymous'}
                          </strong>
                          <div className={classes.reviewerType}>Certified Buyer</div>
                          <div className={classes.reviewMeta}>
                            <StarRating stars={rev.rating} size={18} />
                            <span className={classes.reviewDate}>
                              {format(new Date(rev.createdAt), 'dd MMM yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className={classes.reviewText}>{rev.review}</p>
                    
                    {rev.image && (
                      <div className={classes.reviewImageContainer}>
                        <img src={rev.image} alt="review" className={classes.reviewImage} />
                      </div>
                    )}
                    
                    {rev.replies?.length > 0 && (
                      <div className={classes.repliesContainer}>
                        <div className={classes.repliesTitle}>Admin Replies:</div>
                        {rev.replies.map(rep => (
                          <div key={rep._id} className={classes.replyItem}>
                            <div className={classes.replyContent}>{rep.text}</div>
                            <div className={classes.replyDate}>
                              {format(new Date(rep.createdAt), 'dd MMM yyyy')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {reviews.length > 3 && !showAllReviews && (
              <button 
                className={classes.readAllButton}
                onClick={() => setShowAllReviews(true)}
              >
                Read All Reviews
              </button>
            )}
          </div>

          {/* Related Products Section */}
          {food && allFoods.length > 0 && (
            <div className={classes.relatedSection}>
              <h2 className={classes.sectionTitle}>You Might Also Like</h2>
              <div className={classes.relatedProducts}>
                {allFoods
                  .filter(f => f._id !== food._id)
                  .slice(0, 4)
                  .map(f => {
                    const imageSrc = f.imageUrl || (f.images && f.images[0]) || '';
                    return (
                      <div
                        key={f._id}
                        className={classes.productCard}
                        onClick={() => navigate(`/food/${f._id}`)}
                      >
                        <div className={classes.productImageContainer}>
                          <img
                            src={imageSrc}
                            alt={f.name}
                            className={classes.productImage}
                          />
                          <div className={classes.productOverlay}>
                            <span className={classes.viewButton}>View Product</span>
                          </div>
                        </div>
                        <div className={classes.productInfo}>
                          <h3 className={classes.productName}>{f.name}</h3>
                          <div className={classes.productPrice}>
                            ₹{f.quantities?.[0]?.price || '0.00'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Review Dialog */}
        {showDialog && (
          <div className={classes.reviewDialogOverlay}>
            <div className={classes.reviewDialog}>
              <h3 className={classes.dialogTitle}>Write a Review</h3>
              <div className={classes.dialogClose} onClick={() => setShowDialog(false)}>×</div>
              
              <div className={classes.ratingInput}>
                <label>Rating:</label>
                <StarRating stars={rating} size={34} onRate={setRating} editable />
              </div>
              
              <div className={classes.reviewInput}>
                <label>Review:</label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Share your experience..."
                  className={classes.reviewTextarea}
                />
              </div>
              
              <div className={classes.imageUpload}>
                <label>Upload Product Photo:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setReviewImage(e.target.files[0])}
                  className={classes.fileInput}
                />
              </div>
              
              <div className={classes.dialogActions}>
                <button 
                  onClick={handleSubmitReview} 
                  disabled={submitting}
                  className={classes.submitButton}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button 
                  onClick={() => setShowDialog(false)} 
                  className={classes.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Zoom Modal */}
        {showZoomModal && (
          <div className={classes.zoomModalOverlay}>
            <div className={classes.zoomModalContent}>
              <button className={classes.closeModalFixed} onClick={() => setShowZoomModal(false)}>×</button>
              <div
                className={classes.zoomFrame}
                style={{ backgroundImage: `url(${zoomedImage})` }}
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.pageX - left) / width) * 100;
                  const y = ((e.pageY - top) / height) * 100;
                  e.currentTarget.style.backgroundPosition = `${x}% ${y}%`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = 'center';
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }