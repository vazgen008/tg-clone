import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import './edit.css';  

const UserProfile = () => {
  const { currentuser, users } = useContext(AppContext);

  const user = users.find(([key, value]) => value.username === currentuser);

  if (!user) {
    return <div>User not found</div>;
  }

  const [key, userData] = user;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div>
        <strong>Username:</strong> {userData.username}
      </div>
      <div>
        <strong>Name:</strong> {userData.name}
      </div>
      <div>
        <strong>Surname:</strong> {userData.surname}
      </div>
      <Link to="/edit">
        <button>Edit Profile</button>
      </Link>
    </div>
  );
};

export default UserProfile;
