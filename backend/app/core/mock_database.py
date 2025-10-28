import os
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

USE_MOCK = settings.USE_MOCK_DB

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    if USE_MOCK:
        # Utiliser une base de données en mémoire pour les tests
        print("Using in-memory mock database")
        # Simuler une connexion sans réelle base MongoDB
        db.client = None  # Mock client
        db.db = MockDatabase()
    else:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.db = db.client[settings.DATABASE_NAME]
        print("Connected to MongoDB")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

# Mock Database simple pour les tests
class MockDatabase:
    def __init__(self):
        self.collections = {}
    
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]
    
    def __getattr__(self, name):
        return self[name]

class MockCollection:
    def __init__(self):
        self.documents = []
        self._id_counter = 0
    
    async def insert_one(self, document):
        from bson import ObjectId
        doc = document.copy()
        doc["_id"] = ObjectId()
        self.documents.append(doc)
        return type('obj', (object,), {'inserted_id': doc["_id"]})
    
    async def find_one(self, filter_dict):
        for doc in self.documents:
            if "_id" in filter_dict and doc.get("_id") == filter_dict["_id"]:
                return doc
        return None
    
    def find(self, filter_dict=None):
        """Return a mock cursor"""
        if filter_dict is None:
            filter_dict = {}
        
        # Filter documents based on filter_dict
        results = []
        for doc in self.documents:
            if not filter_dict:
                results.append(doc)
            else:
                match = True
                for key, value in filter_dict.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    results.append(doc)
        
        return MockCursor(results)
    
    async def update_one(self, filter_dict, update_dict):
        for doc in self.documents:
            if "_id" in filter_dict and doc.get("_id") == filter_dict["_id"]:
                if "$set" in update_dict:
                    doc.update(update_dict["$set"])
                if "$push" in update_dict:
                    for key, value in update_dict["$push"].items():
                        if key not in doc:
                            doc[key] = []
                        doc[key].append(value)
                return type('obj', (object,), {'modified_count': 1})
        return type('obj', (object,), {'modified_count': 0})

class MockCursor:
    """Mock cursor for find operations"""
    def __init__(self, documents):
        self.documents = documents
    
    async def to_list(self, length):
        """Convert cursor to list"""
        if length is None:
            return self.documents
        return self.documents[:length]