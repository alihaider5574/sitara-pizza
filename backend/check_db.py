import asyncio, asyncpg, os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv('DATABASE_URL').replace('?channel_binding=disable', '')
    conn = await asyncpg.connect(db_url)
    rows = await conn.fetch('SELECT id, full_name, email, role FROM profiles')
    print("PROFILES:")
    for r in rows:
        print(dict(r))
    
    rows = await conn.fetch('SELECT id, user_id, status FROM orders')
    print("ORDERS:")
    for r in rows:
        print(dict(r))
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
