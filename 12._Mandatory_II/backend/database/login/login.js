import db from '../connection.js';

export function recordLoginEvent(userId, type) {
    db.run('INSERT INTO login_events (user_id, type) VALUES (?, ?)', [userId, type]);
}