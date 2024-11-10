import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { getDatabase, ref, push, set } from 'firebase/database';
import './Register.css';  

const RegisterForm = () => {
  const { users, setUsers } = useContext(AppContext);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const database = getDatabase();

  const checkUsername = (username) => {
    return users.some(([key, user]) => user.username === username);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !surname || !username || !password) {
      setErrorMessage('All fields are required');
      return;
    }

    if (checkUsername(username)) {
      setErrorMessage('Username already taken. Please choose another.');
      return;
    }

    const newUserRef = push(ref(database, '/'));
    set(newUserRef, {
      name,
      surname,
      username,
      password,
      id: newUserRef.key,
    })
      .then(() => {
        setIsRegistered(true);
        setErrorMessage('');
        window.location = '/'
      })
      .catch((error) => {
        setErrorMessage(`Error registering user: ${error.message}`);
      });
  };

  return (
    <div className="register-form">
      {isRegistered ? (
        <h2>Registration successful! You can now log in.</h2>
      ) : (
        <>
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name</label>
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
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit">Register</button>
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterForm;
