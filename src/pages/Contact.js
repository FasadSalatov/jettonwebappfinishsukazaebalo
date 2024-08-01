import React, { useState, useEffect, useRef } from 'react';
import '../styles/home.css';
import avatar from '../components/wlcpage/headavatar.png';
import { Link } from 'react-router-dom';
import tg from '../imgs/tg.svg';
import logofot from '../imgs/logofot.svg';
import fotlogo from '../imgs/fotlogo.svg';
import fotlogo2 from '../imgs/fotlogo2.svg';
import fotlogo3 from '../imgs/fotlogo3.svg';
import Modal from '../components/modal2.js';
import '../components/wlcpage/modal2.css';
import axios from 'axios'; // Используем axios для выполнения запросов

// Функция для получения рефералов
const fetchReferrals = async (page) => {
    const limit = 10; // Количество элементов на страницу
    const offset = (page - 1) * limit; // Смещение для пагинации
    try {
        const response = await axios.get(`https://app.jettonwallet.com/api/v1/users/referrals/?limit=${limit}&offset=${offset}`);
        return response.data.results;
    } catch (error) {
        console.error('Error fetching referrals:', error);
        return [];
    }
};

function Contact() {
    const [walletModalVisible, setWalletModalVisible] = useState(false);
    const [profileEditModalVisible, setProfileEditModalVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [tasksVisible, setTasksVisible] = useState(true);
    const [referrals, setReferrals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const fetchData = async (page) => {
        setIsLoading(true);
        try {
            const data = await fetchReferrals(page);
            if (data.length < 10) {
                setHasMore(false);
            }
            setReferrals(prevReferrals => [...prevReferrals, ...data]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const handleCopyClick = () => {
        navigator.clipboard.writeText('https://t.me/FasadFinder_bot/JettoCoin')
            .then(() => {
                setShowModal(true);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleHideTasks = () => {
        setTasksVisible(false);
        localStorage.setItem('tasksVisible', JSON.stringify(false));
    };

    // Функция для подгрузки данных при скролле
    const scrollRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
                if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
                    setPage(prevPage => prevPage + 1);
                }
            }
        };

        const refCurrent = scrollRef.current;
        if (refCurrent) {
            refCurrent.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (refCurrent) {
                refCurrent.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading, hasMore]);

    return (
        <div className="container">
            <div className='maincontent refcontenter'>
                <div className='switchfix'>
                    <p className='refh1 myref'>My referrals</p>
                    <div className='switchcontact' ref={scrollRef}>
                        {tasksVisible && referrals.map(referral => (
                            <div className='tasking' key={referral.related_user_referral.id}>
                                <img src={avatar} width='36px' alt='Avatar' className='amg' />
                                <div className='tskk'>
                                    <p className='typetask'></p>
                                    <p className='tskkk'>{referral.related_user_referral.username}</p>
                                </div>
                                <div className='valuetask'>
                                    <g>Profit:</g>
                                    <p className='fivetoten'>{referral.related_user_referral.balance}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && <p>Loading more referrals...</p>}
                    </div>
                </div>
                <div className={`blur-overlay ${showModal || walletModalVisible || profileEditModalVisible ? 'show' : ''}`} />
            </div>
            <div className='headerr'>
                <div className='nae'>
                    <p className='refh1'>Available for the claim</p>
                    <span className='headbtnsref'>
                        <p className='refhh1'>1 000 000 coins</p>
                        <button className='btnref'>
                            <p>Claim</p>
                        </button>
                    </span>
                    <p className='bbh2'>By inviting friends, you get 10% of their balance and 2.5% of their referrals' balance</p>
                </div>
            </div>
            <div className='refcontainer'>
                <p className='refh1'>Referral link</p>
                <span className='btnsharegroup'>
                    <button className='shareclaimbtn' onClick={handleCopyClick}>
                        <p>Copy</p>
                    </button>
                    <Link to='https://telegram.me/share/url?url=https://t.me/FasadFinder_bot/JettoCoin'>
                        <button className='sharebtn'>
                            <p>Share</p>
                        </button>
                    </Link>
                </span>
            </div>
            <div className='fot'>
                <div className='fotcont'>
                    <Link to='/'><button><img src={fotlogo} alt='Home'></img></button></Link>
                    <Link to='/contact'><button className='activebtn'><img src={fotlogo2} alt='Contact'></img></button></Link>
                    <Link to='/about'><button><img src={fotlogo3} alt='About'></img></button></Link>
                </div>
            </div>
            <Modal show={showModal} handleClose={handleCloseModal} />
        </div>
    );
}

export default Contact;
