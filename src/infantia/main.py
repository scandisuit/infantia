"""Infantia — Privacy-first child health tracker. FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from infantia.api.auth import router as auth_router
from infantia.api.children import router as children_router
from infantia.api.diseases import router as diseases_router
from infantia.api.injuries import router as injuries_router
from infantia.api.medicines import router as medicines_router
from infantia.api.shares import router as shares_router
from infantia.api.vaccines import router as vaccines_router
from infantia.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables if they don't exist (dev mode)."""
    from infantia.database import Base, engine

    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Infantia",
    description="Privacy-first child health tracker — vaccines, diseases, injuries, and sharing.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow local dev + production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://infantia.rsol.io",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3456",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "https://sound-cylinder-admit-room.trycloudflare.com",
        "https://temperature-fit-upgrades-fri.trycloudflare.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(children_router)
app.include_router(vaccines_router)
app.include_router(diseases_router)
app.include_router(injuries_router)
app.include_router(medicines_router)
app.include_router(shares_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}