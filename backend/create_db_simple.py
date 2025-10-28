#!/usr/bin/env python3
"""
Create SQLite database file and tables using passlib for password hashing.
"""

import sqlite3
import os
from datetime import datetime
from passlib.context import CryptContext

# Use same context as the app
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password: str) -> str:
    """Hash password using passlib (same as the app)."""
    return pwd_context.hash(password)

def create_database():
    """Create SQLite database and tables."""
    db_path = "audit_automation.db"
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    # Create new database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            firstname VARCHAR(255) NOT NULL,
            lastname VARCHAR(255) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user' NOT NULL,
            is_active BOOLEAN DEFAULT 1 NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )
    ''')
    
    # Create refresh_tokens table
    cursor.execute('''
        CREATE TABLE refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token VARCHAR(255) NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX idx_users_email ON users(email)')
    cursor.execute('CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token)')
    cursor.execute('CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)')
    
    # Insert admin user
    admin_password = hash_password("admin123")
    cursor.execute('''
        INSERT INTO users (email, firstname, lastname, hashed_password, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ("admin@example.com", "Admin", "User", admin_password, "admin", 1))
    
    # Insert a test regular user
    user_password = hash_password("user123")
    cursor.execute('''
        INSERT INTO users (email, firstname, lastname, hashed_password, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ("user@example.com", "Test", "User", user_password, "user", 1))
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database created successfully: {os.path.abspath(db_path)}")
    print("✅ Admin user: admin@example.com / admin123")
    print("✅ Test user: user@example.com / user123")
    print("\nYou can now start your FastAPI server!")

if __name__ == "__main__":
    create_database()