import { useState, useEffect } from 'react';
import axios from 'axios';

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [avatars, setAvatars] = useState([]);
  const [avatar, setAvatar] = useState('');
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const [id, setId] = useState(null);

  const fetchTasks = async (page, filter = 'all') => {
    try {
      setIsLoading(true);

      const limit = 10;
      const offset = (page - 1) * limit;
      const url = filter === 'all' ? 
        `https://app.jettonwallet.com/api/v1/tasks/task/?limit=${limit}&offset=${offset}` : 
        `https://app.jettonwallet.com/api/v1/tasks/task/?related_task_type=${filter}&limit=${limit}&offset=${offset}`;
      const tasksResponse = await axios.get(url);
      const tasksData = tasksResponse.data;
      const { results, next } = tasksData;

      if (results.length > 0) {
        setTasks(prevTasks => Array.isArray(prevTasks) ? [...prevTasks, ...results] : [...results]);
        setHasMoreTasks(!!next);
      } else {
        setHasMoreTasks(false);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const userResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${id}/`);
        const user = userResponse.data;
        if (user) {
          setUserData(user);
          setBalance(user.balance);
          setAvatar(user.related_avatar ? avatars.find(avatar => avatar.id === user.related_avatar)?.image : '');

          const referralsResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/referrals/${user.id}`);
          setReferralsCount(referralsResponse.data.results.length);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [id, avatars]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const avatarsResponse = await axios.get('https://app.jettonwallet.com/api/v1/users/avatars/');
        setAvatars(avatarsResponse.data.results);
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };

    fetchAvatars();
  }, []);

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage]);

  const updateBalance = async (newBalance) => {
    try {
      if (!id) return;
      const response = await axios.put(`https://app.jettonwallet.com/api/v1/users/users/${id}/`, { balance: newBalance });
      if (response.status === 200) {
        setBalance(newBalance); // Обновляем локальное состояние только при успешном обновлении
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  return {
    userData,
    balance,
    referralsCount,
    avatars,
    avatar,
    tasks,
    currentPage,
    isLoading,
    hasMoreTasks,
    isUserAuthorized,
    setAvatar,
    setCurrentPage,
    setIsUserAuthorized,
    setIsLoading,
    id,
    setId,
    fetchTasks,
    setTasks,
    updateBalance,
  };
};

export default useUserData;
