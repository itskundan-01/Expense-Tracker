-- Initialize expense_tracker database

-- Grant proper privileges to expenseuser for all host connections
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expenseuser'@'%';
FLUSH PRIVILEGES;

-- This file can be used to add initial data after Spring Boot creates the tables
-- For now, tables will be auto-created by Spring Boot JPA with ddl-auto=update

-- Note: Sample data can be added here once the application creates the initial schema
-- The DataLoader component in Spring Boot will handle initial data population