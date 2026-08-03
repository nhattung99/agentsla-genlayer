# v0.2.16
from genlayer import *

class Contract(gl.Contract):
    balances: TreeMap[str, bigint]
    court_address: Address
    owner: Address

    def __init__(self, owner: Address):
        self.owner = owner
        self.court_address = Address("0x0000000000000000000000000000000000000000")

    @gl.public.write
    def set_court_address(self, court_address: Address) -> None:
        if gl.message.sender != self.owner and self.court_address != Address("0x0000000000000000000000000000000000000000"):
            raise UserError("Only owner or initial setup can set court address")
        self.court_address = court_address

    @gl.public.write
    def deposit(self, agreement_id: str, amount: bigint) -> None:
        if amount <= bigint(0):
            raise UserError("Deposit amount must be greater than zero")
        current_bal = self.balances.get(agreement_id, bigint(0))
        self.balances[agreement_id] = current_bal + amount

    @gl.public.write
    def payout(self, agreement_id: str, recipient: Address, amount: bigint) -> None:
        if gl.message.sender != self.court_address:
            raise UserError("Only authorized SLA court can trigger payout")
        current_bal = self.balances.get(agreement_id, bigint(0))
        if amount > current_bal:
            raise UserError("Payout amount exceeds escrow balance")
        self.balances[agreement_id] = current_bal - amount

    @gl.public.write
    def refund(self, agreement_id: str, recipient: Address, amount: bigint) -> None:
        if gl.message.sender != self.court_address:
            raise UserError("Only authorized SLA court can trigger refund")
        current_bal = self.balances.get(agreement_id, bigint(0))
        if amount > current_bal:
            raise UserError("Refund amount exceeds escrow balance")
        self.balances[agreement_id] = current_bal - amount

    @gl.public.view
    def get_escrow_balance(self, agreement_id: str) -> bigint:
        return self.balances.get(agreement_id, bigint(0))
