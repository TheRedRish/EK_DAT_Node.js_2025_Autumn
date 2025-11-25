import db from '../connection.js';

export function getUserByEmail(email) {
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

export function getUserById(id) {
    return db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
}

export function createUser(email, passwordHash) {
    return db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]).then(({ lastID }) => ({ id: lastID, email }));
}

export function updateUserPassword(email, passwordHash) {
    return db.run('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);
}
