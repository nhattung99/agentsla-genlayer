import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ContractNoticeBanner from './components/ContractNoticeBanner';
import SLAList from './components/SLAList';
import CreateSLAForm from './components/CreateSLAForm';
import SubmitDeliverableModal from './components/SubmitDeliverableModal';
import ResolutionModal from './components/ResolutionModal';
import DisputePanel from './components/DisputePanel';
import Leaderboard from './components/Leaderboard';
import { SAMPLE_AGREEMENTS, connectWallet, isContractConfigured } from './services/genlayer';

export default function App() {
  const [account, setAccount] = useState(null);
  const [client, setClient] = useState(null);
  const [agreements, setAgreements] = useState(SAMPLE_AGREEMENTS);
  const [customContractAddress, setCustomContractAddress] = useState('');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDeliverableSLA, setActiveDeliverableSLA] = useState(null);
  const [selectedResolutionSLA, setSelectedResolutionSLA] = useState(null);

  const handleConnect = async () => {
    try {
      const res = await connectWallet();
      setAccount(res.userAddress);
      setClient(res.client);
    } catch (err) {
      alert('Wallet connection failed: ' + err.message);
    }
  };

  const handleCreateSLA = (newSLAData) => {
    const newId = String(agreements.length);
    const newEntry = {
      id: newId,
      client: account || "0x1111111111111111111111111111111111111111",
      provider: newSLAData.provider,
      task_description: newSLAData.task_description,
      criteria: newSLAData.criteria,
      payment_amount: newSLAData.payment_amount,
      deadline: newSLAData.deadline,
      deliverable_urls: [],
      reference_urls: [],
      status: "PENDING_DELIVERY",
      compliance_pct: 0,
      confidence: 0,
      verdict_reason: "",
      dispute_evidence: [],
      paid_out: false
    };

    setAgreements([newEntry, ...agreements]);
    setShowCreateModal(false);
  };

  const handleSubmitDeliverable = ({ agreement_id, deliverable_urls, reference_urls }) => {
    setAgreements(agreements.map(item => {
      if (item.id === agreement_id) {
        return {
          ...item,
          deliverable_urls,
          reference_urls,
          status: 'SUBMITTED'
        };
      }
      return item;
    }));
    setActiveDeliverableSLA(null);
  };

  const handleRunAdjudication = async (agreement_id) => {
    // Simulate GenLayer consensus adjudication response
    await new Promise(resolve => setTimeout(resolve, 2500));

    setAgreements(agreements.map(item => {
      if (item.id === agreement_id) {
        const compliance_pct = 85;
        const confidence = 92;
        const verdictObj = {
          compliance_pct,
          confidence,
          criteria_evaluations: item.criteria.map((c, i) => ({
            criterion: c,
            status: i === 0 ? 'MET' : i === 1 ? 'MET' : 'PARTIAL',
            note: 'Verified against independent reference logs'
          })),
          reason: 'Adjudicated by GenLayer consensus. Criteria 1 & 2 fully met; Criterion 3 partially met.'
        };
        return {
          ...item,
          status: 'RESOLVED',
          compliance_pct,
          confidence,
          verdict_reason: JSON.stringify(verdictObj),
          paid_out: true
        };
      }
      return item;
    }));

    if (selectedResolutionSLA && selectedResolutionSLA.id === agreement_id) {
      setSelectedResolutionSLA(prev => ({
        ...prev,
        status: 'RESOLVED',
        compliance_pct: 85,
        confidence: 92,
        verdict_reason: JSON.stringify({
          compliance_pct: 85,
          confidence: 92,
          criteria_evaluations: prev.criteria.map(c => ({
            criterion: c,
            status: 'MET',
            note: 'Verified against independent reference logs'
          })),
          reason: 'Adjudicated by GenLayer consensus. Criteria fully met.'
        })
      }));
    }
  };

  const handleSubmitEvidence = (agreement_id, evidence_urls) => {
    setAgreements(agreements.map(item => {
      if (item.id === agreement_id) {
        return {
          ...item,
          dispute_evidence: [...item.dispute_evidence, ...evidence_urls]
        };
      }
      return item;
    }));
  };

  const handleAcceptDisputedVerdict = (agreement_id) => {
    setAgreements(agreements.map(item => {
      if (item.id === agreement_id) {
        return {
          ...item,
          status: 'RESOLVED',
          paid_out: true
        };
      }
      return item;
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header account={account} onConnectWallet={handleConnect} />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Banner if Contract Address Unconfigured */}
        <ContractNoticeBanner
          isConfigured={isContractConfigured() || Boolean(customContractAddress)}
          customAddress={customContractAddress}
          onSetCustomAddress={setCustomContractAddress}
        />

        {/* Hero Pitch Banner */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Decentralized SLA Adjudication Layer for the Agentic Economy
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '900px', lineHeight: 1.6 }}>
            EVM smart contracts cannot evaluate subjective work quality, and human arbiters cannot keep up with 24/7 high-speed AI agent transactions. 
            <strong> AgentSLA</strong> uses <strong>GenLayer Non-Deterministic Consensus</strong> to cross-reference deliverables against independent verification sources, compute continuous compliance scores (0-100%), and trigger proportional escrow payouts.
          </p>
        </div>

        {/* Agent Leaderboard */}
        <Leaderboard agreements={agreements} />

        {/* SLA Dashboard */}
        <SLAList
          agreements={agreements}
          onSelectAgreement={(item) => setSelectedResolutionSLA(item)}
          onCreateSLA={() => setShowCreateModal(true)}
          onSubmitDeliverable={(item) => setActiveDeliverableSLA(item)}
          onResolveSLA={(item) => setSelectedResolutionSLA(item)}
        />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        color: 'var(--text-subtle)',
        fontSize: '0.8rem',
        marginTop: '3rem'
      }}>
        AgentSLA Platform • GenLayer studionet • Intelligent Adjudication Protocol
      </footer>

      {/* Modals */}
      {showCreateModal && (
        <CreateSLAForm
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSLA}
        />
      )}

      {activeDeliverableSLA && (
        <SubmitDeliverableModal
          agreement={activeDeliverableSLA}
          onClose={() => setActiveDeliverableSLA(null)}
          onSubmit={handleSubmitDeliverable}
        />
      )}

      {selectedResolutionSLA && (
        <ResolutionModal
          agreement={selectedResolutionSLA}
          onClose={() => setSelectedResolutionSLA(null)}
          onRunAdjudication={handleRunAdjudication}
        />
      )}
    </div>
  );
}
