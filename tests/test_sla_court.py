# GenLayer gltest Test Suite for AgentSLA
import unittest
import json
import sys
from types import ModuleType

# Setup genlayer mock module before importing contract
if 'genlayer' not in sys.modules:
    genlayer_mock = ModuleType('genlayer')
    class UserError(Exception): pass
    class Address(str): pass
    class bigint(int): pass
    class u256(int): pass
    class DynArray(list): pass
    class TreeMap(dict): pass
    
    def allow_storage(cls): return cls
    def dataclass(cls): return cls

    genlayer_mock.UserError = UserError
    genlayer_mock.Address = Address
    genlayer_mock.bigint = bigint
    genlayer_mock.u256 = u256
    genlayer_mock.DynArray = DynArray
    genlayer_mock.TreeMap = TreeMap
    genlayer_mock.allow_storage = allow_storage
    genlayer_mock.dataclass = dataclass

    gl_mock = ModuleType('gl')
    class Contract: pass
    public_mock = ModuleType('public')
    def view_dec(func): return func
    def write_dec(func): return func
    public_mock.view = view_dec
    public_mock.write = write_dec

    gl_mock.Contract = Contract
    gl_mock.public = public_mock
    genlayer_mock.gl = gl_mock

    sys.modules['genlayer'] = genlayer_mock

class TestAgentSLACourt(unittest.TestCase):
    def setUp(self):
        self.client_addr = "0x1111111111111111111111111111111111111111"
        self.provider_addr = "0x2222222222222222222222222222222222222222"

    def test_verdict_json_parsing_valid(self):
        from contracts.sla_court import _parse_verdict_json
        valid_json = """```json
{
  "compliance_pct": 85,
  "confidence": 92,
  "criteria_evaluations": [
    {"criterion": "Length > 1000 words", "status": "MET", "note": "1250 words delivered"}
  ],
  "reason": "SLA criteria satisfied with minor style variations"
}
```"""
        parsed = _parse_verdict_json(valid_json)
        self.assertEqual(parsed["compliance_pct"], 85)
        self.assertEqual(parsed["confidence"], 92)
        self.assertEqual(len(parsed["criteria_evaluations"]), 1)

    def test_verdict_json_parsing_malformed(self):
        from contracts.sla_court import _parse_verdict_json
        malformed = "Invalid json text without required keys"
        with self.assertRaises(Exception):
            _parse_verdict_json(malformed)

    def test_payout_math_calculation(self):
        payment = 1000
        compliance_pct = 85
        payout = (payment * compliance_pct) // 100
        refund = payment - payout
        self.assertEqual(payout, 850)
        self.assertEqual(refund, 150)

    def test_consensus_tolerance_check(self):
        leader_res = {"compliance_pct": 80, "confidence": 90, "reason": "Leader opinion"}
        validator_res = {"compliance_pct": 84, "confidence": 88, "reason": "Validator opinion with different wording"}

        # Continuous compliance tolerance check: abs(84 - 80) <= 5 -> True
        tolerance_pass = abs(validator_res["compliance_pct"] - leader_res["compliance_pct"]) <= 5
        self.assertTrue(tolerance_pass)

        validator_fail = {"compliance_pct": 72, "confidence": 88, "reason": "Divergent score"}
        tolerance_fail = abs(validator_fail["compliance_pct"] - leader_res["compliance_pct"]) <= 5
        self.assertFalse(tolerance_fail)

if __name__ == "__main__":
    unittest.main()
