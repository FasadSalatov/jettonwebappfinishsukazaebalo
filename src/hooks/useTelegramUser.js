import { useState, useEffect } from 'react';

const useTelegramUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    tg.ready(); // Убедитесь, что web app готов

    const userData = tg.initDataUnsafe?.user;

    if (userData) {
      console.log('User data from Telegram:', userData); // Логирование для отладки

      setUser({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        username: userData.username || '',
        languageCode: userData.language_code || '',
        id: userData.id || '', // Проверка наличия id
      });
    } else {
      console.warn('User data not available');
    }
  }, []);

  return user;
};

export default useTelegramUser;
