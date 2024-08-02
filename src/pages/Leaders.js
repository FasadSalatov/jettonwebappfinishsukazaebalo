import React, { useState, useRef, useEffect } from 'react';
import '../styles/home.css';
import avatar from '../components/wlcpage/headavatar.png';
import { Link } from 'react-router-dom';
import defaultAvatar from '../components/wlcpage/headavatar.png';
import Modal from '../components/modal.js';
import wltlogo from '../imgs/wallet.svg';
import fotlogo from '../imgs/fotlogo.svg';
import fotlogo2 from '../imgs/fotlogo2.svg';
import fotlogo3 from '../imgs/fotlogo3.svg';
import { TonConnectUIProvider, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import useTelegramUser from '../hooks/useTelegramUser';
import { useTaskContext } from '../context/TaskContext';
import { useSpring, animated } from '@react-spring/web';
import axios from 'axios';
import useUserData from '../hooks/useUserData.js';

function Leaders() {
  const [avatarImage, setAvatarImage] = useState(defaultAvatar);
  const [userData, setUserData] = useState({});
  const [profileEditModalVisible, setProfileEditModalVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [taskInfo, setTaskInfo] = useState('');
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { tasksVisible, handleHideTasks } = useTaskContext();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const user = useTelegramUser();
  const [coins, setCoins] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const { setId } = useUserData();
  const [referralsCount, setReferralsCount] = useState(0);
  const userFriendlyAddress = useTonAddress();
  const [springProps, api] = useSpring(() => ({ y: 0, config: { tension: 300, friction: 20 } }));
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.userId) {
      const fetchUserData = async () => {
        try {
          const userResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${storedData.userId}/`);
          const user = userResponse.data;
          setUserData(user);
          setBalance(user.balance);
          setReferralsCount(user.remaining_invites);

          // Fetch avatar image
          if (user.related_avatar) {
            const avatarResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/avatars/${user.related_avatar}/`);
            setAvatarImage(avatarResponse.data.image);
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
        }
      };
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.userId) {
      const fetchUserData = async () => {
        try {
          const userResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${storedData.userId}/`);
          const user = userResponse.data;
          setUserData(user);
          setId(user.id);

          if (user.related_avatar) {
            const avatarResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/avatars/${user.related_avatar}/`);
            setAvatarImage(avatarResponse.data.image);
          }

          // Загрузка данных о балансе и количестве друзей
          setCoins(Math.floor(user.balance));
          const referralsResponse = await axios.get('https://app.jettonwallet.com/api/v1/users/referrals/');
          setFriendsCount(referralsResponse.data.results.length);

        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
        }
      };
      fetchUserData();
    }
  }, [setAvatarImage, setId]);

  useEffect(() => {
    const loadLeaders = async () => {
      try {
        const response = await axios.get('https://app.jettonwallet.com/api/v1/users/leader-board/', {
          params: {
            limit: 1000,
            offset: 0,
          },
        });
        const leadersData = response.data.results.map(leader => ({
          ...leader,
          balance: Math.floor(leader.balance),
        }));

        // Fetch avatars for each leader
        const leadersWithAvatars = await Promise.all(
          leadersData.map(async (leader) => {
            if (leader.id) {
              try {
                const userResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${leader.id}/`);
                const user = userResponse.data;
                if (user.related_avatar) {
                  const avatarResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/avatars/${user.related_avatar}/`);
                  return { ...leader, avatarUrl: avatarResponse.data.image };
                } else {
                  return { ...leader, avatarUrl: defaultAvatar };
                }
              } catch (error) {
                console.error(`Ошибка при загрузке данных пользователя ${leader.id}:`, error);
                return { ...leader, avatarUrl: defaultAvatar };
              }
            } else {
              return { ...leader, avatarUrl: defaultAvatar };
            }
          })
        );

        setLeaders(leadersWithAvatars);
      } catch (error) {
        setError('Failed to load leaders');
        console.error('Error loading leaders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaders();
  }, []);

  const handleScroll = (e) => {
    const scrollElement = e.target;
    const scrollTop = scrollElement.scrollTop;
    const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;

    if (scrollTop >= maxScrollTop) {
      setIsAtBottom(true);
      api.start({ y: (scrollTop - maxScrollTop) * 0.3 });
    } else {
      setIsAtBottom(false);
      api.start({ y: 0 });
    }
  };

  const handleScrollRelease = () => {
    if (isAtBottom) {
      api.start({ y: 0 });
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    scrollElement.addEventListener('scroll', handleScroll);
    scrollElement.addEventListener('touchend', handleScrollRelease);
    scrollElement.addEventListener('mouseup', handleScrollRelease);

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      scrollElement.removeEventListener('touchend', handleScrollRelease);
      scrollElement.removeEventListener('mouseup', handleScrollRelease);
    };
  }, [isAtBottom]);

  const handleClaimClick = (info) => {
    setTaskInfo(info);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConnectWallet = async () => {
    try {
      await tonConnectUI.connectWallet();
      const storedData = JSON.parse(localStorage.getItem('userData'));
      await axios.post(`https://app.jettonwallet.com/api/v1/users/users/${storedData.userId}/`, { wallet_address: userFriendlyAddress });
      alert('Wallet connected successfully!');
    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
      alert('Error connecting wallet. Please try again.');
    }
  };

  const handleProfileEditClick = () => {
    setProfileEditModalVisible(true);
  };

  const closeProfileEditModal = () => {
    setProfileEditModalVisible(false);
  };

  const handleWalletClick = () => {
    setWalletModalVisible(true);
  };

  const handleCopyWallet = () => {
    if (wallet?.account) {
      navigator.clipboard.writeText(wallet.account.address);
      setWalletModalVisible(false);
      alert('Wallet number copied!');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
      setWalletModalVisible(false);
      alert('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Ошибка отключения кошелька:', error);
      alert('Error disconnecting wallet. Please try again.');
    }
  };

  const maskWallet = (address) => {
    if (!address) return '';
    return `${address.slice(2, 5)}****${address.slice(-2)}`;
  };

  const closeWalletModal = () => {
    setWalletModalVisible(false);
  };

  const sortedLeaders = leaders.sort((a, b) => b.balance - a.balance);

  return (
    <div className="container">
      <div className='ttt'>
        <p>Some text Some text Some text Some text Some text Some text</p>
      </div>
      <div className='headerr'>
        <div className='nae'>
          <span className='nameava'>
            <span className='imgheader'>
              <Link to='/stylesy'><img src={avatarImage || avatar} alt='Avatar' /></Link>
              <p>{userData.username || ''}</p> {/* Отображаем имя пользователя */}
            </span>
            <span className='frenhead'>
              <p>{friendsCount} friends</p>
            </span>
          </span>
          <span className='headbtns'>
            {wallet ? (
              <div className='coinss'>
                <p>{balance} coins</p>
              </div>
            ) : (
              <div className='coinss'>
                <p>{balance} coins</p>
              </div>
            )}
          </span>
        </div>
      </div>

      <div className='cher'></div>
      {tasksVisible && (
        <div className='tasks'>
          <h1>
            Tasks
            <button onClick={handleHideTasks} className='close-btn'>×</button>
          </h1>
          <p>Some text Some text Some text Some text Some text Some text</p>
        </div>
      )}

      <div className='maincontent leadhei'>
        <div className='switchfix'>
          <div className='switches'>
            <Link to='/' className='linkbtn'><button className='btn2'>Tasks</button></Link>
            <Link><button className='btn3'>Leaders</button></Link>
          </div>
        </div>

        <animated.div
          className='switchcontent padd'
          ref={scrollRef}
          style={{ transform: springProps.y.to(y => `translateY(${y}px)`) }}
        >
          {isLoading && <p>Loading leaders...</p>}
          {sortedLeaders.map(leader => (
            <div className='tasking' key={leader.id}>
              <img src={leader.avatarUrl || avatar} width='36px' alt='avatar' className='amg'/>
              <div className='tskk'>
                <p className='typetask'></p>
                <p className='tskkk'>{leader.username}</p>
              </div>
              <div className='valuetask'>
                <g>Coins:</g>
                <p className='fivetoten color'>{leader.balance}</p> {/* Отображаем количество монет */}
              </div>
            </div>
          ))}
        </animated.div>
        <div className={`blur-overlay ${showModal || walletModalVisible || profileEditModalVisible ? 'show' : ''}`} />
      </div>

      <div className='fot'>
        <div className='fotcont'>
          <Link to='/'><button><img src={fotlogo} alt='Home'/></button></Link>
          <Link to='/Contact'><button><img src={fotlogo2} alt='Contact'/></button></Link>
          <Link to='/about'><button><img src={fotlogo3} alt='About'/></button></Link>
        </div>
      </div>

      {walletModalVisible && (
        <Modal onClose={closeWalletModal}>
          <div className='wallet-modal-content'>
            <button onClick={handleCopyWallet}>Copy Wallet Number</button>
            <button onClick={handleDisconnectWallet}>Disconnect Wallet</button>
          </div>
        </Modal>
      )}

      {profileEditModalVisible && (
        <Modal onClose={closeProfileEditModal}>
          <div className='profile-edit-modal-content'>
            {/* Profile edit form here */}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Leaders;
