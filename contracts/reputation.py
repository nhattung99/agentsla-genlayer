# v0.2.16
# {
#   "Seq": [
#     { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
#   ]
# }

from dataclasses import dataclass
from genlayer import *

@allow_storage
@dataclass
class AgentStats:
    total_slas: u256
    total_compliance: u256
    avg_compliance: u256

class Reputation(gl.Contract):
    stats: TreeMap[str, AgentStats]
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
    def record_sla_result(self, agent: Address, compliance_pct: u256) -> None:
        if gl.message.sender != self.court_address and gl.message.sender != self.owner:
            raise UserError("Only authorized SLA court can update reputation")
        agent_key = str(agent)
        existing = self.stats.get(agent_key, AgentStats(u256(0), u256(0), u256(0)))
        new_total = existing.total_slas + u256(1)
        new_compliance = existing.total_compliance + compliance_pct
        new_avg = new_compliance // new_total
        self.stats[agent_key] = AgentStats(new_total, new_compliance, new_avg)

    @gl.public.view
    def get_agent_reputation(self, agent: Address) -> u256:
        agent_key = str(agent)
        if agent_key in self.stats:
            return self.stats[agent_key].avg_compliance
        return u256(100)

    @gl.public.view
    def get_agent_stats(self, agent: Address) -> dict:
        agent_key = str(agent)
        if agent_key not in self.stats:
            return {
                "total_slas": 0,
                "total_compliance": 0,
                "avg_compliance": 100
            }
        st = self.stats[agent_key]
        return {
            "total_slas": int(st.total_slas),
            "total_compliance": int(st.total_compliance),
            "avg_compliance": int(st.avg_compliance)
        }
