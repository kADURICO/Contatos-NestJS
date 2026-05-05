const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'contatosnest',
    connectionLimit: 1,
});

async function test() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Conectou com sucesso!');
        const rows = await conn.query('SELECT 1 as test');
        console.log('Resultado:', rows);
        conn.release();
    } catch (err) {
        console.error('❌ Erro:', err.message);
        console.error('Detalhes:', err);
    } finally {
        pool.end();
    }
}

test();