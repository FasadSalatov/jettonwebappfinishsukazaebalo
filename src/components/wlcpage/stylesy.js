import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './wlc.css';
import headavatar from './headavatar.png';
import tst from './trst.png';
import useTelegramUser from '../../hooks/useTelegramUser';
import useUserData from '../../hooks/useUserData';
import { useNavigate } from 'react-router-dom';

function Stylesy() {
  const [selectedAvatar, setSelectedAvatar] = useState(headavatar);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [nickname, setNickname] = useState('');
  const [avatars, setAvatars] = useState([]);
  const user = useTelegramUser();
  const navigate = useNavigate();
  const { setIsUserAuthorized, setId } = useUserData();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.userId) {
      setIsUserAuthorized(true);
      setId(userData.userId);
      navigate('/stylesy');
    }

    if (user?.username) {
      setNickname(user.username);
    }
    if (user?.id) {
      setId(user.id);
    }
  }, [user, setId, navigate, setIsUserAuthorized]);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await axios.get('https://app.jettonwallet.com/api/v1/users/avatars/');
        const avatarsWithId = response.data.results.map((avatar, index) => ({
          ...avatar,
          generatedId: index + 1
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
    setSelectedAvatarId(avatar.generatedId);
  };

  const handleSave = async () => {
    const userId = await getNextAvailableId();
    const userData = {
      id: userId,
      username: nickname || user?.username || 'default_username',
      telegram_id: user?.id || null,
      related_avatar: selectedAvatarId || 1,
      balance: 100,
    };

    try {
      const response = await axios.post('https://app.jettonwallet.com/api/v1/users/users/', userData);

      const storedData = {
        userId: response.data.id,
        telegramId: response.data.telegram_id,
        avatarId: response.data.related_avatar
      };
      localStorage.setItem('userData', JSON.stringify(storedData));

      setIsUserAuthorized(true);
      setId(response.data.id);
      navigate('/stylesy');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const getNextAvailableId = async () => {
    let id = 1;
    while (true) {
      try {
        await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${id}/`);
        id += 1;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return id;
        }
        console.error('Error getting next available ID:', error);
        break;
      }
    }
    return null;
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
                key={avatar.generatedId}
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