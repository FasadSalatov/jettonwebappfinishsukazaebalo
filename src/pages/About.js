import React, { useEffect, useState } from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import arrow from '../imgs/arrow.svg';
import term from '../imgs/terms.svg';
import logofot from '../imgs/logofot.svg';
import fotlogo from '../imgs/fotlogo.svg';
import fotlogo2 from '../imgs/fotlogo2.svg';
import fotlogo3 from '../imgs/fotlogo3.svg';
import { fetchUserStatistics } from '../api/api.js';
import axios from 'axios';

function About() {
    const [userData, setUserData] = useState(null);
    const [balance, setBalance] = useState(0);
    const [referralsCount, setReferralsCount] = useState(0);
    const [error, setError] = useState(null);

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
                } catch (error) {
                    console.error('Ошибка при загрузке данных пользователя:', error);
                    setError('Failed to fetch user data.');
                }
            };
            fetchUserData();
        } else {
            setError('User ID not found in localStorage.');
        }
    }, []);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('manager@jettonwallet.com')
            .then(() => {
                alert('Email copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    };

    return (
        <div className="container">
            <div className='setings'>
                <p className='refh1 btntop'>Settings</p>
                <button className='setbtn'>
                    <span>
                        <p className='hh1set'>Change the language</p>
                        <p className='hh2set'>English</p>
                    </span>
                    <img src={arrow} alt="Arrow" />
                </button>
                <button className='setbtn'>
                    <span>
                        <p className='hh1set'>Change the exchange</p>
                        <p className='hh2set'>Ton Wallet</p>
                    </span>
                    <img src={arrow} alt="Arrow" />
                </button>

                <div className="notification-container">
                    <span className="notification-text">Notification</span>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
            <div className='headerr'>
                <div className='nae'>
                    <p className='refh1 btntop'>Statistics</p>
                    <span className='headbtnsset'>
                        {error ? (
                            <p>{error}</p>
                        ) : userData ? (
                            <>
                                <div className='btnset '>
                                    <p className='piset'>Username</p>
                                    <p className='pset'>{userData.username}</p>
                                </div>
                                <div className='btnset'>
                                    <p className='piset'>Balance</p>
                                    <p className='pset'>{balance}</p>
                                </div>
                                <div className='btnset'>
                                    <p className='piset'>Remaining Invites</p>
                                    <p className='pset'>{referralsCount}</p>
                                </div>
                                {/* Add more user statistics as needed */}
                            </>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </span>
                </div>
            </div>

            <div className='refcontainer'>
                <p className='refh1'>Any questions?</p>
                <span className='btnsharegroupsup'>
                    <div className='btncopyemail'>
                        <button className='copy-email' onClick={handleCopyEmail}>
                            manager@jettonwallet.com
                        </button>
                        <Link to='https://telegram.org/support?setln=ru'>
                            <button className='supbtn'>
                                <p>Support</p>
                            </button>
                        </Link>
                    </div>
                    <button className='setbtn'>
                        <span>
                            <p className='hh1set'>Our website</p>
                        </span>
                        <img src={arrow} alt="Arrow" />
                    </button>
                    <img src={term} className='term' alt="Terms" />
                </span>
            </div>

            <div className='fot'>
                <img src={logofot} className='logofot' alt='Logo' />
                <div className='fotcont'>
                    <Link to='/'><button><img src={fotlogo} alt='Home' /></button></Link>
                    <Link to='/contact'><button><img src={fotlogo2} alt='Contact' /></button></Link>
                    <Link to='/about'><button className='activebtn'><img src={fotlogo3} alt='About' /></button></Link>
                </div>
            </div>
        </div>
    );
}

export default About;
