import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import classes from './profilePage.module.css';
import { useWishlist } from '../../hooks/usewishlist';
import axios from 'axios';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';

import {
  FaUser,
  FaMapMarkerAlt,
  FaUserEdit,
  FaHeart,
  FaSignOutAlt,
} from 'react-icons/fa';

export default function ProfilePage() {
  useEffect(() => {
    const scrollToTop = () => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    const timeout = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timeout);
  }, []);

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
  const { wishlist, toggleWishlist } = useWishlist();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [bgColor, setBgColor] = useState('#ffffff'); // default

  useEffect(() => {
    axios.get('https://isvaryamweb-final.onrender.com/api/colors/colorprofile')
      .then((res) => setBgColor(res.data.color))
      .catch((err) => console.error('Error fetching background color:', err));
  }, []);

  useEffect(() => {
    if (showEditDialog) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        doorNumber: user.address?.doorNumber || '',
        street: user.address?.street || '',
        area: user.address?.area || '',
        district: user.address?.district || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        password: '',
      });
    }
  }, [showEditDialog, reset, user]);

  const submit = (data) => {
    updateProfile({
      ...data,
      address: {
        doorNumber: data.doorNumber,
        street: data.street,
        area: data.area,
        district: data.district,
        state: data.state,
        pincode: data.pincode
      }
    });
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

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    // If address is an object, join the fields
    return [
      address.doorNumber,
      address.street,
      address.area,
      address.district,
      address.state,
      address.pincode
    ].filter(Boolean).join(', ');
  };

  return (
    <>
      <ScrollToTop />
      <div
        className={classes.container}
        style={{
          '--bg-start': bgColor,
        }}
      >
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
                    <FaMapMarkerAlt size={12} /> {formatAddress(user.address)}
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
                        <div className={classes.infoValue}>{formatAddress(user.address)}</div>
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
                      <label>Door Number</label>
                      <input
                        className={classes.dialogInput}
                        type="text"
                        placeholder="Door Number"
                        defaultValue={user.address?.doorNumber}
                        {...register('doorNumber')}
                      />
                    </div>
                    <div className={classes.inputGroup}>
                      <label>Street</label>
                      <input
                        className={classes.dialogInput}
                        type="text"
                        placeholder="Street"
                        defaultValue={user.address?.street}
                        {...register('street')}
                      />
                    </div>
                    <div className={classes.inputGroup}>
                      <label>Area</label>
                      <input
                        className={classes.dialogInput}
                        type="text"
                        placeholder="Area"
                        defaultValue={user.address?.area}
                        {...register('area')}
                      />
                    </div>
                    <div className={classes.inputGroup}>
                      <label>District</label>
                      <input
                        className={classes.dialogInput}
                        type="text"
                        placeholder="District"
                        defaultValue={user.address?.district}
                        {...register('district')}
                      />
                    </div>
                    <div className={classes.inputGroup}>
                      <label>State</label>
                      <input
                        className={classes.dialogInput}
                        type="text"
                        placeholder="State"
                        defaultValue={user.address?.state}
                        {...register('state')}
                      />
                    </div>
                    <div className={classes.inputGroup}>
                      <label>Pincode</label>
                      <input
                        className={classes.dialogInput}
                        type="text"
                        placeholder="Pincode"
                        defaultValue={user.address?.pincode}
                        {...register('pincode')}
                      />
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

            {/* Change Password Dialog */}
            {showChangePassword && (
              <div className={classes.dialogOverlay}>
                <div className={classes.dialogBox}>
                  <div className={classes.dialogHeader}>
                    <h3 className={classes.dialogTitle}>Change Password</h3>
                    <button onClick={() => {
                      setShowChangePassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}>&times;</button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (newPassword.length < 6) {
                      setPasswordError('Password must be at least 6 characters');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setPasswordError('Passwords do not match');
                      return;
                    }

                    try {
                      await updateProfile({ password: newPassword });
                      setShowChangePassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      alert('Password updated successfully');
                    } catch (err) {
                      console.error(err);
                      setPasswordError('Failed to update password');
                    }
                  }}>
                    <div className={classes.inputGroup}>
                      <label>New Password</label>
                      <input
                        type="password"
                        className={classes.dialogInput}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className={classes.inputGroup}>
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className={classes.dialogInput}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                    </div>
                    {passwordError && <p className={classes.error}>{passwordError}</p>}
                    <div className={classes.dialogActions}>
                      <button
                        type="button"
                        className={`${classes.dialogButton} ${classes.cancelBtn}`}
                        onClick={() => setShowChangePassword(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`${classes.dialogButton} ${classes.saveBtn}`}
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
