import {
    Table, TableHead, TableBody, TableRow,
    TableCell, TableContainer, Pagination, Box, Tooltip, IconButton,
    FormControl, FormControlLabel, InputLabel, Select, MenuItem, SelectChangeEvent,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, Checkbox, Toolbar, Typography, alpha, TableSortLabel
} from '@mui/material';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { ChangeEvent, useState, useMemo } from 'react';

import UserDetails from './UserDetails';
import { UserRow } from '../../mocks/data/users';

interface filterUser {
    searchUser: UserRow[]
    role: string
    onEdit: (user: UserRow) => void
}

type Order = 'asc' | 'desc';
type SortableColumn = 'display_name' | 'email' | 'status' | 'last_login' | 'token_limit' | 'current_usage';

interface HeadCell {
    id: SortableColumn;
    label: string;
    width: number;
}

const headCells: HeadCell[] = [
    { id: 'display_name', label: 'Name', width: 160 },
    { id: 'email', label: 'Email', width: 180 },
    { id: 'status', label: 'Status', width: 100 },
    { id: 'last_login', label: 'Last Login', width: 120 },
    { id: 'token_limit', label: 'Token Limit', width: 120 },
    { id: 'current_usage', label: 'Current Usage', width: 130 },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (bValue == null && aValue == null) return 0;
    if (bValue == null) return -1;
    if (aValue == null) return 1;

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
}

function getComparator<Key extends keyof UserRow>(
    order: Order,
    orderBy: Key
): (a: UserRow, b: UserRow) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const UserList = ({ searchUser, role, onEdit }: filterUser) => {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [openUser, setOpenUser] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
    const [bulkStatusAction, setBulkStatusAction] = useState<'activate' | 'deactivate' | null>(null);
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [bulkDeleteConfirmed, setBulkDeleteConfirmed] = useState(false);

    // Sorting state
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<SortableColumn>('display_name');

    const filteredUsers = useMemo(() =>
        searchUser.filter(user => {
            if (!role || role.toLowerCase() === 'all') return true;
            return user.role?.toLowerCase() === role.toLowerCase();
        }),
        [searchUser, role]
    );

    // Sort and paginate users
    const sortedAndPaginatedUsers = useMemo(() => {
        const sorted = [...filteredUsers].sort(getComparator(order, orderBy));
        return sorted.slice(
            (page - 1) * rowsPerPage,
            (page - 1) * rowsPerPage + rowsPerPage
        );
    }, [filteredUsers, order, orderBy, page, rowsPerPage]);

    const handleRequestSort = (property: SortableColumn) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_event: ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
        setRowsPerPage(Number(event.target.value));
        setPage(1);
    };

    const handleDeleteClick = (user: UserRow) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setDeleteConfirmed(false);
    };

    // Bulk selection handlers
    const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(sortedAndPaginatedUsers.map(u => u.email));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isAllSelected = sortedAndPaginatedUsers.length > 0 &&
        sortedAndPaginatedUsers.every(u => selectedIds.includes(u.email));

    const isIndeterminate = sortedAndPaginatedUsers.some(u => selectedIds.includes(u.email)) && !isAllSelected;

    const handleBulkDeleteConfirm = () => {
        console.log('Deleting users:', selectedIds);
        setSelectedIds([]);
        setBulkDeleteDialogOpen(false);
        setBulkDeleteConfirmed(false);
    };

    const handleBulkStatusConfirm = () => {
        console.log(`${bulkStatusAction === 'activate' ? 'Activating' : 'Deactivating'} users:`, selectedIds);
        setSelectedIds([]);
        setBulkStatusDialogOpen(false);
        setBulkStatusAction(null);
    };

    return (
        <>
            {/* Bulk Action Toolbar */}
            {selectedIds.length > 0 && (
                <Toolbar
                    sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        borderRadius: 1,
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Typography variant="subtitle2" color="primary" fontWeight={600}>
                        {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Activate Selected">
                            <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() => { setBulkStatusAction('activate'); setBulkStatusDialogOpen(true); }}
                            >
                                Activate
                            </Button>
                        </Tooltip>
                        <Tooltip title="Deactivate Selected">
                            <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                startIcon={<BlockIcon />}
                                onClick={() => { setBulkStatusAction('deactivate'); setBulkStatusDialogOpen(true); }}
                            >
                                Deactivate
                            </Button>
                        </Tooltip>
                        <Tooltip title="Delete Selected">
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<DeleteSweepIcon />}
                                onClick={() => setBulkDeleteDialogOpen(true)}
                            >
                                Delete Selected
                            </Button>
                        </Tooltip>
                    </Box>
                </Toolbar>
            )}

            <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {headCells.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                sx={{
                                    width: headCell.width,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    backgroundColor: '#94bfff',
                                    '&:hover': {
                                        backgroundColor: '#7aafff',
                                    },
                                }}
                                sortDirection={orderBy === headCell.id ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={orderBy === headCell.id ? order : 'asc'}
                                    onClick={() => handleRequestSort(headCell.id)}
                                >
                                    {headCell.label}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                        <TableCell sx={{ width: 100, fontWeight: 600, backgroundColor: '#94bfff' }}>Action</TableCell>
                        <TableCell padding="checkbox" sx={{ backgroundColor: '#94bfff' }}>
                            <Checkbox
                                size="small"
                                checked={isAllSelected}
                                indeterminate={isIndeterminate}
                                onChange={handleSelectAll}
                            />
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {sortedAndPaginatedUsers.map((row, index) => (
                        <TableRow
                            key={row.email || index}
                            onClick={() => {
                                setOpenUser(true);
                                setSelectedUser(row);
                            }}
                            selected={selectedIds.includes(row.email)}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: selectedIds.includes(row.email)
                                    ? (theme) => alpha(theme.palette.primary.main, 0.06)
                                    : 'inherit',
                                '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04)
                                }
                            }}
                        >
                            <TableCell sx={{ width: 160 }}>{row.display_name}</TableCell>
                            <TableCell sx={{ width: 180 }}>{row.email}</TableCell>
                            <TableCell sx={{ width: 100 }}>{row.status}</TableCell>
                            <TableCell sx={{ width: 120 }}>{row.last_login ?? 'Never'}</TableCell>
                            <TableCell sx={{ width: 120 }}>{row.token_limit?.toLocaleString() ?? '—'}</TableCell>
                            <TableCell sx={{ width: 130 }}>{row.current_usage?.toLocaleString() ?? '—'}</TableCell>
                            <TableCell sx={{ width: 100 }}>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="Edit User">
                                        <IconButton size="small" color="primary"
                                            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete User">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(row);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    size="small"
                                    checked={selectedIds.includes(row.email)}
                                    onChange={(e) => handleSelectOne(e, row.email)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2,
                p: 1,
                mt: 1
            }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="rows-per-page-label">Rows</InputLabel>
                    <Select
                        labelId="rows-per-page-label"
                        value={rowsPerPage}
                        label="Rows"
                        onChange={handleChangeRowsPerPage}
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                    </Select>
                </FormControl>
                <Pagination
                    count={Math.ceil(filteredUsers.length / rowsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>

            {/* Single Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Delete User
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{userToDelete?.display_name}</strong> ({userToDelete?.email})?
                        This action cannot be undone. All usage history will be retained but anonymized.
                    </DialogContentText>
                    <FormControlLabel
                        sx={{ mt: 2 }}
                        control={
                            <Checkbox
                                checked={deleteConfirmed}
                                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                                color="error"
                                size="small"
                            />
                        }
                        label={
                            <Typography variant="body2" color="error">
                                I confirm this action is irreversible
                            </Typography>
                        }
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={!deleteConfirmed}
                        onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmed(false); }}
                    >
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => { setBulkDeleteDialogOpen(false); setBulkDeleteConfirmed(false); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Delete {selectedIds.length} Users
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{selectedIds.length} selected users</strong>?
                        This action cannot be undone. All usage history will be retained but anonymized.
                    </DialogContentText>
                    <FormControlLabel
                        sx={{ mt: 2 }}
                        control={
                            <Checkbox
                                checked={bulkDeleteConfirmed}
                                onChange={(e) => setBulkDeleteConfirmed(e.target.checked)}
                                color="error"
                                size="small"
                            />
                        }
                        label={
                            <Typography variant="body2" color="error">
                                I confirm this action is irreversible
                            </Typography>
                        }
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setBulkDeleteDialogOpen(false); setBulkDeleteConfirmed(false); }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={!bulkDeleteConfirmed}
                        onClick={handleBulkDeleteConfirm}
                    >
                        Delete {selectedIds.length} Users
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Activate / Deactivate Dialog */}
            <Dialog open={bulkStatusDialogOpen} onClose={() => setBulkStatusDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {bulkStatusAction === 'activate'
                        ? <CheckCircleOutlineIcon color="success" />
                        : <BlockIcon color="warning" />
                    }
                    {bulkStatusAction === 'activate' ? 'Activate' : 'Deactivate'} {selectedIds.length} Users
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to <strong>{bulkStatusAction}</strong> {selectedIds.length} selected user{selectedIds.length > 1 ? 's' : ''}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setBulkStatusDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={bulkStatusAction === 'activate' ? 'success' : 'warning'}
                        onClick={handleBulkStatusConfirm}
                    >
                        {bulkStatusAction === 'activate' ? 'Activate' : 'Deactivate'} {selectedIds.length} Users
                    </Button>
                </DialogActions>
            </Dialog>

            <UserDetails
                open={openUser}
                onClose={() => setOpenUser(false)}
                User={selectedUser}
                onEdit={() => { setOpenUser(false); onEdit(selectedUser); }}
            />
        </>
    );
};

export default UserList;