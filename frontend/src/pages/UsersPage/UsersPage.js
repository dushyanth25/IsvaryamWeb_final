import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAll, toggleBlock } from '../../services/userService';
import classes from './usersPage.module.css';
import Title from '../../components/Title/Title';
import Search from '../../components/Search/Search';

export default function UsersPage() {
  useEffect(() => {
  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const timeout = setTimeout(scrollToTop, 100);
  return () => clearTimeout(timeout);
}, []);

  const [users, setUsers] = useState();
  const { searchTerm } = useParams();
  const auth = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      const users = await getAll(searchTerm);
      setUsers(users);
    };
    loadUsers();
  }, [searchTerm]);

  const handleToggleBlock = async userId => {
    const isBlocked = await toggleBlock(userId);

    setUsers(oldUsers =>
      oldUsers.map(user => (user._id === userId ? { ...user, isBlocked } : user))
    );
  };

  return (
    <div className={classes.container}>
      <div className={classes.list}>
        <Title title="Manage Users" />
        <Search
          searchRoute="/admin/users/"
          defaultRoute="/admin/users"
          placeholder="Search Users"
          margin="1rem 0"
        />
        <div className={classes.list_item}>
          <h3>Name</h3>
          <h3>Email</h3>
          <h3>Address</h3>
          <h3>Admin</h3>
          <h3>Actions</h3>
        </div>
        {users &&
          users.map(user => (
            <div key={user._id} className={classes.list_item}>
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.address}</span>
              <span>{user.isAdmin ? '✅' : '❌'}</span>
              <span className={classes.actions}>
                <Link to={'/admin/editUser/' + user._id}>Edit</Link>
                {auth.user._id !== user._id && (
                  <Link onClick={() => handleToggleBlock(user._id)}>
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </Link>
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
