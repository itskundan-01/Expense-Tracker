-- Initialize expense_tracker database with initial data

-- Create additional tables if needed (Spring Boot will auto-create the main tables)

-- Insert default categories for expense tracking
INSERT IGNORE INTO categories (id, name, icon, color, type, user_id, created_at, updated_at) VALUES
(1, 'Food & Dining', '🍽️', '#FF6B6B', 'expense', 1, NOW(), NOW()),
(2, 'Transportation', '🚗', '#4ECDC4', 'expense', 1, NOW(), NOW()),
(3, 'Shopping', '🛍️', '#45B7D1', 'expense', 1, NOW(), NOW()),
(4, 'Entertainment', '🎬', '#96CEB4', 'expense', 1, NOW(), NOW()),
(5, 'Bills & Utilities', '⚡', '#FFEAA7', 'expense', 1, NOW(), NOW()),
(6, 'Healthcare', '🏥', '#DDA0DD', 'expense', 1, NOW(), NOW()),
(7, 'Education', '📚', '#98D8C8', 'expense', 1, NOW(), NOW()),
(8, 'Salary', '💼', '#6C5CE7', 'income', 1, NOW(), NOW()),
(9, 'Freelance', '💻', '#A29BFE', 'income', 1, NOW(), NOW()),
(10, 'Investment', '📈', '#FD79A8', 'income', 1, NOW(), NOW());

-- Insert default accounts
INSERT IGNORE INTO accounts (id, name, type, balance, currency, user_id, created_at, updated_at) VALUES
(1, 'Checking Account', 'checking', 5000.00, 'USD', 1, NOW(), NOW()),
(2, 'Savings Account', 'savings', 15000.00, 'USD', 1, NOW(), NOW()),
(3, 'Credit Card', 'credit', 0.00, 'USD', 1, NOW(), NOW());

-- Insert sample budgets
INSERT IGNORE INTO budgets (id, name, amount, period, start_date, end_date, user_id, created_at, updated_at) VALUES
(1, 'Monthly Food Budget', 800.00, 'monthly', '2024-01-01', '2024-12-31', 1, NOW(), NOW()),
(2, 'Transportation Budget', 300.00, 'monthly', '2024-01-01', '2024-12-31', 1, NOW(), NOW()),
(3, 'Entertainment Budget', 200.00, 'monthly', '2024-01-01', '2024-12-31', 1, NOW(), NOW());