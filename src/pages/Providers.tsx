import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    InputAdornment,
    Paper,
    Skeleton,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';

import ProviderList from '../components/providers/ProviderList';
import { Providersdata, LLMProvider } from '../mocks/data/providers';
import ProviderForm from '../components/providers/ProviderForm';
import { ProviderHealthData } from '../components/providers/ProviderList';
import { useAuth } from '../context/AuthContext';

function ProviderPage() {
    const { isSuperAdmin } = useAuth();

    const [searchProvider, setSearchProvider] = useState<LLMProvider[]>([]);
    const [openForm, setOpenForm] = useState(false);
    const [healthData, setHealthData] = useState<Record<string, ProviderHealthData>>({});
    const [loading, setLoading] = useState(true);

    // Generate mock health data for providers
    const generateHealthData = (_providerId: string): ProviderHealthData => {
        const statuses: Array<'healthy' | 'degraded' | 'down'> = ['healthy', 'healthy', 'healthy', 'degraded', 'down'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const baseUptime = status === 'healthy' ? 99.5 : status === 'degraded' ? 96 : 85;
        
        return {
            status,
            lastChecked: new Date(),
            uptime: {
                last24h: baseUptime + Math.random() * 0.5,
                last7d: baseUptime - 0.2 + Math.random() * 0.4,
                last30d: baseUptime - 0.5 + Math.random() * 0.5,
            },
            avgResponseTime: status === 'healthy' ? 300 + Math.random() * 100 : 800 + Math.random() * 500,
            errorRate: status === 'healthy' ? Math.random() * 1 : Math.random() * 5,
        };
    };

    // Initialize providers and health data
    useEffect(() => {
        const timer = setTimeout(() => {
            const initialHealthData: Record<string, ProviderHealthData> = {};
            Providersdata.forEach((provider: LLMProvider) => {
                const id = provider._id.$oid;
                initialHealthData[id] = generateHealthData(id);
            });
            setSearchProvider(Providersdata);
            setHealthData(initialHealthData);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleRefreshProviderHealth = (providerId: string) => {
        setHealthData(prev => ({
            ...prev,
            [providerId]: generateHealthData(providerId),
        }));
    };

    const handleTestConnection = (providerId: string) => {
        console.log('Test connection for:', providerId);
        // Simulate test - you can add snackbar notification here
    };

    const handleDeleteProvider = (providerId: string) => {
        console.log('Delete provider:', providerId);
        // Add delete logic here
    };

    const filterProvider = (e: string) => {
        const filtered = Providersdata.filter(
            (provider: LLMProvider) => provider.provider?.toLowerCase().includes(e?.toLowerCase() ?? '')
        );
        setSearchProvider(filtered);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width={200} height={44} />
                        <Skeleton variant="text" width={320} height={24} />
                    </Box>
                    <Skeleton variant="rounded" width={130} height={36} />
                </Box>
                <Skeleton variant="rounded" height={64} sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={400} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={600} gutterBottom>
                        LLM Providers
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Configure and monitor LLM provider connections.
                    </Typography>
                </Box>
                {isSuperAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenForm(true)}
                    >
                        Add Provider
                    </Button>
                )}
            </Box>

            {/* Search */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
                <TextField
                    placeholder="Search..."
                    size="small"
                    sx={{ flex: 1 }}
                    onChange={(e) => { filterProvider(e.target.value) }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Paper>

            {/* Provider List */}
            <ProviderList
                SearchProvider={searchProvider}
                healthData={healthData}
                onRefreshHealth={handleRefreshProviderHealth}
                onTestConnection={handleTestConnection}
                onDelete={handleDeleteProvider}
            />

            {/* Add Provider Form */}
            <ProviderForm open={openForm} onClose={() => setOpenForm(false)} />
        </Box>
    );
}

export default ProviderPage;