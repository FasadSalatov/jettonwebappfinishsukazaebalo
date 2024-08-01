// src/api.js
import axios from 'axios';
export const fetchReferrals = async (page = 1, limit = 100) => {
    try {
        const response = await fetch(`https://app.jettonwallet.com/api/v1/referrals?page=${page}&limit=${limit}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch referrals:', error);
        throw error;
    }
};


// src/api.js
export const fetchLeaders = async () => {
    try {
        const response = await fetch('https://app.jettonwallet.com/api/v1/LeaderBoard'); // Замените на реальный эндпоинт
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch leaders:', error);
        throw error;
    }
};

// src/api.js

export const fetchUserStatistics = async (userId) => {
  try {
      const response = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${userId}/`);
      return response.data;
  } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      throw error;
  }
};

// src/api.js

export const fetchAvatars = async () => {
  try {
    const response = await axios.get('https://app.jettonwallet.com/api/v1/avatars/');
    return response.data;
  } catch (error) {
    console.error('Error fetching avatars:', error);
    throw error;
  }
};

export const fetchUser = async () => {
  try {
    const response = await axios.get('https://app.jettonwallet.com/api/v1/users/');
    return response.data[0]; // Assuming you want the first user
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post('https://app.jettonwallet.com/api/v1/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

