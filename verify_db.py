from backend.database import engine
from sqlalchemy import text

def verify_column():
    with engine.connect() as conn:
        print("Checking recruiters table schema...")
        result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='recruiters';"))
        columns = result.fetchall()
        for col in columns:
            print(f"- {col[0]}: {col[1]}")
        
        has_role = any(col[0] == 'role' for col in columns)
        if has_role:
            print("\nSUCCESS: 'role' column exists.")
        else:
            print("\nFAILURE: 'role' column NOT found.")

if __name__ == "__main__":
    verify_column()
