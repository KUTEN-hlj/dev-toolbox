from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers import auth, tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时自动建表
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="DevToolbox API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tools.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
