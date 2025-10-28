#!/usr/bin/env python3
"""
Initialize the SQLite database and create tables.
Run this script to set up the database before starting the server.
"""

import os
import sys

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import init_db, engine
from app.core.seed import create_admin_user
from app.models.user import User, RefreshToken

def main():
    """Initialize database and create admin user."""
    print("Initializing SQLite database...")
    
    # Create all tables
    init_db()
    print("✅ Database tables created successfully!")
    
    # Create admin user
    print("Creating admin user...")
    create_admin_user()
    print("✅ Admin user setup complete!")
    
    # Show database file location
    db_file = "audit_automation.db"
    if os.path.exists(db_file):
        print(f"✅ Database file created at: {os.path.abspath(db_file)}")
    else:
        print("⚠️  Database file not found, but tables should be created when app starts")

if __name__ == "__main__":
    main()