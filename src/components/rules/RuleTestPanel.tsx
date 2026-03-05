import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Chip, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Divider,
  List, ListItem, ListItemIcon, ListItemText, Alert,
  CircularProgress,
} from '@mui/material';
import {
  Science as TestIcon,
  CheckCircle as PassIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  Edit as RedactIcon,
} from '@mui/icons-material';
import { TenantRule } from '../../types/rule';
import { getRuleTypeName } from './RuleTypeSelector';

// ============================================================================
// Mock test engine (simulates rule testing locally)
// Will be replaced with real API call later
// ============================================================================

interface TestResult {
  triggered_rules: Array<{
    rule_id: string;
    rule_name: string;
    rule_type: string;
    action: string;
    reason: string;
  }>;
  modified_prompt: string;
  is_blocked: boolean;
  block_reason?: string;
  warnings: string[];
}

const simulateRuleTest = (prompt: string, rules: TenantRule[]): TestResult => {
  const triggered: TestResult['triggered_rules'] = [];
  let modifiedPrompt = prompt;
  let isBlocked = false;
  let blockReason: string | undefined;
  const warnings: string[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const conditions = (rule.conditions as any) || {};

    switch (rule.type) {
      case 'content_moderation': {
        const params = rule.parameters || {};

        // Toxicity check (simple heuristic for test panel)
        if (conditions.check_toxicity) {
          const toxicPatterns = [/\b(hate|kill|die|stupid|idiot|moron)\b/i];
          const isToxic = toxicPatterns.some(p => p.test(prompt));
          if (isToxic) {
            const blockToxic = params.block_toxic ?? true;
            triggered.push({
              rule_id: rule.id,
              rule_name: rule.name,
              rule_type: rule.type,
              action: blockToxic ? 'block' : 'log',
              reason: 'Potentially toxic content detected',
            });
            if (blockToxic) {
              isBlocked = true;
              blockReason = params.block_message || 'Content violates safety policies';
            } else {
              warnings.push(`Rule "${rule.name}": potentially toxic content flagged`);
            }
          }
        }

        // PII check + redaction
        if (!isBlocked && conditions.check_pii) {
          const piiTypes: string[] = conditions.pii_types || ['email', 'phone', 'ssn', 'credit_card'];
          const piiRegexMap: Record<string, RegExp> = {
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
            credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
            ip_address: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
          };
          const redactPii = params.redact_pii ?? true;
          const foundPii: string[] = [];

          for (const piiType of piiTypes) {
            const regex = piiRegexMap[piiType];
            if (regex && regex.test(modifiedPrompt)) {
              foundPii.push(piiType);
              if (redactPii) {
                modifiedPrompt = modifiedPrompt.replace(regex, `[${piiType.toUpperCase()} REDACTED]`);
              }
            }
          }

          if (foundPii.length > 0) {
            triggered.push({
              rule_id: rule.id,
              rule_name: rule.name,
              rule_type: rule.type,
              action: redactPii ? 'modify' : 'log',
              reason: `PII detected: ${foundPii.join(', ')}`,
            });
            if (!redactPii) {
              warnings.push(`Rule "${rule.name}": PII detected (${foundPii.join(', ')})`);
            }
          }
        }
        break;
      }

      case 'token_limit': {
        // Approximate token count (1 token ≈ 4 chars)
        const approxTokens = Math.ceil(prompt.length / 4);
        const maxTokens = conditions.max_tokens || 10000;
        if (approxTokens > maxTokens) {
          triggered.push({
            rule_id: rule.id,
            rule_name: rule.name,
            rule_type: rule.type,
            action: (rule.parameters?.action as string) || 'block',
            reason: `Estimated ${approxTokens} tokens exceeds limit of ${maxTokens}`,
          });
          if (!rule.parameters?.action || rule.parameters.action === 'block') {
            isBlocked = true;
            blockReason = `Token limit exceeded (${approxTokens} > ${maxTokens})`;
          } else {
            warnings.push(`Token usage (${approxTokens}) is close to or exceeds limit (${maxTokens})`);
          }
        }
        break;
      }

      case 'model_restriction':
      case 'rate_limit':
        // These can't be meaningfully tested with just a prompt
        warnings.push(`Rule "${rule.name}" (${getRuleTypeName(rule.type)}) cannot be tested with a sample prompt alone.`);
        break;
    }
  }

  return { triggered_rules: triggered, modified_prompt: modifiedPrompt, is_blocked: isBlocked, block_reason: blockReason, warnings };
};

// ============================================================================
// Component
// ============================================================================

interface RuleTestPanelProps {
  open: boolean;
  onClose: () => void;
  rules: TenantRule[];
  preselectedRuleId?: string | null;
}

export const RuleTestPanel: React.FC<RuleTestPanelProps> = ({
  open,
  onClose,
  rules,
  preselectedRuleId,
}) => {
  const [samplePrompt, setSamplePrompt] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(
    preselectedRuleId ? [preselectedRuleId] : []
  );
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  // Update preselected rule when it changes
  React.useEffect(() => {
    if (preselectedRuleId && open) {
      setSelectedRuleIds([preselectedRuleId]);
      setTestResult(null);
    }
  }, [preselectedRuleId, open]);

  const handleRunTest = () => {
    if (!samplePrompt.trim()) return;

    setTesting(true);
    // Simulate async call
    setTimeout(() => {
      const rulesToTest = selectedRuleIds.length > 0
        ? rules.filter(r => selectedRuleIds.includes(r.id))
        : rules.filter(r => r.enabled);

      const result = simulateRuleTest(samplePrompt, rulesToTest);
      setTestResult(result);
      setTesting(false);
    }, 500);
  };

  const handleClose = () => {
    setSamplePrompt('');
    setTestResult(null);
    setTesting(false);
    onClose();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'block': return <BlockIcon color="error" />;
      case 'modify': return <RedactIcon color="warning" />;
      case 'throttle': return <WarningIcon color="warning" />;
      case 'log': return <WarningIcon color="info" />;
      case 'allow': return <PassIcon color="success" />;
      default: return <PassIcon color="success" />;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Rule Testing Interface</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Test rules against a sample prompt to see how they behave before deployment.
        </Typography>

        {/* Sample Prompt */}
        <TextField
          fullWidth
          label="Sample Prompt"
          value={samplePrompt}
          onChange={(e) => setSamplePrompt(e.target.value)}
          multiline
          rows={4}
          placeholder='e.g., "My email is john@example.com and my SSN is 123-45-6789"'
          sx={{ mb: 2 }}
        />

        {/* Rule Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Rules to Test</InputLabel>
          <Select
            multiple
            value={selectedRuleIds}
            onChange={(e) => setSelectedRuleIds(e.target.value as string[])}
            label="Rules to Test"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map(id => {
                  const rule = rules.find(r => r.id === id);
                  return rule ? <Chip key={id} label={rule.name} size="small" /> : null;
                })}
              </Box>
            )}
          >
            {rules.filter(r => r.enabled).map(rule => (
              <MenuItem key={rule.id} value={rule.id}>
                {rule.name} ({getRuleTypeName(rule.type)})
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
            Leave empty to test against all enabled rules
          </Typography>
        </FormControl>

        <Button
          variant="contained"
          startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <TestIcon />}
          onClick={handleRunTest}
          disabled={!samplePrompt.trim() || testing}
          sx={{ mb: 3 }}
        >
          {testing ? 'Testing...' : 'Run Test'}
        </Button>

        {/* Test Results */}
        {testResult && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>Test Results</Typography>

            {/* Block status */}
            {testResult.is_blocked ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>BLOCKED</strong> — {testResult.block_reason}
              </Alert>
            ) : testResult.triggered_rules.length > 0 ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {testResult.triggered_rules.length} rule(s) triggered
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                No rules triggered — prompt passed all checks
              </Alert>
            )}

            {/* Triggered rules list */}
            {testResult.triggered_rules.length > 0 && (
              <Paper variant="outlined" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ p: 1.5, pb: 0 }}>Rules Applied:</Typography>
                <List dense>
                  {testResult.triggered_rules.map((tr, i) => (
                    <ListItem key={i}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getActionIcon(tr.action)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {tr.rule_name}
                            </Typography>
                            <Chip label={tr.action} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={tr.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Modified prompt (if redaction applied) */}
            {testResult.modified_prompt !== samplePrompt && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Modified Prompt (after redaction):</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'grey.50',
                    p: 1.5,
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {testResult.modified_prompt}
                </Typography>
              </Paper>
            )}

            {/* Warnings */}
            {testResult.warnings.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {testResult.warnings.map((w, i) => (
                  <Alert key={i} severity="info" sx={{ mb: 1 }}>
                    {w}
                  </Alert>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RuleTestPanel;
