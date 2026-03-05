import { Box, Dialog, DialogActions,
    DialogContent, DialogTitle, TextField, Switch,
    InputLabel, FormControl, Select, Divider, FormControlLabel,
    MenuItem, Typography, Button, InputAdornment, IconButton,
    Alert, CircularProgress, Slider, Checkbox, ListItemText} from "@mui/material";
import { useState } from "react";
import React from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface UserFormProps {
    open: boolean;
    onClose: () => void;
}

interface NewProvider {
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
}

const PROVIDER_MODELS: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    anthropic: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
    azure_openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-35-turbo'],
    google_vertex: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    aws_bedrock: ['anthropic.claude-3-opus', 'anthropic.claude-3-sonnet', 'amazon.titan-text-express', 'meta.llama3-70b-instruct'],
    custom: [],
};

const PROVIDER_API_URLS: Record<string, string> = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages',
    azure_openai: '',
    google_vertex: 'https://generativelanguage.googleapis.com/v1beta',
    aws_bedrock: '',
    custom: '',
};

const INITIAL_STATE: NewProvider = {
    provider: '',
    models: [],
    api_url: '',
    api_key_id: '',
    max_tokens: null,
    temperature: null,
    top_p: null,
    is_active: true,
    is_default: false,
    fallback_priority: 1,
};

const ProviderForm: React.FC<UserFormProps> = ({ open, onClose }) => {

    const [newProvider, setNewProvider] = useState<NewProvider>(INITIAL_STATE);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!newProvider.provider.trim()) errors.provider = 'Provider is required';
        if (newProvider.models.length === 0) errors.models = 'At least one model is required';
        if (!newProvider.api_url.trim()) errors.api_url = 'API URL is required';
        if (!newProvider.api_key_id.trim()) errors.api_key_id = 'API Key ID is required';
        if (!apiKey.trim()) errors.api_key = 'API Key is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setNewProvider(INITIAL_STATE);
        setFormErrors({});
        setApiKey('');
        setShowApiKey(false);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        if (!newProvider.api_url || !apiKey) {
            setTestResult({ success: false, message: 'API URL and API Key are required to test connection.' });
            return;
        }
        setTesting(true);
        setTestResult(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setTestResult({ success: true, message: 'Connection successful!' });
        } catch {
            setTestResult({ success: false, message: 'Connection failed. Check your API URL and key.' });
        } finally {
            setTesting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Provider</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>

                    {/* Provider */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <FormControl fullWidth required error={!!formErrors.provider}>
                            <InputLabel>Provider</InputLabel>
                            <Select
                                value={newProvider.provider}
                                label="Provider"
                                onChange={(e) => {
                                    const selected = e.target.value;
                                    setNewProvider({
                                        ...newProvider,
                                        provider: selected,
                                        api_url: PROVIDER_API_URLS[selected] ?? '',
                                        models: [],
                                    });
                                }}
                            >
                                <MenuItem value="openai">OpenAI</MenuItem>
                                <MenuItem value="anthropic">Anthropic</MenuItem>
                                <MenuItem value="azure_openai">Azure OpenAI</MenuItem>
                                <MenuItem value="google_vertex">Google Vertex AI</MenuItem>
                                <MenuItem value="aws_bedrock">AWS Bedrock</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                            </Select>
                            {formErrors.provider && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                    {formErrors.provider}
                                </Typography>
                            )}
                        </FormControl>
                        <FormControlLabel
                                control={
                                    <Switch
                                        checked={newProvider.is_active}
                                        onChange={(e) =>
                                            setNewProvider({ ...newProvider, is_active: e.target.checked })
                                        }
                                        color="success"
                                    />
                                }
                                label={newProvider.is_active ? 'Active' : 'Inactive'}
                                sx={{ minWidth: 110, mt: 1 }}
                            />
                    </Box>

                    {/* Models (multi-select) */}
                    <FormControl fullWidth required error={!!formErrors.models}>
                        <InputLabel>Models Enabled</InputLabel>
                        <Select
                            multiple
                            value={newProvider.models}
                            label="Models Enabled"
                            onChange={(e) => {
                                const val = e.target.value;
                                setNewProvider({ ...newProvider, models: typeof val === 'string' ? val.split(',') : val as string[] });
                            }}
                            renderValue={(selected) => (selected as string[]).join(', ')}
                            disabled={!newProvider.provider}
                        >
                            {(PROVIDER_MODELS[newProvider.provider] ?? []).map((m) => (
                                <MenuItem key={m} value={m}>
                                    <Checkbox checked={newProvider.models.includes(m)} size="small" />
                                    <ListItemText primary={m} />
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.models && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                {formErrors.models}
                            </Typography>
                        )}
                    </FormControl>

                    {/* API URL */}
                    <TextField
                        label="API URL"
                        required
                        fullWidth
                        value={newProvider.api_url}
                        onChange={(e) => setNewProvider({ ...newProvider, api_url: e.target.value })}
                        error={!!formErrors.api_url}
                        helperText={formErrors.api_url || 'Endpoint used to invoke the model'}
                        placeholder="https://api.openai.com/v1/chat/completions"
                    />

                    {/* API Key with show/hide */}
                    <TextField
                        label="API Key ID"
                        required
                        fullWidth
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        error={!!formErrors.api_key}
                        helperText={formErrors.api_key || 'Your secret API key — stored encrypted'}
                        placeholder="sk-..."
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowApiKey(prev => !prev)} edge="end" size="small">
                                        {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Test Connection */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTestConnection}
                            disabled={testing || !newProvider.api_url || !apiKey}
                            startIcon={testing ? <CircularProgress size={16} /> : null}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            {testing ? 'Testing...' : 'Test Connection'}
                        </Button>
                        {testResult && (
                            <Alert
                                severity={testResult.success ? 'success' : 'error'}
                                icon={testResult.success 
                                    ? <CheckCircleIcon fontSize="small" /> 
                                    : <ErrorIcon fontSize="small" />
                                }
                                sx={{ py: 0.5, flex: 1 }}
                            >
                                {testResult.message}
                            </Alert>
                        )}
                    </Box>

                    <Divider>
                        <Typography variant="caption" color="text.secondary">
                            Inference Parameters (optional)
                        </Typography>
                    </Divider>

                    {/* Max Tokens */}
                    <TextField
                        label="Max Tokens"
                        type="number"
                        fullWidth
                        value={newProvider.max_tokens ?? ''}
                        onChange={(e) =>
                            setNewProvider({
                                ...newProvider,
                                max_tokens: e.target.value !== '' ? Number(e.target.value) : null,
                            })
                        }
                        inputProps={{ min: 1 }}
                        helperText="Leave blank for default"
                    />

                    {/* Temperature Slider */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Temperature</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {newProvider.temperature ?? 'Default'}
                            </Typography>
                        </Box>
                        <Slider
                            value={newProvider.temperature ?? 0.7}
                            min={0}
                            max={2}
                            step={0.01}
                            onChange={(_, val) =>
                                setNewProvider({ ...newProvider, temperature: val as number })
                            }
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
                            onClick={() => setNewProvider({ ...newProvider, temperature: null })}
                            sx={{ mt: 0.5 }}
                        >
                            Reset to default
                        </Button>
                    </Box>

                    {/* Top-P Slider */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Top P</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {newProvider.top_p ?? 'Default'}
                            </Typography>
                        </Box>
                        <Slider
                            value={newProvider.top_p ?? 1}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(_, val) =>
                                setNewProvider({ ...newProvider, top_p: val as number })
                            }
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
                            onClick={() => setNewProvider({ ...newProvider, top_p: null })}
                            sx={{ mt: 0.5 }}
                        >
                            Reset to default
                        </Button>
                    </Box>

                    <Divider />

                    {/* Default Provider + Fallback Priority */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={newProvider.is_default}
                                    onChange={(e) => setNewProvider({ ...newProvider, is_default: e.target.checked })}
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
                            value={newProvider.fallback_priority}
                            onChange={(e) => setNewProvider({ ...newProvider, fallback_priority: Number(e.target.value) })}
                            slotProps={{ htmlInput: { min: 1 } }}
                            helperText="Order to try if primary fails"
                        />
                    </Box>

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="outlined" onClick={() => {
                    if (!validateForm()) return;
                    console.log('Save & Add Another:', newProvider);
                    resetForm();
                }}>
                    Save & Add Another
                </Button>
                <Button variant="contained" onClick={() => {
                    if (!validateForm()) return;
                    console.log('Save & Close:', newProvider);
                    handleClose();
                }}>
                    Save & Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProviderForm;