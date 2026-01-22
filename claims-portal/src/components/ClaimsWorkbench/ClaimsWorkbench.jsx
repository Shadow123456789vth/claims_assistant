import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcTabs,
  DxcInset,
  DxcProgressBar,
  DxcAlert
} from '@dxc-technology/halstack-react';
import FastTrackBadge from '../shared/FastTrackBadge';
import DocumentUpload from '../shared/DocumentUpload';
import DocumentViewer from '../shared/DocumentViewer';
import './ClaimsWorkbench.css';

const ClaimsWorkbench = ({ claim }) => {
  const [activeTab, setActiveTab] = useState(0);

  console.log('[ClaimsWorkbench] Received claim:', claim);

  if (!claim) {
    console.log('[ClaimsWorkbench] No claim provided, showing alert');
    return (
      <DxcContainer
        padding="var(--spacing-padding-xl)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcAlert
          type="info"
          inlineText="Please select a claim from the dashboard to view details."
        />
      </DxcContainer>
    );
  }

  // Helper function - must be declared before use
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Extract financial data from claim
  const totalClaimAmount = claim.financial?.claimAmount || claim.financial?.totalClaimed || 0;
  const payments = claim.financial?.payments || claim.payments || [];
  const reserves = claim.financial?.reserves || {};

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === 'PAID' || p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = payments.filter(p =>
    p.status === 'PENDING' || p.status === 'Pending Approval' || p.status === 'SCHEDULED'
  );

  const completedPayments = payments.filter(p =>
    p.status === 'PAID' || p.status === 'Paid' || p.status === 'COMPLETED'
  );

  const financialData = {
    totalClaimAmount,
    reserves: {
      initial: reserves.initial || totalClaimAmount,
      current: reserves.current || (totalClaimAmount - totalPaid),
      paid: totalPaid,
      outstanding: reserves.outstanding || (totalClaimAmount - totalPaid)
    },
    payments: completedPayments,
    pendingPayments
  };

  // Extract policy data from claim
  const policyDetails = {
    policyNumber: claim.policy?.policyNumber || 'N/A',
    insuredName: claim.insured?.name || claim.claimant?.name || 'N/A',
    policyType: claim.policy?.policyType || 'Term Life Insurance',
    coverage: claim.financial?.claimAmount ? formatCurrency(claim.financial.claimAmount) : 'N/A',
    effectiveDate: claim.policy?.effectiveDate || claim.policy?.issueDate || 'N/A',
    expirationDate: claim.policy?.expirationDate || 'N/A',
    premium: claim.policy?.premium || 'N/A'
  };

  // Extract beneficiaries from claim
  const beneficiaries = claim.beneficiaries || claim.policy?.beneficiaries || [];

  // Extract timeline from claim
  const timelineEvents = claim.timeline || claim.activityLog || [];

  // Extract requirements from claim
  const requirements = claim.requirements || [];

  return (
    <DxcContainer
      padding="var(--spacing-padding-l)"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Page Header */}
        <DxcFlex justifyContent="space-between" alignItems="flex-start">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcHeading level={1} text={claim.claimNumber || claim.id} />
              {claim.routing && (
                <FastTrackBadge routing={claim.routing.type} showLabel={true} size="medium" />
              )}
            </DxcFlex>
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                {claim.claimant?.name || claim.insured?.name || 'Unknown'}
              </DxcTypography>
              <DxcBadge label={claim.status} />
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                {claim.type || 'DEATH'}
              </DxcTypography>
            </DxcFlex>
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-s)">
            <DxcButton label="Hold" mode="secondary" />
            <DxcButton label="Approve" mode="primary" />
            <DxcButton label="Deny" mode="secondary" />
          </DxcFlex>
        </DxcFlex>

        {/* Progress Card */}
        <DxcContainer
          padding="var(--spacing-padding-l)"
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="Claim Progress" />
            {requirements.length > 0 && (
              <DxcProgressBar
                label="Requirements Complete"
                value={Math.round((requirements.filter(r => r.status === 'SATISFIED' || r.status === 'Completed').length / requirements.length) * 100)}
                showValue
              />
            )}
            <DxcFlex gap="var(--spacing-gap-xl)">
              {claim.workflow?.sla?.dueDate && (() => {
                const dueDate = new Date(claim.workflow.sla.dueDate);
                const today = new Date();
                const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const color = daysRemaining <= 3 ? 'var(--color-fg-error-medium)' : daysRemaining <= 7 ? 'var(--color-fg-warning-medium)' : 'var(--color-fg-success-medium)';

                return (
                  <>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        SLA DAYS REMAINING
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color={color}>
                        {daysRemaining}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        TARGET CLOSE DATE
                      </DxcTypography>
                      <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                        {dueDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </DxcTypography>
                    </DxcFlex>
                  </>
                );
              })()}
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                  FASTTRACK ELIGIBLE
                </DxcTypography>
                <DxcTypography fontSize="16px" fontWeight="font-weight-semibold" color={claim.routing?.type === 'FASTTRACK' ? 'var(--color-fg-success-medium)' : 'var(--color-fg-neutral-dark)'}>
                  {claim.routing?.type === 'FASTTRACK' ? 'Yes' : 'No'}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Tabs */}
        <DxcContainer
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        >
          <DxcFlex direction="column">
            <DxcInset space="var(--spacing-padding-l)" top>
              <DxcTabs iconPosition="left">
                <DxcTabs.Tab
                  label="Financials"
                  icon="payments"
                  active={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Policy 360"
                  icon="policy"
                  active={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Timeline"
                  icon="timeline"
                  active={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Requirements"
                  icon="checklist"
                  active={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Documents"
                  icon="folder"
                  active={activeTab === 4}
                  onClick={() => setActiveTab(4)}
                >
                  <div />
                </DxcTabs.Tab>
              </DxcTabs>
            </DxcInset>

            <DxcInset space="var(--spacing-padding-l)">
              {/* Financials Tab */}
              {activeTab === 0 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Reserve Summary */}
                  <DxcFlex gap="var(--spacing-gap-m)">
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-info-lighter)" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          TOTAL CLAIM AMOUNT
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-info-medium)">
                          {formatCurrency(financialData.totalClaimAmount)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-success-lighter)" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          TOTAL PAID
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">
                          {formatCurrency(financialData.reserves.paid)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-warning-lighter)" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          OUTSTANDING RESERVE
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                          {formatCurrency(financialData.reserves.outstanding)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  {/* Reserve Details */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Reserve History" />
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcFlex justifyContent="space-between">
                          <DxcTypography fontSize="font-scale-03">Initial Reserve Set</DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                            {formatCurrency(financialData.reserves.initial)}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex justifyContent="space-between">
                          <DxcTypography fontSize="font-scale-03">Payments Issued</DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                            -{formatCurrency(financialData.reserves.paid)}
                          </DxcTypography>
                        </DxcFlex>
                        <div style={{ borderTop: "1px solid var(--border-color-neutral-light)", paddingTop: "var(--spacing-gap-s)" }}>
                          <DxcFlex justifyContent="space-between">
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">Current Reserve</DxcTypography>
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                              {formatCurrency(financialData.reserves.current)}
                            </DxcTypography>
                          </DxcFlex>
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  {/* Payment History */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Payment History" />
                    {financialData.payments.map((payment, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                            <DxcFlex justifyContent="space-between" alignItems="center">
                              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)">
                                  {payment.id}
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                                <DxcBadge label={payment.status} />
                              </DxcFlex>
                              <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">
                                {formatCurrency(payment.amount)}
                              </DxcTypography>
                            </DxcFlex>
                            <DxcFlex gap="var(--spacing-gap-l)">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Date</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.date}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Method</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.method}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Reference</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.checkNumber}</DxcTypography>
                              </DxcFlex>
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>

                  {/* Pending Payments */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Pending Payments" />
                      <DxcButton label="Schedule Payment" mode="primary" icon="add" />
                    </DxcFlex>
                    {financialData.pendingPayments.map((payment, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-warning-lightest)" }}
                        border={{ color: "var(--border-color-warning-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                            <DxcFlex justifyContent="space-between" alignItems="center">
                              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-secondary-medium)">
                                  {payment.id}
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                                <DxcBadge label={payment.status} />
                              </DxcFlex>
                              <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                                {formatCurrency(payment.amount)}
                              </DxcTypography>
                            </DxcFlex>
                            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Scheduled Date</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.scheduledDate}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex gap="var(--spacing-gap-s)" style={{ marginLeft: "auto" }}>
                                <DxcButton label="Approve" mode="primary" size="small" />
                                <DxcButton label="Reject" mode="secondary" size="small" />
                              </DxcFlex>
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Policy 360 Tab */}
              {activeTab === 1 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Policy Details" />
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <DxcFlex gap="var(--spacing-gap-xl)" wrap="wrap">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Policy Number</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.policyNumber}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Insured Name</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.insuredName}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Policy Type</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.policyType}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Coverage</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold" color="var(--color-fg-info-medium)">{policyDetails.coverage}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Effective Date</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.effectiveDate}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Premium</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.premium}</DxcTypography>
                        </DxcFlex>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Beneficiaries" />
                    {beneficiaries.map((ben, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex justifyContent="space-between" alignItems="center">
                            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Name</DxcTypography>
                                <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{ben.name}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Relationship</DxcTypography>
                                <DxcTypography fontSize="16px">{ben.relationship}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Percentage</DxcTypography>
                                <DxcTypography fontSize="16px">{ben.percentage}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Amount</DxcTypography>
                                <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">{ben.amount}</DxcTypography>
                              </DxcFlex>
                              <DxcBadge label={ben.status} />
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Timeline Tab */}
              {activeTab === 2 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  {timelineEvents.length > 0 ? (
                    timelineEvents.map((event, index) => (
                      <DxcContainer
                        key={index}
                        style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                {event.type || 'Event'}
                              </DxcTypography>
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </DxcTypography>
                            </DxcFlex>
                            {event.user?.name && (
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                by {event.user.name}
                              </DxcTypography>
                            )}
                            <DxcTypography fontSize="font-scale-03">
                              {event.description || 'No description'}
                            </DxcTypography>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))
                  ) : (
                    <DxcContainer
                      padding="var(--spacing-padding-l)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                    >
                      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                        No timeline events available for this claim.
                      </DxcTypography>
                    </DxcContainer>
                  )}
                </DxcFlex>
              )}

              {/* Requirements Tab */}
              {activeTab === 3 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  {requirements.map((req, index) => (
                    <DxcContainer
                      key={index}
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <DxcInset space="var(--spacing-padding-m)">
                        <DxcFlex justifyContent="space-between" alignItems="center">
                          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                              {req.name}
                            </DxcTypography>
                            <DxcBadge label={req.status} />
                          </DxcFlex>
                          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                              {req.date}
                            </DxcTypography>
                            <DxcButton label="View" mode="tertiary" size="small" />
                          </DxcFlex>
                        </DxcFlex>
                      </DxcInset>
                    </DxcContainer>
                  ))}
                </DxcFlex>
              )}

              {/* Documents Tab */}
              {activeTab === 4 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Upload Section */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Upload Documents" />
                    <DocumentUpload
                      claimId={claim.id}
                      onUploadComplete={(result) => {
                        console.log('Upload complete:', result);
                        // TODO: Refresh documents list
                      }}
                      acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                      maxFileSize={10 * 1024 * 1024}
                      multiple={true}
                    />
                  </DxcFlex>

                  {/* Documents List */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Uploaded Documents" />
                    <DocumentViewer
                      documents={claim.documents || []}
                      onDocumentClick={(doc) => {
                        console.log('Document clicked:', doc);
                        // TODO: Open document preview modal
                      }}
                      onDownload={(doc) => {
                        console.log('Download document:', doc);
                        // TODO: Implement download
                      }}
                      showIDP={true}
                      showActions={true}
                    />
                  </DxcFlex>
                </DxcFlex>
              )}
            </DxcInset>
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>
    </DxcContainer>
  );
};

export default ClaimsWorkbench;
