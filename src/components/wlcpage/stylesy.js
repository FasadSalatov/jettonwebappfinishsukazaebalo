import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './wlc.css';
import headavatar from './headavatar.png';
import tst from './trst.png';
import useTelegramUser from '../../hooks/useTelegramUser';
import useUserData from '../../hooks/useUserData';
import { useNavigate } from 'react-router-dom';

function Stylesy() {
  const [selectedAvatar, setSelectedAvatar] = useState(headavatar);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null); // Сохраняем ID выбранного аватара
  const [nickname, setNickname] = useState('');
  const [avatars, setAvatars] = useState([]);
  const user = useTelegramUser();
  const navigate = useNavigate();
  const { setIsUserAuthorized, setId } = useUserData();
  const TOKEN = '7098836545:AAF7HxBPRx0F_LmFIeWoQQgCn8Xl9xHlq-s';
  useEffect(() => {
    if (user?.username) {
      setNickname(user.username);
    }
    if (user?.id) {
      setId(user.id);
    }
  }, [user, setId]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await axios.get('https://app.jettonwallet.com/api/v1/users/avatars/');
        const avatarsWithId = response.data.results.map((avatar, index) => ({
          ...avatar,
          generatedId: index + 1 // Присваиваем новый ID, начиная с 1
        }));
        setAvatars(avatarsWithId);
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };

    fetchAvatars();
  }, []);

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar.image);
    setSelectedAvatarId(avatar.generatedId); // Используем сгенерированный ID
    console.log("Выбранный аватар ID:", avatar.generatedId); // Логируем ID выбранного аватара
  };

  const handleSave = async () => {
    try {
      // Отправляем запрос боту для получения telegram_id текущего пользователя
      const telegramResponse = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`);

      const telegramData = telegramResponse.data;
      const telegramId = telegramData.result[0].message.from.id;

      console.log("Полученный telegram_id:", telegramId);

      const userId = uuidv4(); // Генерация уникального ID с помощью UUID

      console.log("ID пользователя:", userId);
      console.log("ID выбранного аватара перед сохранением:", selectedAvatarId);

      const userData = {
        id: userId,
        username: nickname || user?.username || 'default_username',
        telegram_id: telegramId, // Используем полученный telegram_id
        related_avatar: selectedAvatarId || 1, // Используем ID выбранного аватара
        balance: 100,
      };

      console.log("Пользовательские данные для сохранения:", userData);

      const response = await axios.post('https://app.jettonwallet.com/api/v1/users/users/', userData);
      
      // Save user data in local storage
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userId', response.data.id);

      // Store the user ID and Telegram ID in a JSON format in local storage
      const storedData = {
        userId: response.data.id,
        telegramId: response.data.telegram_id,
        avatarId: response.data.related_avatar
      };
      localStorage.setItem('userData', JSON.stringify(storedData));

      setIsUserAuthorized(true);
      setId(response.data.id);
      
      navigate('/');
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error.response ? error.response.data : error.message);
      alert('Ошибка при сохранении профиля.');
    }
  };

  return (
    <div className='wrapper'>
      <div className='headerstyle'>
        <div className='headerss'>
          <div className='headavatar'>
            <img src={selectedAvatar} alt='Selected Avatar' />
          </div>
          <div className='headname'>
            <p className='uname'>Your name</p>
            <div className='name'>
              <input
                type='text'
                placeholder='Nickname'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='stylecontainer'>
        <p>You can choose a different avatar</p>
        <div className='avatars'>
          {avatars.length > 0 ? (
            avatars.map((avatar) => (
              <button
                key={avatar.generatedId} // Используем сгенерированный ID
                className={`avatar-button ${selectedAvatar === avatar.image ? 'selected' : ''}`}
                onClick={() => handleAvatarClick(avatar)}
              >
                <img className='baseimg' src={avatar.image} alt={avatar.name} />
                {selectedAvatar === avatar.image && (
                  <img className='activecheck' src={tst} alt='Selected' />
                )}
              </button>
            ))
          ) : (
            <p>No avatars available.</p>
          )}
        </div>
      </div>
      <div className='saved'>
        <button onClick={handleSave}><p>Save</p></button>
      </div>
    </div>
  );
}

export default Stylesy;