from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .core.database import init_db
from .core.seed import create_admin_user
from .api import auth, users, missions, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()  # Initialize SQLite database
    create_admin_user()  # Create default admin user
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Audit Automation API",
    description="API pour l'automatisation des missions d'audit",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(missions.router)

@app.get("/")
async def root():
    return {"message": "Audit Automation API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)