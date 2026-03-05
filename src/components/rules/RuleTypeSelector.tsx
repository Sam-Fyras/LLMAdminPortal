import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { RuleType } from '../../types/rule';

export const RULE_TYPE_OPTIONS: { value: RuleType; label: string }[] = [
  { value: 'token_limit', label: 'Token Limit' },
  { value: 'model_restriction', label: 'Model Restriction' },
  { value: 'rate_limit', label: 'Rate Limit' },
  { value: 'content_moderation', label: 'Content Moderation' },
];

export const RULE_TYPE_COLORS: Record<RuleType, 'primary' | 'secondary' | 'default' | 'error' | 'warning' | 'info' | 'success'> = {
  token_limit: 'primary',
  model_restriction: 'secondary',
  rate_limit: 'info',
  content_moderation: 'error',
};

export const ACTION_OPTIONS: Record<RuleType, { value: string; label: string }[]> = {
  token_limit: [
    { value: 'block', label: 'Block' },
    { value: 'log', label: 'Log Only (no block)' },
  ],
  model_restriction: [
    { value: 'block', label: 'Block' },
    { value: 'log', label: 'Log Only (no block)' },
  ],
  rate_limit: [
    { value: 'block', label: 'Block' },
    { value: 'throttle', label: 'Throttle' },
    { value: 'log', label: 'Log Only (no block)' },
  ],
  content_moderation: [
    { value: 'block', label: 'Block' },
    { value: 'modify', label: 'Modify / Redact' },
    { value: 'log', label: 'Log Only (no block)' },
  ],
};

export const MODEL_OPTIONS = [
  'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo',
  'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku',
  'gemini-pro', 'gemini-ultra',
];

export const getRuleTypeName = (type: RuleType) =>
  RULE_TYPE_OPTIONS.find(o => o.value === type)?.label || type.replace(/_/g, ' ');

interface RuleTypeSelectorProps {
  value: RuleType;
  onChange: (type: RuleType) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

/**
 * RuleTypeSelector Component
 * Dropdown for selecting rule type
 */
export const RuleTypeSelector: React.FC<RuleTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  fullWidth = true,
}) => {
  const handleChange = (e: SelectChangeEvent<string>) => {
    onChange(e.target.value as RuleType);
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel>Rule Type</InputLabel>
      <Select value={value} onChange={handleChange} label="Rule Type" disabled={disabled}>
        {RULE_TYPE_OPTIONS.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RuleTypeSelector;
