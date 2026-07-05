import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()
async def run():
    db_url = os.getenv('DATABASE_URL').replace('?channel_binding=disable', '')
    conn = await asyncpg.connect(db_url)
    rows = await conn.fetch("SELECT id, user_id FROM orders ORDER BY created_at DESC LIMIT 5")
    for r in rows: print(dict(r))
    await conn.close()
asyncio.run(run())
