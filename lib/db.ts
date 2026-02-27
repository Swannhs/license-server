import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

const dbPath = './licenses.db';

export const getDb = async (): Promise<Database> => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
};

export const initDb = async () => {
    const db = await getDb();
    return new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                key TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                reject(err);
            } else {
                console.log('Table "licenses" ready');
                resolve();
            }
            db.close();
        });
    });
};

export const addLicense = async (username: string, key: string) => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO licenses (username, key) VALUES (?, ?)',
            [username, key],
            function (this: sqlite3.RunResult, err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username, key });
                }
                db.close();
            }
        );
    });
};

export const getLicense = async (username: string) => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT key FROM licenses WHERE username = ?',
            [username],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
                db.close();
            }
        );
    });
};

export const getAllLicenses = async () => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM licenses ORDER BY id DESC',
            [],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
                db.close();
            }
        );
    });
};

export const deleteLicense = async (id: number) => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        db.run(
            'DELETE FROM licenses WHERE id = ?',
            [id],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true });
                }
                db.close();
            }
        );
    });
};
