// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (userId) {
      // Загружаем данные пользователя, если userId установлен
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id) => {
    try {
      const response = await axios.get(`https://app.jettonwallet.com/api/v1/users/${id}/`);
      setUserData(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
