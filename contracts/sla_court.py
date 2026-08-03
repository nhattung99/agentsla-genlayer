# v0.2.16
from genlayer import *
import json

@allow_storage
@dataclass
class SLAAgreement:
    client: Address
    provider: Address
    task_description: str
    criteria: DynArray[str]
    payment_amount: bigint
    deadline: u256
    deliverable_urls: DynArray[str]
    reference_urls: DynArray[str]
    status: str  # "PENDING_DELIVERY" | "SUBMITTED" | "RESOLVED" | "BREACHED_LATE" | "DISPUTED"
    compliance_pct: u256
    verdict_reason: str
    confidence: u256
    dispute_evidence: DynArray[str]
    paid_out: bool

def _parse_verdict_json(raw_text: str) -> dict:
    """Helper to clean markdown fences and parse LLM JSON verdict."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if len(lines) >= 2:
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()
    try:
        data = json.loads(cleaned)
        if "compliance_pct" not in data or "confidence" not in data:
            raise UserError("LLM response missing compliance_pct or confidence keys")
        
        # Ensure values are within bounds
        compliance = int(data["compliance_pct"])
        confidence = int(data["confidence"])
        compliance = max(0, min(100, compliance))
        confidence = max(0, min(100, confidence))
        
        data["compliance_pct"] = compliance
        data["confidence"] = confidence
        return data
    except Exception as e:
        raise UserError(f"Failed to parse LLM adjudication JSON: {str(e)}")

class Contract(gl.Contract):
    agreements: TreeMap[str, SLAAgreement]
    agreement_counter: bigint
    treasury_address: Address
    reputation_address: Address
    owner: Address

    def __init__(self, owner: Address, treasury_address: Address, reputation_address: Address):
        self.owner = owner
        self.agreement_counter = bigint(0)
        self.treasury_address = treasury_address
        self.reputation_address = reputation_address

    @gl.public.write
    def set_config(self, treasury_address: Address, reputation_address: Address) -> None:
        if gl.message.sender != self.owner:
            raise UserError("Only owner can set contract configuration")
        self.treasury_address = treasury_address
        self.reputation_address = reputation_address

    @gl.public.write
    def create_agreement(
        self,
        provider: Address,
        task_description: str,
        criteria: DynArray[str],
        payment_amount: bigint,
        deadline: u256
    ) -> str:
        if len(criteria) == 0:
            raise UserError("SLA agreement must contain at least one criterion")
        if payment_amount <= bigint(0):
            raise UserError("Payment amount must be greater than zero")

        agreement_id = str(self.agreement_counter)
        self.agreement_counter = self.agreement_counter + bigint(1)

        empty_urls = DynArray[str]()
        empty_evidence = DynArray[str]()

        new_agreement = SLAAgreement(
            client=gl.message.sender,
            provider=provider,
            task_description=task_description,
            criteria=criteria,
            payment_amount=payment_amount,
            deadline=deadline,
            deliverable_urls=empty_urls,
            reference_urls=empty_urls,
            status="PENDING_DELIVERY",
            compliance_pct=u256(0),
            verdict_reason="",
            confidence=u256(0),
            dispute_evidence=empty_evidence,
            paid_out=False
        )

        self.agreements[agreement_id] = new_agreement

        # Deposit escrow to treasury contract
        if self.treasury_address != Address("0x0000000000000000000000000000000000000000"):
            gl.get_contract_at(self.treasury_address).deposit(agreement_id, payment_amount)

        return agreement_id

    @gl.public.write
    def submit_deliverable(
        self,
        agreement_id: str,
        deliverable_urls: DynArray[str],
        reference_urls: DynArray[str]
    ) -> None:
        if agreement_id not in self.agreements:
            raise UserError("Agreement ID does not exist")

        agreement = self.agreements[agreement_id]

        if agreement.status != "PENDING_DELIVERY":
            raise UserError(f"Agreement status is {agreement.status}, cannot submit deliverable")

        # Objective deadline check: if submitted past deadline, automatically mark BREACHED_LATE without LLM
        current_time = u256(gl.block.timestamp)
        if agreement.deadline > u256(0) and current_time > agreement.deadline:
            agreement.status = "BREACHED_LATE"
            agreement.compliance_pct = u256(0)
            agreement.verdict_reason = "Deliverable submitted past deadline (Objective SLA breach)"
            agreement.paid_out = True
            self.agreements[agreement_id] = agreement

            # Refund client via Treasury
            if self.treasury_address != Address("0x0000000000000000000000000000000000000000"):
                gl.get_contract_at(self.treasury_address).refund(agreement_id, agreement.client, agreement.payment_amount)

            # Record reputation
            if self.reputation_address != Address("0x0000000000000000000000000000000000000000"):
                gl.get_contract_at(self.reputation_address).record_sla_result(agreement.provider, u256(0))
            return

        if len(deliverable_urls) == 0:
            raise UserError("At least one deliverable URL is required")

        # Minimum 2 independent verification reference URLs required
        if len(reference_urls) < 2:
            raise UserError("At least 2 independent verification reference URLs are required")

        agreement.deliverable_urls = deliverable_urls
        agreement.reference_urls = reference_urls
        agreement.status = "SUBMITTED"
        self.agreements[agreement_id] = agreement

    @gl.public.write
    def submit_dispute_evidence(self, agreement_id: str, evidence_urls: DynArray[str]) -> None:
        if agreement_id not in self.agreements:
            raise UserError("Agreement ID does not exist")

        agreement = self.agreements[agreement_id]
        if agreement.status != "DISPUTED":
            raise UserError("Agreement is not in DISPUTED state")

        if gl.message.sender != agreement.provider:
            raise UserError("Only provider can submit supplementary evidence")

        new_evidence = agreement.dispute_evidence
        for url in evidence_urls:
            new_evidence.append(url)

        agreement.dispute_evidence = new_evidence
        self.agreements[agreement_id] = agreement

    @gl.public.write
    def resolve_agreement(self, agreement_id: str) -> None:
        if agreement_id not in self.agreements:
            raise UserError("Agreement ID does not exist")

        agreement = self.agreements[agreement_id]

        if agreement.status != "SUBMITTED" and agreement.status != "DISPUTED":
            raise UserError(f"Agreement status is {agreement.status}, cannot resolve")

        # Read state before non-deterministic execution
        task_desc = agreement.task_description
        criteria_list = list(agreement.criteria)
        deliv_urls = list(agreement.deliverable_urls)
        ref_urls = list(agreement.reference_urls)
        dispute_urls = list(agreement.dispute_evidence)

        # Leader evaluation logic
        def leader_fn() -> dict:
            deliverable_contents = [gl.nondet.web.render(u) for u in deliv_urls]
            reference_contents = [gl.nondet.web.render(u) for u in ref_urls]
            evidence_contents = [gl.nondet.web.render(u) for u in dispute_urls] if dispute_urls else []

            prompt = f"""You are a neutral, objective AI SLA (Service Level Agreement) Adjudicator on GenLayer.
Your task is to evaluate whether Provider (Agent B) has fulfilled the SLA criteria for Client (Agent A).

TASK DESCRIPTION:
"{task_desc}"

SLA CRITERIA:
{json.dumps(criteria_list)}

SUBMITTED DELIVERABLE OUTPUTS:
{json.dumps(deliverable_contents)}

INDEPENDENT VERIFICATION REFERENCE SOURCES (Must be prioritized over self-declared outputs):
{json.dumps(reference_contents)}

SUPPLEMENTARY DISPUTE EVIDENCE (If any):
{json.dumps(evidence_contents)}

INSTRUCTIONS:
1. Evaluate each criterion individually. Determine if it is fully MET, PARTIALLY MET, or NOT MET based on deliverable evidence.
2. CRITICAL PRINCIPLE: If provider deliverables contradict independent verification sources, prioritize the independent verification sources.
3. Calculate an overall compliance percentage (0 to 100).
4. Assign a confidence score (0 to 100) reflecting how verifiable and complete the provided evidence is.
5. Return ONLY a single raw JSON object (no markdown formatting, no code fences ```json):
{{
  "compliance_pct": <number 0-100>,
  "confidence": <number 0-100>,
  "criteria_evaluations": [
    {{"criterion": "<criterion text>", "status": "MET|PARTIAL|NOT_MET", "note": "<brief reason>"}}
  ],
  "reason": "<overall summary verdict>"
}}"""
            raw_response = gl.nondet.exec_prompt(prompt)
            return _parse_verdict_json(raw_response)

        # Validator consensus logic:
        # Note: We use a +/- 5% tolerance on compliance_pct continuously.
        # Reasoning text and criteria_evaluations details are ignored in validator comparison
        # to ensure high consensus convergence across independent AI node executions.
        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            try:
                my_res = leader_fn()
            except Exception:
                return False

            leader_pct = int(leader_res.value["compliance_pct"])
            validator_pct = int(my_res["compliance_pct"])
            return abs(validator_pct - leader_pct) <= 5

        verdict = gl.vm.run_nondet(leader_fn, validator_fn)

        compliance_pct = u256(verdict.get("compliance_pct", 0))
        confidence = u256(verdict.get("confidence", 0))
        reason = verdict.get("reason", "Adjudicated by GenLayer AI Consensus")

        # Format full verdict JSON string for UI criteria breakdown display
        verdict_str = json.dumps(verdict)

        # Low confidence (<60%) routes to DISPUTED status instead of premature payout
        if confidence < u256(60) and agreement.status != "DISPUTED":
            agreement.status = "DISPUTED"
            agreement.confidence = confidence
            agreement.compliance_pct = compliance_pct
            agreement.verdict_reason = verdict_str
            self.agreements[agreement_id] = agreement
            return

        # Finalize verdict
        agreement.status = "RESOLVED"
        agreement.compliance_pct = compliance_pct
        agreement.confidence = confidence
        agreement.verdict_reason = verdict_str
        agreement.paid_out = True
        self.agreements[agreement_id] = agreement

        # Calculate proportional payouts using bigint math
        # payout = payment * compliance_pct / 100
        payment = agreement.payment_amount
        payout_amount = (payment * bigint(compliance_pct)) // bigint(100)
        refund_amount = payment - payout_amount

        # Execute inter-contract Treasury calls
        if self.treasury_address != Address("0x0000000000000000000000000000000000000000"):
            if payout_amount > bigint(0):
                gl.get_contract_at(self.treasury_address).payout(agreement_id, agreement.provider, payout_amount)
            if refund_amount > bigint(0):
                gl.get_contract_at(self.treasury_address).refund(agreement_id, agreement.client, refund_amount)

        # Update Reputation scores for both provider and client
        if self.reputation_address != Address("0x0000000000000000000000000000000000000000"):
            gl.get_contract_at(self.reputation_address).record_sla_result(agreement.provider, compliance_pct)
            gl.get_contract_at(self.reputation_address).record_sla_result(agreement.client, compliance_pct)

    @gl.public.write
    def client_accept_disputed_verdict(self, agreement_id: str) -> None:
        if agreement_id not in self.agreements:
            raise UserError("Agreement ID does not exist")

        agreement = self.agreements[agreement_id]
        if agreement.status != "DISPUTED":
            raise UserError("Agreement is not in DISPUTED state")

        if gl.message.sender != agreement.client:
            raise UserError("Only client can force accept disputed verdict")

        agreement.status = "RESOLVED"
        agreement.paid_out = True
        self.agreements[agreement_id] = agreement

        payment = agreement.payment_amount
        compliance_pct = agreement.compliance_pct
        payout_amount = (payment * bigint(compliance_pct)) // bigint(100)
        refund_amount = payment - payout_amount

        if self.treasury_address != Address("0x0000000000000000000000000000000000000000"):
            if payout_amount > bigint(0):
                gl.get_contract_at(self.treasury_address).payout(agreement_id, agreement.provider, payout_amount)
            if refund_amount > bigint(0):
                gl.get_contract_at(self.treasury_address).refund(agreement_id, agreement.client, refund_amount)

        if self.reputation_address != Address("0x0000000000000000000000000000000000000000"):
            gl.get_contract_at(self.reputation_address).record_sla_result(agreement.provider, compliance_pct)
            gl.get_contract_at(self.reputation_address).record_sla_result(agreement.client, compliance_pct)

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> SLAAgreement:
        if agreement_id not in self.agreements:
            raise UserError("Agreement ID does not exist")
        return self.agreements[agreement_id]

    @gl.public.view
    def get_agreement_count(self) -> bigint:
        return self.agreement_counter
