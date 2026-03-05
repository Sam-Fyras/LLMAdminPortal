import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, FormControl, InputLabel, Select,
    MenuItem, Switch, FormControlLabel, Box, Typography,
    Divider, InputAdornment, IconButton, CircularProgress,
    Alert, Slider, Checkbox, ListItemText
} from '@mui/material';
import {
    Visibility, VisibilityOff,
    WifiTethering as TestIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface LLMConfig {
    _id: { $oid: string };
    tenant_id: string;
    provider: string;
    models: string[];
    api_url: string;
    api_key_id: string;
    max_tokens: number | null;
    temperature: number | null;
    top_p: number | null;
    is_active: boolean;
    is_default: boolean;
    fallback_priority: number;
    created_date: string;
    updated_date: string;
}

interface LLMConfigUpdate {
    provider?: string;
    models?: string[];
    api_url?: string;
    api_key_id?: string;
    max_tokens?: number | null;
    temperature?: number | null;
    top_p?: number | null;
    is_active?: boolean;
    is_default?: boolean;
    fallback_priority?: number;
}

interface ProviderEditFormProps {
    open: boolean;
    onClose: () => void;
    provider: LLMConfig;
    // onSave: (id: string, payload: LLMConfigUpdate) => Promise<void>;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PROVIDER_MODELS: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'],
    azure_openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-35-turbo'],
    google_vertex: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    aws_bedrock: ['amazon.titan-text-express-v1', 'meta.llama3-8b-instruct-v1:0'],
    custom: [],
};

const PROVIDER_DEFAULT_URLS: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    azure_openai: 'https://<resource>.openai.azure.com/openai/deployments/<deployment>',
    google_vertex: 'https://us-central1-aiplatform.googleapis.com/v1',
    aws_bedrock: 'https://bedrock-runtime.<region>.amazonaws.com',
    custom: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

const ProviderEditForm: React.FC<ProviderEditFormProps> = ({
    open, onClose, provider 
}) => {
    const [form, setForm] = useState<LLMConfigUpdate>({});
    const [showApiKey, setShowApiKey] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof LLMConfigUpdate, string>>>({});

    // Populate form with current provider values on open
    useEffect(() => {
        if (open && provider) {
            setForm({
                provider: provider.provider,
                models: provider.models,
                api_url: provider.api_url,
                api_key_id: provider.api_key_id,
                max_tokens: provider.max_tokens,
                temperature: provider.temperature,
                top_p: provider.top_p,
                is_active: provider.is_active,
                is_default: provider.is_default,
                fallback_priority: provider.fallback_priority,
            });
            setErrors({});
            setTestStatus('idle');
            setTestMessage('');
        }
    }, [open, provider]);

    const availableModels = PROVIDER_MODELS[form.provider ?? ''] ?? [];

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleChange = <K extends keyof LLMConfigUpdate>(
        field: K,
        value: LLMConfigUpdate[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleProviderChange = (value: string) => {
        setForm(prev => ({
            ...prev,
            provider: value,
            models: [],
            api_url: PROVIDER_DEFAULT_URLS[value] ?? '',
        }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof LLMConfigUpdate, string>> = {};
        if (!form.provider) newErrors.provider = 'Provider is required';
        if (!form.models || form.models.length === 0) newErrors.models = 'At least one model is required';
        if (!form.api_url) newErrors.api_url = 'API URL is required';
        if (!form.api_key_id) newErrors.api_key_id = 'API Key ID is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestMessage('');
        try {
            // TODO: replace with real API call
            await new Promise(res => setTimeout(res, 1500));
            setTestStatus('success');
            setTestMessage('Connection successful! Provider is reachable.');
        } catch {
            setTestStatus('error');
            setTestMessage('Connection failed. Check your API URL and key.');
        }
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            // Only send fields that changed
            const payload: LLMConfigUpdate = {};
            (Object.keys(form) as (keyof LLMConfigUpdate)[]).forEach(key => {
                const formVal = form[key];
                const origVal = (provider as any)[key];
                if (formVal !== origVal) (payload as any)[key] = formVal;
            });
            // await onSave(provider._id, payload);
            onClose();
        } catch (e) {
            console.error('Save failed:', e);
        } finally {
            setSaving(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight={600}>Edit Provider Configuration</Typography>
                <Typography variant="body2" color="text.secondary">
                    ID: {provider?._id.$oid}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

                    {/* ── Provider & Status ── */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <FormControl fullWidth error={!!errors.provider}>
                            <InputLabel>Provider</InputLabel>
                            <Select
                                value={form.provider ?? ''}
                                label="Provider"
                                onChange={(e) => handleProviderChange(e.target.value)}
                            >
                                {Object.keys(PROVIDER_MODELS).map(p => (
                                    <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>
                                        {p.replace('_', ' ').toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.provider && (
                                <Typography variant="caption" color="error">{errors.provider}</Typography>
                            )}
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.is_active ?? true}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                    color="success"
                                />
                            }
                            label={form.is_active ? 'Active' : 'Inactive'}
                            sx={{ minWidth: 110, mt: 1 }}
                        />
                    </Box>

                    {/* ── Models (multi-select) ── */}
                    <FormControl fullWidth error={!!errors.models}>
                        <InputLabel>Models Enabled</InputLabel>
                        <Select
                            multiple
                            value={form.models ?? []}
                            label="Models Enabled"
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange('models', typeof val === 'string' ? val.split(',') : val as string[]);
                            }}
                            renderValue={(selected) => (selected as string[]).join(', ')}
                            disabled={!form.provider}
                        >
                            {availableModels.map(m => (
                                <MenuItem key={m} value={m}>
                                    <Checkbox checked={(form.models ?? []).includes(m)} size="small" />
                                    <ListItemText primary={m} />
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.models && (
                            <Typography variant="caption" color="error">{errors.models}</Typography>
                        )}
                    </FormControl>

                    {/* ── API URL ── */}
                    <TextField
                        fullWidth
                        label="API URL"
                        value={form.api_url ?? ''}
                        onChange={(e) => handleChange('api_url', e.target.value)}
                        error={!!errors.api_url}
                        helperText={errors.api_url}
                        placeholder="https://api.example.com/v1"
                    />

                    {/* ── API Key ID ── */}
                    <TextField
                        fullWidth
                        label="API Key ID"
                        type={showApiKey ? 'text' : 'password'}
                        value={form.api_key_id ?? ''}
                        onChange={(e) => handleChange('api_key_id', e.target.value)}
                        error={!!errors.api_key_id}
                        helperText={errors.api_key_id || 'Reference ID to the stored encrypted API key'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowApiKey(prev => !prev)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {/* ── Test Connection ── */}
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={testStatus === 'loading'
                                ? <CircularProgress size={16} />
                                : <TestIcon />
                            }
                            onClick={handleTestConnection}
                            disabled={testStatus === 'loading' || !form.api_url || !form.api_key_id}
                            size="small"
                        >
                            Test Connection
                        </Button>
                        {testMessage && (
                            <Alert
                                severity={testStatus === 'success' ? 'success' : 'error'}
                                sx={{ mt: 1 }}
                                onClose={() => { setTestStatus('idle'); setTestMessage(''); }}
                            >
                                {testMessage}
                            </Alert>
                        )}
                    </Box>

                    <Divider />

                    {/* ── Inference Parameters ── */}
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                        Inference Parameters
                    </Typography>

                    {/* Max Tokens */}
                    <TextField
                        fullWidth
                        label="Max Tokens"
                        type="number"
                        value={form.max_tokens ?? ''}
                        onChange={(e) => handleChange(
                            'max_tokens',
                            e.target.value === '' ? null : Number(e.target.value)
                        )}
                        helperText="Leave empty to use provider default"
                        inputProps={{ min: 1, max: 128000 }}
                    />

                    {/* Temperature */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Temperature</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {form.temperature ?? 'Default'}
                            </Typography>
                        </Box>
                        <Slider
                            value={form.temperature ?? 0.7}
                            min={0}
                            max={2}
                            step={0.01}
                            onChange={(_, val) => handleChange('temperature', val as number)}
                            valueLabelDisplay="auto"
                            marks={[
                                { value: 0, label: '0' },
                                { value: 1, label: '1' },
                                { value: 2, label: '2' },
                            ]}
                        />
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => handleChange('temperature', null)}
                            sx={{ mt: 0.5 }}
                        >
                            Reset to default
                        </Button>
                    </Box>

                    {/* Top P */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Top P</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {form.top_p ?? 'Default'}
                            </Typography>
                        </Box>
                        <Slider
                            value={form.top_p ?? 1}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(_, val) => handleChange('top_p', val as number)}
                            valueLabelDisplay="auto"
                            marks={[
                                { value: 0, label: '0' },
                                { value: 0.5, label: '0.5' },
                                { value: 1, label: '1' },
                            ]}
                        />
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => handleChange('top_p', null)}
                            sx={{ mt: 0.5 }}
                        >
                            Reset to default
                        </Button>
                    </Box>

                    <Divider />

                    {/* ── Default Provider + Fallback Priority ── */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={form.is_default ?? false}
                                    onChange={(e) => handleChange('is_default', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Set as Default Provider"
                        />
                        <TextField
                            label="Fallback Priority"
                            type="number"
                            size="small"
                            sx={{ width: 160 }}
                            value={form.fallback_priority ?? 1}
                            onChange={(e) => handleChange('fallback_priority', Number(e.target.value))}
                            inputProps={{ min: 1 }}
                            helperText="Order to try if primary fails"
                        />
                    </Box>

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={saving}>Cancel</Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProviderEditForm;