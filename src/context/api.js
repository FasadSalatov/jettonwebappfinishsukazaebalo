// api.js

import axios from 'axios';

// Пример функции для получения статистики
export const fetchStatistics = async () => {
    try {
        const response = await axios.get('https://app.jettonwallet.com/api/v1/statistics/');
        return response.data; // Предполагается, что данные находятся в response.data
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        throw error; // Проброс ошибки для обработки в компоненте
    }
};
