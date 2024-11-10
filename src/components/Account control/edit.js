import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { getDatabase, ref, update } from 'firebase/database';
import './edit.css'; 

const Edit = () => {
  const { currentuser, users, setcurrentuser } = useContext(AppContext);
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const database = getDatabase();

  useEffect(() => {
    if (currentuser) {
      const user = users.find(([key, value]) => value.username === currentuser);
      if (user) {
        setSurname(user[1].surname);
        setName(user[1].name);
      }
      setLoading(false);
    }
  }, [currentuser, users]);

  const handleSave = (e) => {
    e.preventDefault();

    const currentUserEntry = users.find(([key, value]) => value.username === currentuser);
    if (!currentUserEntry) {
      setError('User not found!');
      return;
    }

    const userKey = currentUserEntry[0];

    const updatedUserData = {
      name,
      surname,
    };

    const userRef = ref(database, `/${userKey}`);
    update(userRef, updatedUserData)
      .then(() => {
        setcurrentuser(updatedUserData.username);

        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        const updatedUserInStorage = { ...storedUser, name, surname };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserInStorage));

        alert('Profile updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating user in Firebase:', error);
        setError('Failed to update profile. Please try again later.');
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Surname</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}
        
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default Edit;
