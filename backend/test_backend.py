import sys
sys.path.append('/home/ubuntu/ai_agents_monitoring/backend')

try:
    from app.main import app
    print("✅ Backend imports successfully")
    
    # Test database connection
    from app.core.database import engine, Base
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    
    print("✅ Backend is ready to run")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
