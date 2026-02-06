import { useState, useEffect } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTable,
  DxcBadge,
  DxcAlert,
  DxcInset,
  DxcChip,
  DxcDivider,
  DxcSpinner
} from '@dxc-technology/halstack-react';
import './BeneficiaryAnalyzer.css';

/**
 * BeneficiaryAnalyzer Component
 *
 * Displays AI-extracted beneficiary information from documents and allows:
 * - Viewing extracted beneficiaries with confidence scores
 * - Comparing against administrative records
 * - LexisNexis integration for address lookup and deceased verification
 * - Document source viewing
 * - AI reasoning explanation
 */
const BeneficiaryAnalyzer = ({ claimId, claim, onApproveBeneficiaries, onCancel }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [lexisNexisResults, setLexisNexisResults] = useState({});
  const [processingLexisNexis, setProcessingLexisNexis] = useState({});

  // Build analysis data from claim if available, otherwise use fallback
  const buildAnalysisData = () => {
    // Try to get beneficiaries from claim data
    const claimBeneficiaries = claim?.beneficiaries || claim?.policy?.beneficiaries || [];
    const claimParties = claim?.parties || [];
    const claimantData = claim?.claimant || {};

    if (claimBeneficiaries.length > 0) {
      // Build from actual claim beneficiary data
      const extractedBeneficiaries = claimBeneficiaries.map((ben, idx) => {
        // Try to find matching party for extra details
        const matchingParty = claimParties.find(p =>
          p.name === ben.name || p.role === ben.relationship
        );

        return {
          id: `bene-${idx + 1}`,
          fullName: ben.name || `Beneficiary ${idx + 1}`,
          relationship: ben.relationship || 'Unknown',
          percentage: typeof ben.percentage === 'string'
            ? parseInt(ben.percentage.replace('%', ''), 10)
            : (ben.percentage || 0),
          ssn: ben.ssn || matchingParty?.ssn || '***-**-0000',
          dateOfBirth: ben.dateOfBirth || matchingParty?.dateOfBirth || 'N/A',
          address: ben.address || matchingParty?.address || {
            street: claimantData.address?.street || '123 Main Street',
            city: claimantData.address?.city || 'Springfield',
            state: claimantData.address?.state || 'IL',
            zip: claimantData.address?.zip || '62701'
          },
          phone: ben.phone || matchingParty?.phone || null,
          email: ben.email || matchingParty?.email || null,
          confidenceScores: {
            overall: 0.92 + (idx * -0.02),
            name: 0.97 - (idx * 0.01),
            relationship: 0.93 - (idx * 0.01),
            percentage: 0.99,
            ssn: 0.85 - (idx * 0.03),
            dateOfBirth: 0.95 - (idx * 0.01),
            address: 0.88
          },
          sourceDocument: {
            id: `doc-${100 + idx}`,
            name: 'Beneficiary_Designation_Form.pdf',
            pageNumber: idx < 2 ? 1 : 2,
            extractionTimestamp: new Date().toISOString()
          },
          extractionReasoning: idx === 0
            ? `Primary beneficiary identified from beneficiary designation form. Name "${ben.name}" extracted with high confidence. Relationship "${ben.relationship}" confirmed from form fields.`
            : `Contingent beneficiary identified from beneficiary section. Relationship "${ben.relationship}" indicated. Allocation of ${ben.percentage} confirmed.`
        };
      });

      const administrativeBeneficiaries = claimBeneficiaries.map((ben, idx) => ({
        id: `admin-${idx + 1}`,
        fullName: ben.name || `Beneficiary ${idx + 1}`,
        relationship: ben.relationship || 'Unknown',
        percentage: typeof ben.percentage === 'string'
          ? parseInt(ben.percentage.replace('%', ''), 10)
          : (ben.percentage || 0),
        ssn: ben.ssn || '***-**-0000',
        dateOfBirth: ben.dateOfBirth || 'N/A',
        address: ben.address || {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701'
        },
        phone: ben.phone || null,
        email: ben.email || null,
        lastUpdated: claim?.policy?.issueDate || '2023-06-15',
        source: 'Policy Administration System'
      }));

      return {
        extractedBeneficiaries,
        administrativeBeneficiaries,
        overallAnalysis: {
          matchStatus: 'MATCH',
          discrepancies: [],
          confidence: 0.94,
          recommendation: 'Extracted beneficiaries match administrative records with high confidence. No significant discrepancies detected.'
        }
      };
    }

    // Fallback: use generic mock data if no claim data available
    return {
      extractedBeneficiaries: [
        {
          id: 'bene-1',
          fullName: 'Unknown Beneficiary',
          relationship: 'Unknown',
          percentage: 100,
          ssn: '***-**-0000',
          dateOfBirth: 'N/A',
          address: { street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A' },
          phone: null,
          email: null,
          confidenceScores: {
            overall: 0.50, name: 0.50, relationship: 0.50,
            percentage: 0.50, ssn: 0.50, dateOfBirth: 0.50, address: 0.50
          },
          sourceDocument: { id: 'doc-0', name: 'No document available', pageNumber: 0, extractionTimestamp: new Date().toISOString() },
          extractionReasoning: 'No claim data available for beneficiary extraction.'
        }
      ],
      administrativeBeneficiaries: [],
      overallAnalysis: {
        matchStatus: 'NO_DATA',
        discrepancies: [],
        confidence: 0,
        recommendation: 'No beneficiary data available. Please upload beneficiary designation forms for analysis.'
      }
    };
  };

  // Simulate loading analysis data on mount
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setAnalysisData(buildAnalysisData());
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [claim]);

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'var(--color-status-success-darker)';
    if (score >= 0.75) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-error-darker)';
  };

  const getConfidenceBadgeType = (score) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.75) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.9) return 'High';
    if (score >= 0.75) return 'Medium';
    return 'Low';
  };

  const handleLexisNexisLookup = async (beneficiaryId, lookupType) => {
    setProcessingLexisNexis(prev => ({ ...prev, [`${beneficiaryId}-${lookupType}`]: true }));

    // Simulate API call to LexisNexis
    setTimeout(() => {
      const mockResults = {
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zip: '62702',
          lastVerified: '2024-01-20',
          confidence: 0.94,
          source: 'LexisNexis Address Verification'
        },
        deceased: {
          status: 'ALIVE',
          lastVerified: '2024-01-20',
          confidence: 0.99,
          source: 'LexisNexis Death Verification'
        }
      };

      setLexisNexisResults(prev => ({
        ...prev,
        [beneficiaryId]: {
          ...prev[beneficiaryId],
          [lookupType]: mockResults[lookupType]
        }
      }));

      setProcessingLexisNexis(prev => ({ ...prev, [`${beneficiaryId}-${lookupType}`]: false }));
    }, 2000);
  };

  const handleViewDocument = (documentId) => {
    console.log('Opening document:', documentId);
  };

  const handleApproveBeneficiaries = () => {
    if (onApproveBeneficiaries) {
      onApproveBeneficiaries(analysisData.extractedBeneficiaries);
    }
  };

  if (!analysisData) {
    return (
      <DxcFlex justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
          <DxcSpinner mode="large" label="Analyzing beneficiary information..." />
        </DxcFlex>
      </DxcFlex>
    );
  }

  return (
    <DxcContainer style={{ backgroundColor: 'var(--color-bg-secondary-lightest)' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcHeading level={2} text="Beneficiary Analyzer" />
            <DxcFlex gap="var(--spacing-gap-s)">
              <DxcButton
                label="Cancel"
                mode="tertiary"
                onClick={onCancel}
              />
              <DxcButton
                label="Approve & Append to Case"
                mode="primary"
                onClick={handleApproveBeneficiaries}
                icon="check_circle"
              />
            </DxcFlex>
          </DxcFlex>
          <DxcTypography color="var(--color-fg-neutral-strong)">
            AI-powered beneficiary extraction and verification for Claim #{claimId}
          </DxcTypography>
        </DxcFlex>

        {/* Overall Analysis Summary */}
        <DxcContainer padding="var(--spacing-padding-l)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcHeading level={4} text="Analysis Summary" />
              <DxcChip
                label={`Overall Confidence: ${(analysisData.overallAnalysis.confidence * 100).toFixed(0)}%`}
                icon="psychology"
              />
            </DxcFlex>

            <DxcAlert
              type={analysisData.overallAnalysis.matchStatus === 'MATCH' ? 'success' : 'warning'}
              inlineText={analysisData.overallAnalysis.recommendation}
            />

            {analysisData.overallAnalysis.discrepancies.length > 0 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcTypography fontWeight="font-weight-semibold">
                  Discrepancies Detected ({analysisData.overallAnalysis.discrepancies.length})
                </DxcTypography>
                {analysisData.overallAnalysis.discrepancies.map((disc, idx) => (
                  <DxcAlert
                    key={idx}
                    type={disc.severity === 'LOW' ? 'info' : 'warning'}
                    inlineText={`${disc.field.toUpperCase()}: "${disc.extracted}" vs "${disc.administrative}" - ${disc.recommendation}`}
                  />
                ))}
              </DxcFlex>
            )}
          </DxcFlex>
        </DxcContainer>

        {/* Main Content Grid */}
        <div className="beneficiary-analyzer-grid">
          {/* Left Column: AI-Extracted Beneficiaries */}
          <DxcContainer padding="var(--spacing-padding-l)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcHeading level={4} text="AI-Extracted Beneficiaries" />
                <DxcChip
                  label={`${analysisData.extractedBeneficiaries.length} Found`}
                  icon="auto_awesome"
                />
              </DxcFlex>

              {analysisData.extractedBeneficiaries.map((beneficiary, index) => (
                <div key={beneficiary.id}>
                  {index > 0 && <DxcDivider />}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Beneficiary Header */}
                    <DxcFlex justifyContent="space-between" alignItems="flex-start">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          {beneficiary.fullName}
                        </DxcTypography>
                        <DxcFlex gap="var(--spacing-gap-xs)">
                          <DxcChip label={beneficiary.relationship} size="small" />
                          <DxcChip label={`${beneficiary.percentage}%`} size="small" />
                        </DxcFlex>
                      </DxcFlex>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="flex-end">
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: getConfidenceColor(beneficiary.confidenceScores.overall),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getConfidenceLabel(beneficiary.confidenceScores.overall)} ({(beneficiary.confidenceScores.overall * 100).toFixed(0)}%)
                        </div>
                      </DxcFlex>
                    </DxcFlex>

                    {/* Beneficiary Details with Confidence Scores */}
                    <div className="beneficiary-details-grid">
                      <DetailWithConfidence
                        label="SSN"
                        value={beneficiary.ssn}
                        confidence={beneficiary.confidenceScores.ssn}
                      />
                      <DetailWithConfidence
                        label="Date of Birth"
                        value={beneficiary.dateOfBirth}
                        confidence={beneficiary.confidenceScores.dateOfBirth}
                      />
                      <DetailWithConfidence
                        label="Address"
                        value={`${beneficiary.address.street}, ${beneficiary.address.city}, ${beneficiary.address.state} ${beneficiary.address.zip}`}
                        confidence={beneficiary.confidenceScores.address}
                      />
                      {beneficiary.phone && (
                        <DetailWithConfidence
                          label="Phone"
                          value={beneficiary.phone}
                          confidence={0.9}
                        />
                      )}
                      {beneficiary.email && (
                        <DetailWithConfidence
                          label="Email"
                          value={beneficiary.email}
                          confidence={0.95}
                        />
                      )}
                    </div>

                    {/* LexisNexis Actions */}
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <DxcButton
                        label={processingLexisNexis[`${beneficiary.id}-address`] ? "Verifying..." : "Verify Address"}
                        mode="secondary"
                        size="small"
                        icon={processingLexisNexis[`${beneficiary.id}-address`] ? undefined : "location_on"}
                        onClick={() => handleLexisNexisLookup(beneficiary.id, 'address')}
                        disabled={processingLexisNexis[`${beneficiary.id}-address`]}
                      />
                      <DxcButton
                        label={processingLexisNexis[`${beneficiary.id}-deceased`] ? "Checking..." : "Check Deceased Status"}
                        mode="secondary"
                        size="small"
                        icon={processingLexisNexis[`${beneficiary.id}-deceased`] ? undefined : "person_search"}
                        onClick={() => handleLexisNexisLookup(beneficiary.id, 'deceased')}
                        disabled={processingLexisNexis[`${beneficiary.id}-deceased`]}
                      />
                      <DxcButton
                        label="View Source Document"
                        mode="tertiary"
                        size="small"
                        icon="description"
                        onClick={() => handleViewDocument(beneficiary.sourceDocument.id)}
                      />
                    </DxcFlex>

                    {/* LexisNexis Results */}
                    {lexisNexisResults[beneficiary.id] && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        {lexisNexisResults[beneficiary.id].address && (
                          <DxcAlert
                            type="info"
                            inlineText={`LexisNexis Current Address: ${lexisNexisResults[beneficiary.id].address.street}, ${lexisNexisResults[beneficiary.id].address.city}, ${lexisNexisResults[beneficiary.id].address.state} ${lexisNexisResults[beneficiary.id].address.zip} (Verified: ${lexisNexisResults[beneficiary.id].address.lastVerified})`}
                          />
                        )}
                        {lexisNexisResults[beneficiary.id].deceased && (
                          <DxcAlert
                            type={lexisNexisResults[beneficiary.id].deceased.status === 'ALIVE' ? 'success' : 'error'}
                            inlineText={`LexisNexis Death Verification: ${lexisNexisResults[beneficiary.id].deceased.status} (Confidence: ${(lexisNexisResults[beneficiary.id].deceased.confidence * 100).toFixed(0)}%)`}
                          />
                        )}
                      </DxcFlex>
                    )}

                    {/* AI Reasoning */}
                    <DxcInset>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-primary-stronger)' }}>
                            psychology
                          </span>
                          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                            AI Extraction Reasoning
                          </DxcTypography>
                        </DxcFlex>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                          {beneficiary.extractionReasoning}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Source: {beneficiary.sourceDocument.name} (Page {beneficiary.sourceDocument.pageNumber})
                        </DxcTypography>
                      </DxcFlex>
                    </DxcInset>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>
          </DxcContainer>

          {/* Right Column: Administrative Records Comparison */}
          <DxcContainer padding="var(--spacing-padding-l)" style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}>
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcHeading level={4} text="Administrative Records" />
                <DxcChip
                  label={`${analysisData.administrativeBeneficiaries.length} on File`}
                  icon="folder"
                />
              </DxcFlex>

              {analysisData.administrativeBeneficiaries.map((beneficiary, index) => (
                <div key={beneficiary.id}>
                  {index > 0 && <DxcDivider />}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Beneficiary Header */}
                    <DxcFlex justifyContent="space-between" alignItems="flex-start">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                          {beneficiary.fullName}
                        </DxcTypography>
                        <DxcFlex gap="var(--spacing-gap-xs)">
                          <DxcChip label={beneficiary.relationship} size="small" />
                          <DxcChip label={`${beneficiary.percentage}%`} size="small" />
                        </DxcFlex>
                      </DxcFlex>
                    </DxcFlex>

                    {/* Administrative Details */}
                    <div className="beneficiary-details-grid">
                      <SimpleDetail label="SSN" value={beneficiary.ssn} />
                      <SimpleDetail label="Date of Birth" value={beneficiary.dateOfBirth} />
                      <SimpleDetail
                        label="Address"
                        value={`${beneficiary.address.street}, ${beneficiary.address.city}, ${beneficiary.address.state} ${beneficiary.address.zip}`}
                      />
                      {beneficiary.phone && (
                        <SimpleDetail label="Phone" value={beneficiary.phone} />
                      )}
                      {beneficiary.email && (
                        <SimpleDetail label="Email" value={beneficiary.email} />
                      )}
                    </div>

                    {/* Admin Record Metadata */}
                    <DxcInset>
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Source: {beneficiary.source}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Last Updated: {beneficiary.lastUpdated}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcInset>
                  </DxcFlex>
                </div>
              ))}
            </DxcFlex>
          </DxcContainer>
        </div>
      </DxcFlex>
    </DxcContainer>
  );
};

// Helper component for displaying details with confidence scores
const DetailWithConfidence = ({ label, value, confidence }) => {
  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'var(--color-status-success-darker)';
    if (score >= 0.75) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-error-darker)';
  };

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
        {label}
      </DxcTypography>
      <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
        <DxcTypography fontSize="font-scale-01">
          {value}
        </DxcTypography>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: getConfidenceColor(confidence)
        }} />
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
          {(confidence * 100).toFixed(0)}%
        </DxcTypography>
      </DxcFlex>
    </DxcFlex>
  );
};

// Helper component for simple admin record details
const SimpleDetail = ({ label, value }) => {
  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
        {label}
      </DxcTypography>
      <DxcTypography fontSize="font-scale-01">
        {value}
      </DxcTypography>
    </DxcFlex>
  );
};

export default BeneficiaryAnalyzer;
