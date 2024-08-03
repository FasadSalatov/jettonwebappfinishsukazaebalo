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

    if (user) {
      setNickname(user.username);
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
    console.log('Starting handleSave...');
  
    if (!user || !user.id) {
      console.error('Telegram ID is not available');
      return;
    }
  
    const userData = {
      username: nickname || user.username || 'default_username',
      telegram_id: user.id,
      balance: 100,
      twitter_account: '',
      youtube_account: '',
      remaining_invites: 10,
      related_avatar: selectedAvatarId || 1,
    };
  
    console.log('User data to be saved:', userData);
  
    try {
      // Check if the user already exists in the database
      const response = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/?telegram_id=${user.id}`);
      const existingUser = response.data.results[0];
  
      if (existingUser) {
        // User already exists, update the existing user
        await axios.patch(`https://app.jettonwallet.com/api/v1/users/users/${existingUser.id}/`, { related_avatar: userData.related_avatar });
  
        // Update the storedData with the new avatar ID
        const storedData = {
          userId: existingUser.id,
          telegramId: user.id,
          avatarId: userData.related_avatar,
        };
        localStorage.setItem('userData', JSON.stringify(storedData));
        
        console.log('User data updated:', storedData);
      } else {
        // New user registration
        const createResponse = await axios.post('https://app.jettonwallet.com/api/v1/users/users/', userData);
        
        const storedData = {
          userId: existingUser.id, // New ID from the server
          telegramId: user.id,
          avatarId: createResponse.data.related_avatar,
        };
        localStorage.setItem('userData', JSON.stringify(storedData));
        
        setIsUserAuthorized(true);
        setId(createResponse.data.id); // Set new ID in state
      }
  
      navigate('/');
    } catch (error) {
      console.error('Error saving user data:', error.response ? error.response.data : error.message);
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