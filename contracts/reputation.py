# v0.2.16
from genlayer import *

@allow_storage
@dataclass
class AgentStats:
    total_slas: u256
    total_compliance: u256
    avg_compliance: u256

class Contract(gl.Contract):
    stats: TreeMap[str, AgentStats]
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
    def record_sla_result(self, agent: Address, compliance_pct: u256) -> None:
        if gl.message.sender != self.court_address:
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
    def get_agent_stats(self, agent: Address) -> AgentStats:
        agent_key = str(agent)
        return self.stats.get(agent_key, AgentStats(u256(0), u256(0), u256(100)))
