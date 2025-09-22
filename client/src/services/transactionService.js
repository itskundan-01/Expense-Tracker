import axios from 'axios';

// The base URL of your Spring Boot backend.
// Make sure this matches the port your backend is running on.
const API_BASE_URL = 'http://localhost:8082/api/transactions';

// This function will fetch all transactions from the backend.
const getTransactions = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        // Later, you would add headers here for authentication:
        // const response = await axios.get(API_BASE_URL, { headers: { 'Authorization': `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        // In a real app, you'd handle this error more gracefully (e.g., show a notification)
        return []; // Return an empty array on error
    }
};

// This function will create a new transaction.
const addTransaction = async (transactionData) => {
    try {
        const response = await axios.post(API_BASE_URL, transactionData);
        return response.data;
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error; // Let the component handle the error
    }
};

// You can add more functions here later for updating and deleting transactions.

// We export the functions so other parts of our app can use them.
export {
    getTransactions,
    addTransaction
};

