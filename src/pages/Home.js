import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import defaultAvatar from '../components/wlcpage/headavatar.png';
import tg from '../imgs/tg.svg';
import fotlogo from '../imgs/fotlogo.svg';
import fotlogo2 from '../imgs/fotlogo2.svg';
import fotlogo3 from '../imgs/fotlogo3.svg';
import Modal from '../components/modal.js';
import wltlogo from '../imgs/wallet.svg';
import { useTaskContext } from '../context/TaskContext';
import { TonConnectUIProvider, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import useUserData from '../hooks/useUserData.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const {
    tasks,
    setTasks,
    isLoading,
    hasMoreTasks,
    setIsLoading
  } = useUserData();
  const navigate = useNavigate();
  const [friendsCount, setFriendsCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [avatarImage, setAvatarImage] = useState(defaultAvatar);
  const [showModal, setShowModal] = useState(false);
  const [taskInfo, setTaskInfo] = useState('');
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const { tasksVisible, handleHideTasks } = useTaskContext();
  const [springProps] = useSpring(() => ({ y: 0, config: { tension: 300, friction: 20 } }));
  const scrollRef = useRef(null);
  const [completedTasks, setCompletedTasks] = useState([]);


  const goToStylesy = () => {
    navigate('/stylesy');
  };
  // Fetch user data based on stored ID
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.userId) {
      const fetchUserData = async () => {
        try {
          const userResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/users/${storedData.userId}/`);
          const user = userResponse.data;
          setUserData(user.id);
          setBalance(user.balance);
          setReferralsCount(user.remaining_invites);

          // Fetch avatar image
          if (user.related_avatar) {
            const avatarResponse = await axios.get(`https://app.jettonwallet.com/api/v1/users/avatars/${user.related_avatar}/`);
            setAvatarImage(avatarResponse.data.image);
          }

          const referralsResponse = await axios.get('https://app.jettonwallet.com/api/v1/users/referrals/');
          setFriendsCount(referralsResponse.data.results.length);
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
        }
      };
      fetchUserData();
    }

    // Загружаем выполненные задачи из localStorage
    const completedTasksFromStorage = JSON.parse(localStorage.getItem('completedTasks')) || [];
    setCompletedTasks(completedTasksFromStorage);
  }, []);

  // Сохраняем выполненные задачи в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('https://app.jettonwallet.com/api/v1/tasks/');
        setTasks(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };

    fetchTasks();
  }, []);

  // Fetch task details
  const fetchTaskDetails = async (taskId) => {
    try {
      const response = await axios.get(`https://app.jettonwallet.com/api/v1/tasks/task/${taskId}/`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке деталей задачи:', error);
      return null;
    }
  };

  const updateUserBalance = async (userId, newBalance) => {
    try {
      await axios.patch(`https://app.jettonwallet.com/api/v1/users/users/${userId}/`, {
        balance: newBalance,
      });
      console.log('Баланс обновлён на сервере');
    } catch (error) {
      console.error('Ошибка при обновлении баланса на сервере:', error);
    }
  };

  const handleClaimClick = useCallback(async (taskId, coins) => {
    if (!taskId) {
      console.error('Task ID is undefined');
      return;
    }

    if (completedTasks.includes(taskId)) {
      console.log('Task already completed');
      return;
    }

    const taskDetails = await fetchTaskDetails(taskId);
    if (taskDetails) {
      setTaskInfo(taskDetails);
      setShowModal(true);
      const storedData = JSON.parse(localStorage.getItem('userData'));

      // Обновляем баланс пользователя
      const newBalance = balance + coins;
      setBalance(newBalance); // Обновляем состояние локально

      // Получаем ID пользователя из storedData
      const userId = storedData.userId;

      // Обновляем баланс на сервере через функцию updateUserBalance
      await updateUserBalance(userId, newBalance);

      // Добавляем выполненную задачу в список
      setCompletedTasks((prevCompletedTasks) => [...prevCompletedTasks, taskId]);
    }
  }, [balance, fetchTaskDetails, updateUserBalance, completedTasks]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleConnectWallet = useCallback(async () => {
    try {
      await tonConnectUI.connectWallet();
      const storedData = JSON.parse(localStorage.getItem('userData'));
      await axios.post(`https://app.jettonwallet.com/api/v1/users/users/${storedData.userId}/`, { wallet_address: userFriendlyAddress });
      alert('Wallet connected successfully!');
    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
      alert('Error connecting wallet. Please try again.');
    }
  }, [tonConnectUI, userFriendlyAddress]);

  const handleWalletClick = useCallback(() => {
    setWalletModalVisible(true);
  }, []);

  const handleCopyWallet = useCallback(() => {
    if (userFriendlyAddress) {
      navigator.clipboard.writeText(userFriendlyAddress);
      setWalletModalVisible(false);
      alert('Wallet address copied to clipboard!');
    }
  }, [userFriendlyAddress]);

  const handleDisconnectWallet = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
      setWalletModalVisible(false);
      alert('Wallet disconnected successfully!');
    } catch (error) {
      console.error('Ошибка отключения кошелька:', error);
      alert('Error disconnecting wallet. Please try again.');
    }
  }, [tonConnectUI]);

  const maskWallet = (address) => {
    if (!address) return '';
    return `${address.slice(0, 3)}****${address.slice(-3)}`;
  };

  const closeWalletModal = () => {
    setWalletModalVisible(false);
  };

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (filter === 'all') return true;
      if (filter === 'social activity' && task.related_task_type.id === 1) return true;
      if (filter === 'manual verification' && task.related_task_type.id === 2) return true;
      return false;
    });
  }, [tasks, filter]);

  const username = userData?.username || '';

  return (
    <TonConnectUIProvider manifestUrl="https://jettocoinwebapp.vercel.app/tonconnect-manifest.json">
      <div className="container">
        <div className='ttt'>
          <p>Some text Some text Some text Some text Some text Some text</p>
        </div>
        <div className='headerr'>
          <div className='nae'>
            <span className='nameava'>
              <span className='imgheader'>
                <Link to='/stylesy' onClick={goToStylesy}>
                  <img src={avatarImage} alt='Avatar' />
                </Link>
                <p>{username}</p>
              </span>
              <span className='frenhead'>
                <p>{friendsCount} friends</p>
              </span>
            </span>
            <span className='headbtns'>
              {wallet ? (
                <div className='wallet-container'>
                  <button className='wallet-button' onClick={handleWalletClick}>
                    {maskWallet(userFriendlyAddress)}<img src={wltlogo} alt='' />
                  </button>
                  <div className='coins'>
                    <p>{balance} coins</p>
                  </div>
                </div>
              ) : (
                <div className='wallet-container'>
                  <button onClick={handleConnectWallet} className="wallet-button">
                    Connect wallet
                  </button>
                  <div className='coins'>
                    <p>{balance} coins</p>
                  </div>
                </div>
              )}
            </span>
          </div>
        </div>

        <div className='cher'></div>

        <Modal show={showModal} onClose={handleCloseModal} taskInfo={taskInfo} />

        {walletModalVisible && (
          <div className="modal2">
            <div className="modal-content">
              <button onClick={handleCopyWallet}>Copy Wallet Address</button>
              <button onClick={handleDisconnectWallet}>Disconnect Wallet</button>
              <button onClick={closeWalletModal}>Close</button>
            </div>
          </div>
        )}

        {tasksVisible && (
          <div className='tasks'>
            <h1>
              Tasks
              <button onClick={handleHideTasks} className='close-btn'>×</button>
            </h1>
            <p>Some text Some text Some text Some text Some text Some text</p>
          </div>
        )}

        <div className={`maincontent mainheight pad ${!tasksVisible ? 'expanded' : ''}`}>
          <div className='switchfix'>
            <div className='switches'>
              <button className='btn1'>Tasks</button>
              <Link to='/leaders'><button className='btn2'>Leaders</button></Link>
            </div>

            <div className='miniswitch'>
              <button className={`minibtn ${filter === 'all' ? 'minibtnactive' : ''}`} onClick={() => setFilter('all')}>All</button>
              <p className='ras'>|</p>
              <button className={`minibtn ${filter === 'social activity' ? 'minibtnactive' : ''}`} onClick={() => setFilter('social activity')}>Social activity</button>
              <p className='ras'>|</p>
              <button className={`minibtn ${filter === 'manual verification' ? 'minibtnactive' : ''}`} onClick={() => setFilter('manual verification')}>Manual verification</button>
            </div>
          </div>

          <animated.div
            className='switchcontent'
            ref={scrollRef}
            style={{ transform: springProps.y.to(y => `translateY(${y}px)`) }}
          >
            {filteredTasks.map(task => (
              <div className={`tasking ${completedTasks.includes(task.id) ? 'successed' : ''}`} key={task.id}>
                <img className='tskimg' src={tg} alt='Telegram' />
                <div className='tskk'>
                  <p className='tsk'>{task.description}</p>
                </div>
                <div className='valuetask'>
                  <button
                    className={`claimbtn ${completedTasks.includes(task.id) ? 'markup' : ''}`}
                    onClick={() => handleClaimClick(task.id, task.points)}
                  >
                    <p>{task.points} coins</p>
                  </button>
                </div>
              </div>
            ))}

            {isLoading && <p>Loading more tasks...</p>}
            {!hasMoreTasks && <p></p>}
          </animated.div>

          <div className={`blur-overlay ${showModal || walletModalVisible ? 'show' : ''}`} />
        </div>
        <div className='fot'>
          <div className='fotcont'>
            <Link to='/'><button className='activebtn'><img src={fotlogo} alt='Home' /></button></Link>
            <Link to='/Contact'><button ><img src={fotlogo2} alt='Contact' /></button></Link>
            <Link to='/about'><button><img src={fotlogo3} alt='About' /></button></Link>
          </div>
        </div>
      </div>
    </TonConnectUIProvider>
  );
}

export default Home;
