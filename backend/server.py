from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import time
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ============================================================
# TOKEN STATS  (DexScreener + Solana RPC top holders)
# ============================================================

_TOKEN_CACHE: dict = {}
_TOKEN_CACHE_TTL = 60  # seconds

_RPCS = [
    "https://solana-rpc.publicnode.com",
    "https://api.mainnet-beta.solana.com",
    "https://solana.public-rpc.com",
]

# Known pool / program / staking-contract addresses for $wiener so we can tag them.
# Anyone can extend this map; lookups fall back to the on-chain owner if not listed.
_KNOWN_POOLS = {
    "DSSA7dRkM2gTHxDVfTKwPvpVcqWP1G2gydLXd1twFWWh": "pumpswap pool",
    "kmDFwuqNeyeedPDvVqZiD3MR6jfvz8vcgAhidgYkhUb": "tibane staking",
}


def _fetch_dexscreener(mint: str):
    try:
        r = requests.get(
            f"https://api.dexscreener.com/latest/dex/tokens/{mint}",
            timeout=10,
            headers={"Accept": "application/json"},
        )
        if r.status_code != 200:
            return None
        d = r.json()
        if not d.get("pairs"):
            return None
        # Pick pair with highest liquidity
        pairs = sorted(
            d["pairs"],
            key=lambda p: (p.get("liquidity") or {}).get("usd", 0) or 0,
            reverse=True,
        )
        p = pairs[0]
        return {
            "priceUsd": float(p["priceUsd"]) if p.get("priceUsd") else None,
            "marketCap": p.get("marketCap"),
            "fdv": p.get("fdv"),
            "liquidityUsd": (p.get("liquidity") or {}).get("usd"),
            "volume24h": (p.get("volume") or {}).get("h24"),
            "priceChange24h": (p.get("priceChange") or {}).get("h24"),
            "txns24h": (p.get("txns") or {}).get("h24"),
            "pairAddress": p.get("pairAddress"),
            "dexId": p.get("dexId"),
        }
    except Exception as e:
        logger.error(f"dexscreener fetch failed: {e}")
        return None


def _rpc_call(rpc: str, payload: dict, timeout: int = 12):
    try:
        r = requests.post(rpc, json=payload, timeout=timeout)
    except Exception as e:
        logger.warning(f"_rpc_call {rpc} method={payload.get('method')} request err: {e}")
        return None
    if r.status_code != 200:
        logger.warning(
            f"_rpc_call {rpc} method={payload.get('method')} status={r.status_code} body={r.text[:200]}"
        )
        return None
    try:
        j = r.json()
    except Exception as e:
        logger.warning(f"_rpc_call {rpc} method={payload.get('method')} json err: {e}")
        return None
    if "error" in j:
        logger.warning(
            f"_rpc_call {rpc} method={payload.get('method')} rpc-err={j['error']}"
        )
        return None
    return j.get("result")


def _fetch_holders(mint: str):
    """Top 20 token accounts from Solana RPC, with owners resolved."""
    last_error = None
    for rpc in _RPCS:
        try:
            largest = _rpc_call(rpc, {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getTokenLargestAccounts",
                "params": [mint, {"commitment": "confirmed"}],
            })
            if not largest:
                last_error = f"{rpc}: getTokenLargestAccounts failed"
                continue
            top = (largest.get("value") or [])[:20]
            if not top:
                return {"holders": [], "totalHolders": 0}

            time.sleep(0.25)  # gentle pacing to avoid public-rpc rate limits

            supply = _rpc_call(rpc, {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "getTokenSupply",
                "params": [mint],
            })
            if not supply:
                last_error = f"{rpc}: getTokenSupply failed"
                continue
            supply_info = supply.get("value") or {}
            supply_amount = float(supply_info.get("amount", 0))
            decimals = int(supply_info.get("decimals", 0))

            time.sleep(0.25)

            account_addrs = [a["address"] for a in top]

            # Some public RPCs (publicnode) cap getMultipleAccounts at 10 per call.
            # Chunk to be safe.
            CHUNK = 10
            accounts: list = []
            multi_failed = False
            for ci in range(0, len(account_addrs), CHUNK):
                chunk = account_addrs[ci : ci + CHUNK]
                multi = _rpc_call(rpc, {
                    "jsonrpc": "2.0",
                    "id": 3 + ci,
                    "method": "getMultipleAccounts",
                    "params": [chunk, {"encoding": "jsonParsed"}],
                }, timeout=15)
                if not multi:
                    last_error = f"{rpc}: getMultipleAccounts failed (chunk {ci})"
                    logger.warning(last_error)
                    multi_failed = True
                    break
                accounts.extend(multi.get("value") or [])
                time.sleep(0.2)

            if multi_failed:
                continue

            holders = []
            for i, entry in enumerate(top):
                acc = accounts[i] if i < len(accounts) else None
                amt = float(entry.get("amount", 0))
                pct = (amt / supply_amount * 100) if supply_amount else 0
                ui_amount = entry.get("uiAmount")
                if ui_amount is None:
                    ui_amount = amt / (10 ** decimals) if decimals else amt

                owner = None
                if acc and isinstance(acc.get("data"), dict):
                    owner = (
                        acc["data"]
                        .get("parsed", {})
                        .get("info", {})
                        .get("owner")
                    )

                # Skip pool / bonding-curve / system accounts so we surface real holders
                BLACKLIST = {
                    "11111111111111111111111111111111",
                }
                if owner and owner in BLACKLIST:
                    continue

                pool_label = _KNOWN_POOLS.get(owner) if owner else None

                holders.append({
                    "rank": i + 1,
                    "tokenAccount": entry.get("address"),
                    "owner": owner or entry.get("address"),
                    "amount": ui_amount,
                    "ownedPercentage": pct,
                    # Tag known pools/programs (staking, AMM) so users see context
                    "isPool": pool_label is not None,
                    "poolLabel": pool_label,
                    # True if we couldn't resolve the wallet owner
                    "ownerResolved": owner is not None,
                })

            # Re-rank after potential filtering
            for i, h in enumerate(holders):
                h["rank"] = i + 1

            logger.info(f"holders fetched via {rpc}, count={len(holders)}")
            return {"holders": holders, "totalHolders": len(holders)}
        except Exception as e:
            last_error = f"{rpc}: {e}"
            logger.warning(last_error)
            continue
    logger.error(f"all RPCs failed for holder fetch. last error: {last_error}")
    return {"holders": [], "totalHolders": 0}


@api_router.get("/token-stats/{mint}")
async def get_token_stats(mint: str):
    if not mint or len(mint) < 30 or len(mint) > 60:
        raise HTTPException(status_code=400, detail="invalid mint address")

    now = time.time()
    cached = _TOKEN_CACHE.get(mint)
    if cached and now - cached["t"] < _TOKEN_CACHE_TTL:
        return cached["v"]

    market = _fetch_dexscreener(mint)
    holders_data = _fetch_holders(mint)

    result = {
        "mint": mint,
        "market": market,
        "holders": holders_data["holders"],
        "totalHolders": holders_data["totalHolders"],
        "fetchedAt": int(now),
    }
    _TOKEN_CACHE[mint] = {"t": now, "v": result}
    return result

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()