import { Box, Dialog, DialogActions,
    DialogContent, DialogTitle, TextField,
    InputLabel, FormControl, Select,
    MenuItem, Typography, Button, Switch, FormControlLabel, Checkbox} from "@mui/material";
import { useState, useEffect } from "react";
import { UserRow } from "../../mocks/data/users";

interface UserFormProps {
    open: boolean;
    onClose: () => void;
    editUser?: UserRow | null;
    existingEmails?: string[];
}

const defaultState = {
    name: '',
    email: '',
    role: '',
    custom_permissions: [] as string[],
    status: 'Active',
    token_limit: 100000,
};

const UserForm: React.FC<UserFormProps> = ({ open, onClose, editUser, existingEmails }) => {

    const [formData, setFormData] = useState(defaultState);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [hasCustomTokenLimit, setHasCustomTokenLimit] = useState(false);

    useEffect(() => {
        if (editUser) {
            const hasLimit = editUser.token_limit != null && editUser.token_limit > 0;
            setHasCustomTokenLimit(hasLimit);
            setFormData({
                name: editUser.display_name ?? '',
                email: editUser.email ?? '',
                role: editUser.role ?? '',
                custom_permissions: editUser.custom_permissions ?? [],
                status: editUser.status === 'active' ? 'Active' : 'Inactive',
                token_limit: editUser.token_limit ?? 100000,
            });
        } else {
            setHasCustomTokenLimit(false);
            setFormData(defaultState);
        }
        setFormErrors({});
    }, [editUser, open]);

    const clearFieldError = (field: string) => {
        if (formErrors[field]) {
            setFormErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        else if (
            existingEmails &&
            formData.email.toLowerCase() !== editUser?.email?.toLowerCase() &&
            existingEmails.map(e => e.toLowerCase()).includes(formData.email.toLowerCase())
        ) errors.email = 'This email is already in use';
        if (!formData.role) errors.role = 'Role is required';
        if (formData.custom_permissions.length === 0 || !formData.custom_permissions[0]?.trim())
            errors.custom_permissions = 'At least one permission is required';
        if (hasCustomTokenLimit && (!formData.token_limit || formData.token_limit <= 0))
            errors.token_limit = 'Token limit must be greater than 0';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData(defaultState);
        setFormErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isEditMode = Boolean(editUser);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                    <TextField
                        label="Name"
                        required
                        fullWidth
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            clearFieldError('name');
                        }}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        required
                        fullWidth
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            clearFieldError('email');
                        }}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                    />

                    <FormControl fullWidth required error={!!formErrors.role}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            label="Role"
                            onChange={(e) => {
                                setFormData({ ...formData, role: e.target.value });
                                clearFieldError('role');
                            }}
                        >
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="DEVELOPER">Developer</MenuItem>
                            <MenuItem value="VIEWER">Viewer</MenuItem>
                            <MenuItem value="USER">User</MenuItem>
                        </Select>
                        {formErrors.role && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                {formErrors.role}
                            </Typography>
                        )}
                    </FormControl>

                    <TextField
                        label="Custom Permissions"
                        type="text"
                        required
                        fullWidth
                        value={formData.custom_permissions[0] ?? ''}
                        onChange={(e) => {
                            setFormData({ ...formData, custom_permissions: [e.target.value] });
                            clearFieldError('custom_permissions');
                        }}
                        error={!!formErrors.custom_permissions}
                        helperText={formErrors.custom_permissions}
                    />

                    <Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={hasCustomTokenLimit}
                                    onChange={(e) => {
                                        setHasCustomTokenLimit(e.target.checked);
                                        clearFieldError('token_limit');
                                    }}
                                />
                            }
                            label="Set custom token limit"
                        />
                        {hasCustomTokenLimit && (
                            <TextField
                                label="Token Limit"
                                type="number"
                                required
                                fullWidth
                                value={formData.token_limit}
                                onChange={(e) => {
                                    setFormData({ ...formData, token_limit: Number(e.target.value) });
                                    clearFieldError('token_limit');
                                }}
                                error={!!formErrors.token_limit}
                                helperText={formErrors.token_limit}
                                slotProps={{ htmlInput: { min: 1 } }}
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.status === 'Active'}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })
                                    }
                                    color="success"
                                />
                            }
                            label={
                                <Typography variant="body2" color={formData.status === 'Active' ? 'success.main' : 'text.secondary'}>
                                    {formData.status}
                                </Typography>
                            }
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                {!isEditMode && (
                    <Button variant="outlined" onClick={() => {
                        if (!validateForm()) return;
                        console.log('Adding user & adding another:', formData);
                        resetForm();
                    }}>
                        Save & Add Another
                    </Button>
                )}
                <Button variant="contained" onClick={() => {
                    if (!validateForm()) return;
                    console.log(isEditMode ? 'Updating user:' : 'Saving user:', formData);
                    handleClose();
                }}>
                    {isEditMode ? 'Save Changes' : 'Save & Close'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserForm;
