import React, { useEffect, useState, useContext } from 'react';
import './TelegramChat.css';
import { AppContext } from '../../App';
import { getDatabase, ref, onValue, push, remove } from 'firebase/database';
import { Link } from 'react-router-dom';

export const SingleChat = () => {
  const { currentuser, setcurrentuser, users, loading } = useContext(AppContext);
  const [currentmessage, setcurrentmessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); 

  const database = getDatabase();

  useEffect(() => {
    if (currentuser && currentmessage) {
      const user = users.find(([key, value]) => value.username === currentuser);
      if (user) {
        const userKey = user[0];
        const userMessagesRef = ref(database, `/${userKey}/messages`);

        onValue(userMessagesRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data[currentmessage]) {
            const userMessages = data[currentmessage].message;
            if (userMessages && typeof userMessages === 'object') {
              const messagesArray = Object.values(userMessages);
              setMessages(messagesArray);
            } else {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        });
      }
    }
  }, [currentuser, currentmessage, users, database]);

  const deleteMessage = (messageId) => {
    const sender = users.find(([key, value]) => value.username === currentuser);
    const receiver = users.find(([key, value]) => value.username === currentmessage);

    if (sender && receiver) {
      const senderKey = sender[0];
      const receiverKey = receiver[0];

      const senderMessageRef = ref(database, `/${senderKey}/messages/${currentmessage}/message`);
      onValue(senderMessageRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageToDelete = Object.entries(data).find(([key, message]) => message.id === messageId);
          if (messageToDelete) {
            const messageKey = messageToDelete[0];
            const messageRef = ref(database, `/${senderKey}/messages/${currentmessage}/message/${messageKey}`);
            remove(messageRef)
              .then(() => {
                setMessages((prevMessages) => prevMessages.filter((message) => message.id !== messageId));
              })
              .catch((error) => console.log('Error deleting sender message:', error));
          }
        }
      });

      const receiverMessageRef = ref(database, `/${receiverKey}/messages/${currentuser}/message`);
      onValue(receiverMessageRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageToDelete = Object.entries(data).find(([key, message]) => message.id === messageId);
          if (messageToDelete) {
            const messageKey = messageToDelete[0];
            const messageRef = ref(database, `/${receiverKey}/messages/${currentuser}/message/${messageKey}`);
            remove(messageRef)
              .catch((error) => console.log('Error deleting receiver message:', error));
          }
        }
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const sender = users.find(([key, value]) => value.username === currentuser);
    const receiver = users.find(([key, value]) => value.username === currentmessage);

    if (sender && receiver) {
      const senderKey = sender[0];
      const receiverKey = receiver[0];

      const time = new Date().toLocaleTimeString();

      const messageData = {
        context: newMessage,
        time: time,
        sender: currentuser,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const senderMessagesRef = ref(database, `/${senderKey}/messages/${currentmessage}/message`);
      push(senderMessagesRef, messageData);

      const receiverMessagesRef = ref(database, `/${receiverKey}/messages/${currentuser}/message`);
      push(receiverMessagesRef, messageData);

      setMessages((prevMessages) => [...prevMessages, messageData]);

      setNewMessage('');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const matchingUser = users.find(([key, value]) => value.username === loginUsername && value.password === loginPassword);

    if (matchingUser) {
      const userData = {
        username: loginUsername,
        password: loginPassword,
        id: matchingUser[0],
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      setcurrentuser(loginUsername);
      setLoginUsername('');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  if (loading) {
    return (
      <div className="chat">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="chat">
      {currentuser === false ? (
        <div className="chat__loginPrompt">
          <h2>Please login to continue</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
            <Link to='/Register'><button type="submit">Register</button></Link>
          </form>
          {loginError && <p className="login-error">{loginError}</p>}
        </div>
      ) : (
        <>
          <div className="chat__users" style={{ width: !currentmessage ? '100%' : '40%' }}>
            <h3>{currentuser}</h3>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {!menuOpen&&<i className="fa fa-bars"></i> }
              {menuOpen&&<i className="fa fa-close"></i> }
            </button>

            {menuOpen && (
              <div className="menu">
                <button onClick={() => { localStorage.removeItem('currentUser'); setcurrentuser(false);setcurrentmessage(false);setMessages([]);setMenuOpen(false) }}>Log Out</button>
                <Link to="/user">
                  <button>Account Control</button>
                </Link>
              </div>
            )}

            <h3>Users</h3>
            <div style={{ cursor: 'pointer' }}>
              {users.map(([key, user]) => {
                if (user.username !== currentuser) {
                  return (
                    <div key={key} onClick={() => setcurrentmessage(user.username)}>
                      <span>{user.username}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {currentmessage && (
            <div className="chat__singlechat">
              <div className="chat__userinfo">
                <h2>Chat with {currentmessage}</h2>
                <button onClick={() => { setcurrentmessage(false); setMessages([]); }}>X</button>
              </div>

              <div className="chat__messages">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className={message.sender === currentuser ? 'me' : 'sender'}>
                      <div className="message-content">
                        <div>
                          <span>{message.context}</span>
                        </div>
                        <div>
                          <span className="message-time">{message.time}</span>
                          {message.sender === currentuser && (
                            <i className='fa fa-trash' onClick={() => deleteMessage(message.id)}></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No messages yet...</p>
                )}
              </div>

              <div className="chat__sendmessage">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
