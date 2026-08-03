# v0.2.16
# {
#   "Seq": [
#     { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
#   ]
# }

from dataclasses import dataclass
from genlayer import *

class Treasury(gl.Contract):
    balances: TreeMap[str, bigint]
    court_address: Address
    owner: Address

    def __init__(self):
        self.owner = Address("0x0000000000000000000000000000000000000000")
        self.court_address = Address("0x0000000000000000000000000000000000000000")

    @gl.public.write
    def set_court_address(self, court_address: Address) -> None:
        if self.owner == Address("0x0000000000000000000000000000000000000000"):
            self.owner = gl.message.sender
        elif gl.message.sender != self.owner:
            raise UserError("Only owner can set court address")
        self.court_address = court_address

    @gl.public.write
    def deposit(self, agreement_id: str, amount: bigint) -> None:
        dep_val = gl.message.value if gl.message.value > bigint(0) else amount
        if dep_val <= bigint(0):
            raise UserError("Deposit amount must be greater than zero")
        current_bal = self.balances.get(agreement_id, bigint(0))
        self.balances[agreement_id] = current_bal + dep_val

    @gl.public.write
    def payout(self, agreement_id: str, recipient: Address, amount: bigint) -> None:
        if gl.message.sender != self.court_address and gl.message.sender != self.owner:
            raise UserError("Only authorized SLA court can trigger payout")
        current_bal = self.balances.get(agreement_id, bigint(0))
        if amount > current_bal:
            raise UserError("Payout amount exceeds escrow balance")
        self.balances[agreement_id] = current_bal - amount
        gl.transfer(recipient, amount)

    @gl.public.write
    def refund(self, agreement_id: str, recipient: Address, amount: bigint) -> None:
        if gl.message.sender != self.court_address and gl.message.sender != self.owner:
            raise UserError("Only authorized SLA court can trigger refund")
        current_bal = self.balances.get(agreement_id, bigint(0))
        if amount > current_bal:
            raise UserError("Refund amount exceeds escrow balance")
        self.balances[agreement_id] = current_bal - amount
        gl.transfer(recipient, amount)

    @gl.public.view
    def get_escrow_balance(self, agreement_id: str) -> str:
        if agreement_id not in self.balances:
            return "0"
        return str(self.balances[agreement_id])
