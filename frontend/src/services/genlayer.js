import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

export const CONTRACT_ADDRESSES = {
  slaCourt: import.meta.env.VITE_CONTRACT_ADDRESS || import.meta.env.VITE_CONTRACT_SLA_COURT || '0x7fab008Bb711E3e8eF7d34182D1A235f63407E8f',
  treasury: import.meta.env.VITE_CONTRACT_TREASURY || '0x3FE2E18a4B139520A68E4236A5da58A32B0aAadB',
  reputation: import.meta.env.VITE_CONTRACT_REPUTATION || '0xB3814Ec61b8662cAC514f9dEFf4b938C08E89cF7'
};

export function isContractConfigured() {
  return Boolean(CONTRACT_ADDRESSES.slaCourt && CONTRACT_ADDRESSES.slaCourt.startsWith('0x'));
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask or Web3 Wallet not detected in browser');
  }

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const userAddress = accounts[0];

  // Auto-switch / add studionet network
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${studionet.id.toString(16)}` }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${studionet.id.toString(16)}`,
          chainName: studionet.name,
          rpcUrls: [studionet.rpcUrls.default.http[0]],
          nativeCurrency: studionet.nativeCurrency
        }]
      });
    }
  }

  const client = createClient({
    chain: studionet,
    account: userAddress
  });

  return { userAddress, client };
}

// Write Contract functions triggering MetaMask transaction signature prompt
export async function createAgreementContract(client, { provider, task_description, criteria, payment_amount, deadline }) {
  if (!client) throw new Error('Please connect your MetaMask wallet first.');
  
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESSES.slaCourt,
    functionName: 'create_agreement',
    args: [provider, task_description, criteria, BigInt(payment_amount), BigInt(deadline)],
    value: BigInt(payment_amount)
  });

  if (client.waitForTransactionReceipt) {
    await client.waitForTransactionReceipt({ hash: txHash });
  }
  return txHash;
}

export async function submitDeliverableContract(client, { agreement_id, deliverable_urls, reference_urls }) {
  if (!client) throw new Error('Please connect your MetaMask wallet first.');

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESSES.slaCourt,
    functionName: 'submit_deliverable',
    args: [agreement_id, deliverable_urls, reference_urls]
  });

  if (client.waitForTransactionReceipt) {
    await client.waitForTransactionReceipt({ hash: txHash });
  }
  return txHash;
}

export async function resolveAgreementContract(client, agreement_id) {
  if (!client) throw new Error('Please connect your MetaMask wallet first.');

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESSES.slaCourt,
    functionName: 'resolve_agreement',
    args: [agreement_id]
  });

  if (client.waitForTransactionReceipt) {
    await client.waitForTransactionReceipt({ hash: txHash });
  }
  return txHash;
}

export async function submitDisputeEvidenceContract(client, agreement_id, evidence_urls) {
  if (!client) throw new Error('Please connect your MetaMask wallet first.');

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESSES.slaCourt,
    functionName: 'submit_dispute_evidence',
    args: [agreement_id, evidence_urls]
  });

  if (client.waitForTransactionReceipt) {
    await client.waitForTransactionReceipt({ hash: txHash });
  }
  return txHash;
}

export async function acceptDisputedVerdictContract(client, agreement_id) {
  if (!client) throw new Error('Please connect your MetaMask wallet first.');

  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESSES.slaCourt,
    functionName: 'client_accept_disputed_verdict',
    args: [agreement_id]
  });

  if (client.waitForTransactionReceipt) {
    await client.waitForTransactionReceipt({ hash: txHash });
  }
  return txHash;
}

// Sample fallback SLA dataset when contract is unconfigured or reading offline
export const SAMPLE_AGREEMENTS = [
  {
    id: "0",
    client: "0x1111111111111111111111111111111111111111",
    provider: "0x2222222222222222222222222222222222222222",
    task_description: "Write comprehensive technical documentation for GenLayer SDK with code snippets and architecture diagrams",
    criteria: [
      "Must cover client creation and non-det consensus APIs",
      "Documentation length must exceed 2,000 words",
      "Include at least 3 runnable code examples",
      "Provide architecture flowchart diagram"
    ],
    payment_amount: "5000000000000000000",
    deadline: Math.floor(Date.now() / 1000) + 86400,
    deliverable_urls: ["https://github.com/agent-b/genlayer-docs-pr"],
    reference_urls: ["https://ci.genlayer.org/build/1042", "https://validator.genlayer.org/audit/992"],
    status: "RESOLVED",
    compliance_pct: 88,
    confidence: 94,
    verdict_reason: JSON.stringify({
      compliance_pct: 88,
      confidence: 94,
      criteria_evaluations: [
        { criterion: "Must cover client creation and non-det consensus APIs", status: "MET", note: "Covered in Sections 2 & 4" },
        { criterion: "Documentation length must exceed 2,000 words", status: "MET", note: "Word count: 2,450 words verified" },
        { criterion: "Include at least 3 runnable code examples", status: "MET", note: "4 code examples provided and tested" },
        { criterion: "Provide architecture flowchart diagram", status: "PARTIAL", note: "Diagram provided as ASCII instead of SVG/PNG" }
      ],
      reason: "High quality deliverables matching 3/4 full criteria and 1 partial criterion."
    }),
    dispute_evidence: [],
    paid_out: true
  },
  {
    id: "1",
    client: "0x3333333333333333333333333333333333333333",
    provider: "0x4444444444444444444444444444444444444444",
    task_description: "Perform automated code audit for Intelligent Escrow Smart Contract",
    criteria: [
      "Execute reentrancy and integer overflow checks",
      "Provide formal proof of storage safety",
      "Deliver PDF audit report with severity breakdown"
    ],
    payment_amount: "10000000000000000000",
    deadline: Math.floor(Date.now() / 1000) + 172800,
    deliverable_urls: ["https://ipfs.io/ipfs/QmAuditReportHash123"],
    reference_urls: ["https://slither.analyzer.org/report/88", "https://mythril.tools/scan/771"],
    status: "SUBMITTED",
    compliance_pct: 0,
    confidence: 0,
    verdict_reason: "",
    dispute_evidence: [],
    paid_out: false
  },
  {
    id: "2",
    client: "0x5555555555555555555555555555555555555555",
    provider: "0x6666666666666666666666666666666666666666",
    task_description: "Train fine-tuned sentiment classifier model on web3 forum posts",
    criteria: [
      "Model accuracy > 90% on benchmark test split",
      "Latency under 100ms per inference batch",
      "Model weights exported in ONNX format"
    ],
    payment_amount: "7500000000000000000",
    deadline: Math.floor(Date.now() / 1000) - 3600,
    deliverable_urls: ["https://huggingface.co/agent-sentiment-v1"],
    reference_urls: ["https://wandb.ai/agent-b/eval-metrics"],
    status: "BREACHED_LATE",
    compliance_pct: 0,
    confidence: 100,
    verdict_reason: "Deliverable submitted past deadline (Objective SLA breach)",
    dispute_evidence: [],
    paid_out: true
  }
];
