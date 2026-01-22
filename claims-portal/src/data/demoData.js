/**
 * Demo Data Generator
 *
 * Generates realistic sample claims with full orchestration metadata:
 * - FastTrack routing (40% of claims)
 * - Workflow/SLA data
 * - Requirements with various statuses
 * - Policy information
 * - Financial data
 * - Timeline events
 */

import {
  ClaimStatus,
  ClaimType,
  RoutingType,
  RequirementStatus,
  RequirementType
} from '../types/claim.types';

/**
 * Generate random date within a range
 */
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate random SSN
 */
const randomSSN = () => {
  return `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

/**
 * Sample names pool
 */
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const randomName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

/**
 * Generate requirements based on claim characteristics
 */
const generateRequirements = (claim) => {
  const requirements = [];

  // Convert createdAt to Date if it's a string
  const createdAtDate = typeof claim.createdAt === 'string' ? new Date(claim.createdAt) : claim.createdAt;

  // Always required documents
  requirements.push({
    id: `${claim.id}-req-1`,
    type: RequirementType.DEATH_CERTIFICATE,
    name: 'Death Certificate',
    description: 'Certified copy of death certificate',
    status: claim.routing?.type === RoutingType.FASTTRACK ? RequirementStatus.SATISFIED : RequirementStatus.PENDING,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: claim.routing?.type === RoutingType.FASTTRACK ? claim.createdAt : null,
    documents: claim.routing?.type === RoutingType.FASTTRACK ? [`doc-${claim.id}-1`] : [],
    metadata: {
      confidenceScore: claim.routing?.type === RoutingType.FASTTRACK ? 0.95 : null,
      idpClassification: claim.routing?.type === RoutingType.FASTTRACK ? 'death_certificate' : null
    }
  });

  requirements.push({
    id: `${claim.id}-req-2`,
    type: RequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Statement',
    description: 'Signed claimant statement form',
    status: claim.routing?.type === RoutingType.FASTTRACK ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: claim.routing?.type === RoutingType.FASTTRACK ? claim.createdAt : null,
    documents: claim.routing?.type === RoutingType.FASTTRACK ? [`doc-${claim.id}-2`] : [`doc-${claim.id}-2`],
    metadata: {
      confidenceScore: claim.routing?.type === RoutingType.FASTTRACK ? 0.92 : 0.78
    }
  });

  requirements.push({
    id: `${claim.id}-req-3`,
    type: RequirementType.PROOF_OF_IDENTITY,
    name: 'Proof of Identity',
    description: "Driver's license or government-issued ID",
    status: RequirementStatus.PENDING,
    isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    satisfiedDate: null,
    documents: [],
    metadata: {}
  });

  // Conditional requirements
  if (claim.financial.claimAmount > 500000) {
    requirements.push({
      id: `${claim.id}-req-4`,
      type: RequirementType.ATTENDING_PHYSICIAN_STATEMENT,
      name: 'Attending Physician Statement (APS)',
      description: 'Required for claims over $500K',
      status: RequirementStatus.PENDING,
      isMandatory: false,
      dueDate: new Date(createdAtDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [],
      metadata: { reason: 'High value claim' }
    });
  }

  // Check if policy is contestable (issued < 2 years ago)
  const policyIssueDate = new Date(claim.policy.issueDate);
  const contestableDate = new Date(policyIssueDate);
  contestableDate.setFullYear(contestableDate.getFullYear() + 2);

  if (new Date(claim.insured.dateOfDeath) < contestableDate) {
    requirements.push({
      id: `${claim.id}-req-5`,
      type: RequirementType.MEDICAL_RECORDS,
      name: 'Medical Records',
      description: 'Required for contestable policies',
      status: RequirementStatus.PENDING,
      isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      satisfiedDate: null,
      documents: [],
      metadata: { reason: 'Policy within contestable period' }
    });
  }

  return requirements;
};

/**
 * Generate timeline events for a claim
 */
const generateTimeline = (claim) => {
  const events = [];

  events.push({
    id: `${claim.id}-event-1`,
    timestamp: claim.createdAt,
    type: 'claim.created',
    source: 'cma',
    user: { name: 'System', role: 'system' },
    description: 'Claim submitted via online portal',
    metadata: { channel: 'beneficiary_portal' }
  });

  events.push({
    id: `${claim.id}-event-2`,
    timestamp: new Date(new Date(claim.createdAt).getTime() + 5 * 60 * 1000).toISOString(),
    type: 'policy.verified',
    source: 'policy',
    user: { name: 'System', role: 'system' },
    description: 'Policy verified in Policy Admin system',
    metadata: { policyNumber: claim.policy.policyNumber, status: 'in-force' }
  });

  events.push({
    id: `${claim.id}-event-3`,
    timestamp: new Date(new Date(claim.createdAt).getTime() + 10 * 60 * 1000).toISOString(),
    type: 'death.verified',
    source: 'verification',
    user: { name: 'LexisNexis', role: 'external' },
    description: 'Death verification completed (3-point match)',
    metadata: { confidence: 0.95, matchPoints: ['ssn', 'name', 'dob'] }
  });

  if (claim.routing?.type === RoutingType.FASTTRACK) {
    events.push({
      id: `${claim.id}-event-4`,
      timestamp: new Date(new Date(claim.createdAt).getTime() + 15 * 60 * 1000).toISOString(),
      type: 'routing.fasttrack',
      source: 'fso',
      user: { name: 'Routing Engine', role: 'system' },
      description: 'Claim routed to FastTrack processing',
      metadata: { score: claim.routing.score, eligible: true }
    });
  }

  events.push({
    id: `${claim.id}-event-5`,
    timestamp: new Date(new Date(claim.createdAt).getTime() + 20 * 60 * 1000).toISOString(),
    type: 'requirements.generated',
    source: 'requirements',
    user: { name: 'Decision Table Engine', role: 'system' },
    description: `${claim.requirements?.length || 3} requirements generated`,
    metadata: { mandatoryCount: 3, optionalCount: 0 }
  });

  return events;
};

/**
 * Generate a single demo claim
 */
const generateClaim = (index, isFastTrack = false) => {
  const now = new Date();
  const createdDate = randomDate(
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)   // 1 day ago
  );

  const insuredName = randomName();
  const claimantName = randomName();
  const policyNumber = `POL-${Math.floor(Math.random() * 900000 + 100000)}`;
  const claimNumber = `CLM-${String(index).padStart(6, '0')}`;

  // Random claim amount between $100K and $1M
  const claimAmount = Math.floor(Math.random() * 900000 + 100000);

  // Policy issue date (1-10 years ago)
  const policyIssueDate = randomDate(
    new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() - 1 * 365 * 24 * 60 * 60 * 1000)
  );

  // Death date (1-60 days ago)
  const deathDate = randomDate(
    new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
  );

  // Status distribution
  const statusOptions = [
    ClaimStatus.NEW,
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.APPROVED,
    ClaimStatus.CLOSED
  ];
  const status = isFastTrack && Math.random() > 0.3
    ? ClaimStatus.CLOSED
    : statusOptions[Math.floor(Math.random() * statusOptions.length)];

  // Calculate days open
  const daysOpen = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

  // SLA date based on routing type
  const slaDays = isFastTrack ? 10 : 30;
  const slaDate = new Date(createdDate.getTime() + slaDays * 24 * 60 * 60 * 1000);
  const daysToSla = Math.floor((slaDate - now) / (1000 * 60 * 60 * 24));

  const claim = {
    id: `claim-${index}`,
    claimNumber,
    status,
    type: ClaimType.DEATH,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: status === ClaimStatus.CLOSED ? new Date(createdDate.getTime() + (isFastTrack ? 7 : 25) * 24 * 60 * 60 * 1000).toISOString() : null,

    // Insured information
    insured: {
      name: insuredName,
      ssn: randomSSN(),
      dateOfBirth: randomDate(
        new Date(1940, 0, 1),
        new Date(1980, 11, 31)
      ).toISOString().split('T')[0],
      dateOfDeath: deathDate.toISOString().split('T')[0],
      age: Math.floor(Math.random() * 40 + 50)
    },

    // Claimant information
    claimant: {
      name: claimantName,
      relationship: 'Spouse',
      contactInfo: {
        email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`,
        phone: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
      }
    },

    // Policy information
    policy: {
      policyNumber,
      type: 'Term Life',
      status: 'In Force',
      issueDate: policyIssueDate.toISOString().split('T')[0],
      faceAmount: claimAmount,
      owner: insuredName
    },

    // Financial information
    financial: {
      claimAmount,
      reserve: claimAmount * 0.9,
      amountPaid: status === ClaimStatus.CLOSED ? claimAmount : 0,
      interestAmount: status === ClaimStatus.CLOSED ? Math.floor(claimAmount * 0.02) : 0,
      currency: 'USD'
    },

    // Routing information (FastTrack or Standard)
    routing: isFastTrack ? {
      type: RoutingType.FASTTRACK,
      score: Math.floor(Math.random() * 10 + 85), // 85-95
      eligible: true,
      evaluatedAt: new Date(createdDate.getTime() + 15 * 60 * 1000).toISOString(),
      criteria: {
        deathVerification: true,
        policyInForce: true,
        beneficiaryMatch: true,
        noContestability: policyIssueDate < new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        claimAmountThreshold: claimAmount <= 500000,
        noAnomalies: true
      }
    } : {
      type: RoutingType.STANDARD,
      score: Math.floor(Math.random() * 15 + 70), // 70-84
      eligible: false,
      evaluatedAt: new Date(createdDate.getTime() + 15 * 60 * 1000).toISOString(),
      criteria: {
        deathVerification: true,
        policyInForce: true,
        beneficiaryMatch: Math.random() > 0.5,
        noContestability: policyIssueDate < new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        claimAmountThreshold: claimAmount <= 500000,
        noAnomalies: Math.random() > 0.3
      }
    },

    // Workflow information (FSO)
    workflow: {
      fsoCase: `FSO-${claimNumber}`,
      currentTask: status === ClaimStatus.CLOSED ? null : 'Review Requirements',
      assignedTo: status === ClaimStatus.CLOSED ? null : 'John Smith',
      daysOpen,
      sla: {
        dueDate: slaDate.toISOString(),
        daysRemaining: daysToSla,
        atRisk: daysToSla < 3 && status !== ClaimStatus.CLOSED
      }
    }
  };

  // Add requirements
  claim.requirements = generateRequirements(claim);

  // Add timeline
  claim.timeline = generateTimeline(claim);

  return claim;
};

/**
 * Generate demo claims dataset
 * Target: 40% FastTrack claims
 */
export const generateDemoClaims = (count = 20) => {
  const claims = [];
  const fastTrackCount = Math.floor(count * 0.4); // 40% FastTrack

  // Generate FastTrack claims
  for (let i = 1; i <= fastTrackCount; i++) {
    claims.push(generateClaim(i, true));
  }

  // Generate Standard claims
  for (let i = fastTrackCount + 1; i <= count; i++) {
    claims.push(generateClaim(i, false));
  }

  // Shuffle array
  return claims.sort(() => Math.random() - 0.5);
};

/**
 * Generate demo policies (linked to claims)
 */
export const generateDemoPolicies = (claims) => {
  return claims.map(claim => ({
    id: claim.policy.policyNumber,
    policyNumber: claim.policy.policyNumber,
    status: claim.policy.status,
    type: claim.policy.type,
    issueDate: claim.policy.issueDate,
    faceAmount: claim.policy.faceAmount,
    owner: claim.policy.owner,
    insured: claim.insured.name,
    beneficiaries: [
      {
        name: claim.claimant.name,
        relationship: claim.claimant.relationship,
        percentage: 100,
        type: 'Primary'
      }
    ],
    premiumAmount: Math.floor(claim.policy.faceAmount * 0.001),
    premiumFrequency: 'Annual'
  }));
};

/**
 * Generate demo FSO cases
 */
export const generateDemoFSOCases = (claims) => {
  return claims.map(claim => ({
    id: claim.workflow.fsoCase,
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status === ClaimStatus.CLOSED ? 'Closed' : 'Open',
    priority: claim.routing?.type === RoutingType.FASTTRACK ? 'High' : 'Normal',
    currentTask: claim.workflow.currentTask,
    assignedTo: claim.workflow.assignedTo,
    sla: claim.workflow.sla,
    playbook: claim.routing?.type === RoutingType.FASTTRACK ? 'FastTrack Death Claim' : 'Standard Death Claim',
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt
  }));
};

/**
 * Export default demo dataset
 */
const demoClaims = generateDemoClaims(20);

export default {
  claims: demoClaims,
  policies: generateDemoPolicies(demoClaims),
  fsoCases: generateDemoFSOCases(demoClaims)
};
