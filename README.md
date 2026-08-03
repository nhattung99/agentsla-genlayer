# AgentSLA — Intelligent SLA Adjudication Platform for the Agentic Economy

> **One-Line Pitch:**  
> *"AgentSLA dies without GenLayer: no EVM smart contract can read and evaluate whether an AI agent actually fulfilled its quality commitments, and no human arbiter can match the speed of the agent-to-agent economy — only GenLayer's decentralized AI consensus can scale real-time SLA adjudication."*

---

## Deployed Contract (`studionet`)
- **SLACourt Address:** `0x7fab008Bb711E3e8eF7d34182D1A235f63407E8f`
- **GenLayer Explorer Link:** [https://genlayer-explorer.vercel.app/address/0x7fab008Bb711E3e8eF7d34182D1A235f63407E8f](https://genlayer-explorer.vercel.app/address/0x7fab008Bb711E3e8eF7d34182D1A235f63407E8f)
- **Treasury Address:** `0x3FE2E18a4B139520A68E4236A5da58A32B0aAadB`
- **Reputation Address:** `0xB3814Ec61b8662cAC514f9dEFf4b938C08E89cF7`

---

## Live App
- **Live Production Application:** (Updating after Vercel deployment)

---

## 1. Problem & Solution

### The Challenge in the AI Agent Economy
As autonomous AI agents transact with one another (Agent A hiring Agent B for content creation, data pipelines, code reviews, automated research), traditional smart contracts fail to evaluate quality. EVM contracts can only verify rigid objective conditions (e.g. timestamp deadlines), but cannot evaluate subjective work quality or verify whether deliverables satisfy complex SLA criteria. Human arbiters cannot scale to 24/7 high-frequency agentic transactions.

### The GenLayer Solution
**AgentSLA** acts as a neutral, decentralized "SLA Court" on GenLayer:
1. **Client Agent (or Hirer)** initializes an SLA agreement specifying task descriptions, escrow funding, deadlines, and a list of specific quality criteria.
2. **Provider Agent** submits deliverable outputs alongside mandatory independent verification reference links (e.g. third-party CI/CD build outputs, automated test suite reports).
3. **GenLayer Non-Deterministic AI Consensus** (`gl.vm.run_nondet`) fetches both deliverables and independent verification sources, assesses criteria compliance, continuous scoring tolerance (±5%), and outputs an overall compliance percentage (0–100%).
4. **Proportional Escrow Payouts** are executed automatically:
   $$\text{Payout}_{\text{provider}} = \frac{\text{Payment} \times \text{Compliance}_{\%}}{100}$$
   $$\text{Refund}_{\text{client}} = \text{Payment} - \text{Payout}_{\text{provider}}$$

---

## 2. System Architecture (3 Intercontract Suite)

```
                       +------------------------+
                       |    Client / Provider   |
                       +-----------+------------+
                                   |
                                   v
                       +------------------------+
                       |        SLACourt        |
                       | (Adjudication & State) |
                       +----+--------------+----+
                            |              |
           Intercontract    |              | Intercontract
           payout / refund  v              v reputation record
                     +------+---+      +---+------+
                     | Treasury |      |Reputation|
                     +----------+      +----------+
```

| Contract | File | Primary Responsibility |
|---|---|---|
| **`SLACourt`** | [`contracts/sla_court.py`](contracts/sla_court.py) | SLA agreement lifecycle, non-det consensus evaluation, continuous compliance scoring, dispute routing, and edge-case protection. |
| **`Treasury`** | [`contracts/treasury.py`](contracts/treasury.py) | Escrow vault restricting deposit, payout, and refund execution exclusively to authorized calls from `SLACourt`. |
| **`Reputation`** | [`contracts/reputation.py`](contracts/reputation.py) | Historical reliability ledger tracking cumulative completion counts and average compliance scores for agents. |

---

## 3. Consensus Adjudication & Continuous Tolerance

Leader & validator consensus in `SLACourt` uses GenLayer's non-deterministic framework:
```python
def validator_fn(leader_res) -> bool:
    leader_val_dict = getattr(leader_res, 'value', leader_res)
    if not isinstance(leader_val_dict, dict) or "compliance_pct" not in leader_val_dict:
        return False
    try:
        my_res = leader_fn()
    except Exception:
        return False
    # Continuous compliance tolerance check (±5%) ignoring freeform reasoning text
    return abs(my_res["compliance_pct"] - leader_val_dict["compliance_pct"]) <= 5
```

> **Why ±5% Continuous Tolerance?**  
> SLA quality assessment is continuous (0–100%) rather than binary. Independent LLM node executions on identical deliverables converge on overall quality within minor margin variations. Comparing compliance percentages with a ±5% tolerance ensures high validator consensus without consensus deadlocks over natural language phrasing differences.

---

## 4. Engineering & Test Suite

### Run Unit Tests (`gltest`)
To execute the automated contract unit test suite:
```bash
python -m unittest tests/test_sla_court.py
```

### Edge Cases Handled:
- Objective deadline breach: Submitting past deadline automatically marks `BREACHED_LATE` (compliance = 0, full refund to client) without calling LLM.
- Independent reference enforcement: Minimum 2 independent reference links required upon submission to prevent self-declaration bias.
- Low-confidence dispute routing: Scores with `confidence < 60%` transition to `DISPUTED` status for supplementary evidence submission.
- JSON parsing safety: Automatic markdown code fence removal (` ```json `) and fallback validation.
- Double-resolution & double-claim protection.

---

## 5. Frontend Web Application

The frontend is built with React + Vite + `genlayer-js` using standard `studionet` network integration.

### Local Development Setup
```bash
cd frontend
npm install
npm run dev
```

### Production Build Verification
```bash
cd frontend
npm run build
```
