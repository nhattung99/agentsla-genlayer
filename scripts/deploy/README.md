# GenLayer Studio Deployment Guide — AgentSLA (`studionet`)

Follow these steps to deploy the 3 AgentSLA contracts on **GenLayer Studio** (`https://studio.genlayer.com`) using the `studionet` network.

---

## Deployment Steps

### Step 1: Deploy `Treasury` Escrow Contract
1. In GenLayer Studio, create a new contract named `Treasury`.
2. Copy the contents of [`contracts/treasury.py`](../../contracts/treasury.py).
3. In the constructor parameters, set `owner` to your Studio account address.
4. Click **Deploy** and confirm transaction on `studionet`.
5. Copy the deployed contract address:
   `TREASURY_ADDRESS = "0x..."`

### Step 2: Deploy `Reputation` Ledger Contract
1. Create a new contract named `Reputation`.
2. Copy the contents of [`contracts/reputation.py`](../../contracts/reputation.py).
3. In the constructor parameters, set `owner` to your Studio account address.
4. Click **Deploy** and confirm transaction on `studionet`.
5. Copy the deployed contract address:
   `REPUTATION_ADDRESS = "0x..."`

### Step 3: Deploy `SLACourt` Adjudication Contract
1. Create a new contract named `SLACourt`.
2. Copy the contents of [`contracts/sla_court.py`](../../contracts/sla_court.py).
3. Set constructor parameters:
   - `owner`: Your wallet address
   - `treasury_address`: `TREASURY_ADDRESS` (from Step 1)
   - `reputation_address`: `REPUTATION_ADDRESS` (from Step 2)
4. Click **Deploy** and confirm transaction on `studionet`.
5. Copy the deployed contract address:
   `SLA_COURT_ADDRESS = "0x..."`

### Step 4: Authorize `SLACourt` in `Treasury` and `Reputation`
1. Open the deployed `Treasury` contract instance in Studio.
2. Execute write method `set_court_address(court_address: SLA_COURT_ADDRESS)`.
3. Open the deployed `Reputation` contract instance in Studio.
4. Execute write method `set_court_address(court_address: SLA_COURT_ADDRESS)`.

---

## Deployed Contract Registry (`studionet`)

Once deployed with `Result: SUCCESS`, record the addresses below for frontend integration:

```env
VITE_CONTRACT_SLA_COURT=0x...
VITE_CONTRACT_TREASURY=0x...
VITE_CONTRACT_REPUTATION=0x...
```
