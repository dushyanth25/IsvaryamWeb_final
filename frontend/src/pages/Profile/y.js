import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import classes from './profilePage.module.css';
import { useWishlist } from '../../hooks/usewishlist';
import axios from 'axios';
import {
  FaUser,
  FaMapMarkerAlt,
  FaUserEdit,
  FaHeart,
  FaSignOutAlt,
} from 'react-icons/fa';
import ChangePassword from '../../components/ChangePassword/ChangePassword'; // Add this import

export default function ProfilePage() {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false); // Add this state
  const { wishlist, toggleWishlist } = useWishlist();
  const [bgColor, setBgColor] = useState('#ffffff'); // default

  useEffect(() => {
    axios.get('https://admin-isvaryam.onrender.com/colorprofile')
      .then((res) => setBgColor(res.data.color))
      .catch((err) => console.error('Error fetching background color:', err));
  }, []);

  useEffect(() => {
    if (showEditDialog) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
      });
    }
  }, [showEditDialog, reset, user]);

  const submit = (data) => {
    updateProfile(data);
    setShowEditDialog(false);
  };

  const handleCancel = () => {
    setShowEditDialog(false);
    reset({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      password: '',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div  className={classes.container}
  style={{
    '--bg-start': bgColor,
  }}>
      <div className={classes.contentWrapper}>
        <aside className={classes.sidebar}>
          <div className={classes.profileCard}>
            <div className={classes.avatarContainer}>
              <div className={classes.avatarBackground}>
                <FaUser size={36} className={classes.avatar} />
              </div>
              <div className={classes.profileInfo}>
                <h3>{user.name}</h3>
                <p>
                  <FaMapMarkerAlt size={12} /> {user.address || 'No address provided'}
                </p>
              </div>
            </div>

            <button
              className={classes.logoutButton}
              onClick={handleLogout}
            >
              <FaSignOutAlt className={classes.logoutIcon} />
              <span>Log Out</span>
            </button>
            {/* Add a button to show change password */}
            {user && !user.googleSignup && (
              <button
                className={classes.changePasswordButton}
                onClick={() => setShowChangePassword(true)}
                style={{ marginTop: 10 }}
              >
                Change Password
              </button>
            )}
          </div>
        </aside>

        <main className={classes.mainContent}>
          <div className={classes.contentHeader}>
            {activeTab === 'profile' && (
              <button className={classes.editProfileBtn} onClick={() => setShowEditDialog(true)}>
                <FaUserEdit /> Edit Profile
              </button>
            )}
          </div>

          <div className={classes.contentSection}>
            {activeTab === 'profile' && (
              <div className={classes.profileDetails}>
                <div className={classes.infoCard}>
                  <h4 className={classes.infoTitle}>Personal Information</h4>
                  <div className={classes.infoGrid}>
                    <div className={classes.infoGroup}>
                      <label>Full Name</label>
                      <div className={classes.infoValue}>{user.name}</div>
                    </div>
                    <div className={classes.infoGroup}>
                      <label>Email Address</label>
                      <div className={classes.infoValue}>{user.email}</div>
                    </div>
                    <div className={classes.infoGroup}>
                      <label>Phone Number</label>
                      <div className={classes.infoValue}>{user.phone || 'Not provided'}</div>
                    </div>
                    <div className={classes.infoGroup}>
                      <label>Shipping Address</label>
                      <div className={classes.infoValue}>{user.address || 'No address provided'}</div>
                    </div>
                  </div>
                </div>

                <div className={classes.statsContainer}>
                  <div className={classes.statCard}>
                    <div className={classes.statIcon} style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                      <FaHeart color="#ff9800" />
                    </div>
                    <div className={classes.statInfo}>
                      <div className={classes.statNumber}>{wishlist.length}</div>
                      <div className={classes.statLabel}>Wishlist Items</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {wishlist.map((item) => (
              <div key={item._id} className={classes.wishlistItem}>
                <div className={classes.itemImageContainer}>
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className={classes.itemImage}
                  />
                </div>
                <div className={classes.itemInfo}>
                  <div className={classes.itemName}>{item.name}</div>
                  <div className={classes.itemPrice}>
                    {item.quantities && item.quantities.length > 0
                      ? `₹${item.quantities[0].price}`
                      : ''}
                  </div>
                </div>
                <button
                  className={classes.removeButton}
                  onClick={() => toggleWishlist(item)}
                >
                  Remove
                </button>
              </div>
            ))}

            {activeTab === 'orders' && (
              <div className={classes.ordersSection}>
                <h4 className={classes.sectionTitle}>Recent Orders</h4>
                <p>No orders yet.</p>
              </div>
            )}
          </div>

          {/* Render ChangePassword dialog/modal */}
          {showChangePassword && (
            <div className={classes.dialogOverlay}>
              <div className={classes.dialogBox}>
                <div className={classes.dialogHeader}>
                  <h3 className={classes.dialogTitle}>Change Password</h3>
                  <button onClick={() => setShowChangePassword(false)}>&times;</button>
                </div>
                <ChangePassword />
              </div>
            </div>
          )}

          {showEditDialog && (
            <div className={classes.dialogOverlay}>
              <div className={classes.dialogBox}>
                <div className={classes.dialogHeader}>
                  <h3 className={classes.dialogTitle}>Edit Profile</h3>
                  <button onClick={handleCancel}>&times;</button>
                </div>
                <form onSubmit={handleSubmit(submit)}>
                  <div className={classes.inputGroup}>
                    <label>Full Name</label>
                    <input
                      className={classes.dialogInput}
                      type="text"
                      placeholder="Name"
                      {...register('name', { required: true, minLength: 5 })}
                    />
                    {errors.name && <p className={classes.error}>Name must be at least 5 characters</p>}
                  </div>

                  <div className={classes.inputGroup}>
                    <label>Email Address</label>
                    <input className={classes.dialogInput} type="email" value={user.email} disabled />
                  </div>

                  <div className={classes.inputGroup}>
                    <label>Phone Number</label>
                    <input
                      className={classes.dialogInput}
                      type="tel"
                      placeholder="Phone number"
                      {...register('phone')}
                    />
                  </div>

                  <div className={classes.inputGroup}>
                    <label>Shipping Address</label>
                    <textarea
                      className={classes.dialogInput}
                      rows="3"
                      placeholder="Full address"
                      {...register('address', { required: true, minLength: 10 })}
                    ></textarea>
                    {errors.address && <p className={classes.error}>Address must be at least 10 characters</p>}
                  </div>

                  <div className={classes.inputGroup}>
                    <label>New Password (optional)</label>
                    <input
                      className={classes.dialogInput}
                      type="password"
                      placeholder="Enter new password"
                      {...register('password')}
                    />
                  </div>

                  <div className={classes.dialogActions}>
                    <button
                      type="button"
                      className={`${classes.dialogButton} ${classes.cancelBtn}`}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={`${classes.dialogButton} ${classes.saveBtn}`}>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}