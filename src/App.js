import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SingleChat } from './components/Chats/chats';
import User from './components/Account control/user';
import RegisterForm from './components/Register/Register';
import Edit from './components/Account control/edit';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

export const AppContext = createContext();

const firebaseConfig = {
  apiKey: "AIzaSyBMM4d8EavvvQu1JlQAHtv6Di-KdPpXURY",
  authDomain: "tg-clone-f32b5.firebaseapp.com",
  databaseURL: "https://tg-clone-f32b5-default-rtdb.firebaseio.com",
  projectId: "tg-clone-f32b5",
  storageBucket: "tg-clone-f32b5.appspot.com",
  messagingSenderId: "202514314330",
  appId: "1:202514314330:web:4b343a223e9d2204109463",
  measurementId: "G-5BQ9V2XTD7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const App = () => {
  const [currentuser, setcurrentuser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = ref(database, '/');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUsers(Object.entries(data));
          console.log(Object.entries(data))
        } else {
          console.log('No data at /');
        }
        setLoading(false);
      });
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) { 
      const { username, password,id } = storedUser;
      const matchingUser = users.find(([key, value]) => value.id === id && value.password === password);
      if (matchingUser) {
        setcurrentuser(username);
      } else {
        setcurrentuser(false);
      }
    } else {
      setcurrentuser(false);
    }
  }, [users]);

  return (
    <AppContext.Provider value={{ currentuser, setcurrentuser, users, loading }}>
      <Router>
        <Routes>
          <Route path="/" element={<SingleChat />} />
          <Route path="/Register" element={<RegisterForm />} />
          <Route path="/user" element={<User />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
