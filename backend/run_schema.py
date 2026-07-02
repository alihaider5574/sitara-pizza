import asyncio
import asyncpg
import sys

# Extract DB URL from args
if len(sys.argv) < 2:
    print("Usage: python run_schema.py <db_url>")
    sys.exit(1)

db_url = sys.argv[1]

# Strip channel_binding if present (asyncpg doesn't support it)
if "channel_binding" in db_url:
    parts = db_url.split("?")
    if len(parts) == 2:
        params = [p for p in parts[1].split("&") if not p.startswith("channel_binding")]
        db_url = parts[0] + ("?" + "&".join(params) if params else "")

async def main():
    try:
        # Read schema
        with open("schema.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()

        # Connect
        print("Connecting to database...")
        conn = await asyncpg.connect(db_url)
        print("Connected. Running schema...")

        # Execute
        await conn.execute(schema_sql)
        print("Schema successfully applied!")
        
        await conn.close()
    except Exception as e:
        print(f"Error running schema: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
