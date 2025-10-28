from sqlalchemy.orm import Session
from .database import SessionLocal
from .auth import get_password_hash
from ..models.user import User

def create_admin_user():
    """Create a default admin user if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        
        if not admin_user:
            # Create admin user
            admin_user = User(
                email="admin@example.com",
                firstname="Admin",
                lastname="User",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created: admin@example.com / admin123")
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()