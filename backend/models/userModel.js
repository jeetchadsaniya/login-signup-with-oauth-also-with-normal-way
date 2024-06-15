const createUserTable = (connection) => {
    const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(30) NOT NULL,
            email VARCHAR(30) NOT NULL UNIQUE,
            password VARCHAR(30) NOT NULL,
            is_password_change BOOLEAN DEFAULT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

    connection.query(createUserTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating user table:', err.message);
            return;
        }
        console.log('User table created or already exists');
    });
};

module.exports = {
    createUserTable
}