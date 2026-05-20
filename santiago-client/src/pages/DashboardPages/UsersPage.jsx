import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControlLabel, Grid, IconButton, InputAdornment, LinearProgress, MenuItem,
  Paper, Stack, Switch, TextField, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../services/UserService';

const card = {
  p: 2.5, pl: 3, position: 'relative', overflow: 'hidden', transition: 'border-color .25s',
  '&:hover': { borderColor: 'rgba(251, 191, 36, 0.35)' },
  '&::before': { content: '""', position: 'absolute', top: 16, bottom: 16, left: 0, width: '2px', bgcolor: 'primary.main', opacity: 0.85 },
};
const num = { fontVariantNumeric: 'tabular-nums' };
const pulse = { '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.35, transform: 'scale(0.85)' } } };

const roles = ['admin', 'editor', 'viewer'];
const genders = ['male', 'female', 'other'];

const blankForm = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  contactNumber: '',
  email: '',
  type: 'editor',
  username: '',
  password: '',
  address: '',
  isActive: true,
};

const labelize = (value) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';

const initials = (first, last) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';

const tierByRole = { admin: 'primary', editor: 'secondary', viewer: 'default' };

const UsersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Enhancement 1: editors cannot access this page
  useEffect(() => {
    const userType = localStorage.getItem('type');
    if (userType === 'editor') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await fetchUsers();
      setUsers(
        (data.users || []).map((u) => ({ ...u, id: u._id }))
      );
      setApiError('');
    } catch {
      setApiError('Unable to load users from the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers()
      .then(({ data }) => {
        setUsers((data.users || []).map((u) => ({ ...u, id: u._id })));
        setApiError('');
      })
      .catch(() => setApiError('Unable to load users from the server. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const openModal = (user) => {
    setModal({ open: true, id: user?._id ?? null });
    setForm(user ? { ...blankForm, ...user, type: user.type || 'editor', password: '' } : { ...blankForm });
    setErrors({});
  };

  const closeModal = () => {
    setModal({ open: false, id: null });
    setShowPassword(false);
    setForm(blankForm);
    setErrors({});
  };

  const handleChange = ({ target: { name, value, checked, type } }) => {
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const email = form.email.trim().toLowerCase();
    const username = form.username.trim().toLowerCase();
    const contact = form.contactNumber.trim();
    const age = form.age.trim();

    [
      ['firstName', 'First name'],
      ['lastName', 'Last name'],
      ['age', 'Age'],
      ['gender', 'Gender'],
      ['contactNumber', 'Contact number'],
      ['email', 'Email'],
      ['type', 'Role'],
      ['username', 'Username'],
      ['address', 'Address'],
    ].forEach(([key, label]) => {
      if (!String(form[key] ?? '').trim()) next[key] = `${label} is required.`;
    });

    if (!modal.id && !form.password.trim()) next.password = 'Password is required.';
    if (!next.password && form.password && form.password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }

    if (!next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address.';
    }
    if (!next.email && users.some((u) => u._id !== modal.id && u.email === email)) {
      next.email = 'Email address already exists.';
    }
    if (!next.username && /\s/.test(form.username)) {
      next.username = 'Username must not contain spaces.';
    }
    if (!next.username && users.some((u) => u._id !== modal.id && u.username === username)) {
      next.username = 'Username already exists.';
    }
    if (!next.contactNumber && !/^\d{11}$/.test(contact)) {
      next.contactNumber = 'Contact number must be exactly 11 digits.';
    }
    if (!next.age && !/^\d+$/.test(age)) {
      next.age = 'Age must be a number only.';
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      age: form.age.trim(),
      gender: form.gender.trim().toLowerCase(),
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim().toLowerCase(),
      type: form.type.trim().toLowerCase(),
      username: form.username.trim().toLowerCase(),
      address: form.address.trim(),
      isActive: form.isActive,
    };
    if (form.password) payload.password = form.password;

    try {
      if (modal.id) {
        await updateUser(modal.id, payload);
      } else {
        await createUser(payload);
      }
      await loadUsers();
      closeModal();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save user.' });
    }
  };

  const toggleStatus = async (user) => {
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      await loadUsers();
    } catch {
      setApiError('Failed to update user status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch {
      setApiError('Failed to delete user.');
    }
  };

  const fieldProps = (name, label, extra = {}) => ({
    name,
    label,
    value: form[name],
    onChange: handleChange,
    error: Boolean(errors[name]),
    helperText: errors[name] || ' ',
    fullWidth: true,
    size: 'small',
    ...extra,
  });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const haystack = `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (roleFilter !== 'all' && u.type !== roleFilter) return false;
      if (genderFilter !== 'all' && u.gender !== genderFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;
      return true;
    });
  }, [users, search, roleFilter, genderFilter, statusFilter]);

  const total = users.length;
  const active = users.filter((u) => u.isActive).length;
  const admins = users.filter((u) => u.type === 'admin').length;
  const showing = filteredUsers.length;
  const kpis = [
    { label: 'Cardholders', value: total, hint: 'full roster' },
    { label: 'On the Floor', value: active, bar: total ? Math.round((active / total) * 100) : 0 },
    { label: 'Admins', value: admins, hint: 'press-credentialed' },
    { label: 'Showing', value: showing, hint: 'after filters' },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 80,
      valueGetter: (_, row) => String(row._id || '').slice(-6).toUpperCase() },
    {
      field: 'fullName', headerName: 'Member', flex: 1.4, minWidth: 240,
      valueGetter: (_, row) => `${row.firstName} ${row.lastName}`.trim(),
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
          <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
            {initials(p.row.firstName, p.row.lastName)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{`${p.row.firstName} ${p.row.lastName}`}</Typography>
            <Typography variant="caption" color="text.secondary">{p.row.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    { field: 'username', headerName: 'Username', minWidth: 140, flex: 0.8 },
    { field: 'age', headerName: 'Age', width: 80 },
    { field: 'gender', headerName: 'Gender', width: 110, valueGetter: (_, row) => labelize(row.gender) },
    { field: 'contactNumber', headerName: 'Contact', minWidth: 140, flex: 0.9 },
    {
      field: 'type', headerName: 'Role', width: 120,
      renderCell: (p) => <Chip label={labelize(p.row.type)} size="small" color={tierByRole[p.row.type]} variant="outlined" />,
    },
    {
      field: 'status', headerName: 'Status', width: 120, sortable: false,
      renderCell: (p) => (
        <Chip size="small" label={p.row.isActive ? 'Active' : 'Inactive'}
          color={p.row.isActive ? 'success' : 'default'}
          variant={p.row.isActive ? 'filled' : 'outlined'} />
      ),
    },
    {
      field: 'actions', headerName: 'Actions', minWidth: 200, sortable: false, filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} sx={{ py: 0.3 }}>
          <Button size="small" variant="outlined" onClick={() => openModal(p.row)}>Edit</Button>
          <Button size="small" variant="contained" disableElevation
            color={p.row.isActive ? 'warning' : 'success'}
            onClick={() => toggleStatus(p.row)}>
            {p.row.isActive ? 'Disable' : 'Activate'}
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider',
        backgroundImage: 'radial-gradient(520px circle at 0% 100%, rgba(251,191,36,0.09), transparent 55%)',
        mx: -3, px: 3, pt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.2} mb={0.8}>
          <Box sx={{ ...pulse, width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 10px #fbbf24', animation: 'pulse 2s ease-in-out infinite' }} />
          <Typography variant="overline" color="primary">House / Roster</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4">The House</Typography>
            <Typography variant="overline" color="text.secondary" sx={num}>
              {active} in seats · {total - active} at intermission
            </Typography>
          </Box>
          <Button variant="contained" disableElevation
            startIcon={<PersonAddAlt1Icon sx={{ fontSize: 18 }} />}
            onClick={() => openModal()}
            sx={{ width: { xs: '100%', md: 'auto' } }}>
            Add User
          </Button>
        </Stack>
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}

      <Grid container spacing={3} mb={3}>
        {kpis.map((k) => (
          <Grid size={{ xs: 6, md: 3 }} key={k.label}>
            <Paper sx={card}>
              <Typography variant="overline" color="text.secondary">{k.label}</Typography>
              <Typography variant="h3" sx={num}>{k.value}</Typography>
              {k.bar != null ? (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={k.bar} sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={num}>{k.bar}%</Typography>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '.1em', textTransform: 'uppercase' }}>{k.hint}</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.2} mb={1.5}>
          <FilterAltIcon sx={{ color: 'primary.main', fontSize: 18 }} />
          <Typography variant="overline" color="text.secondary">Filter Roster</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField fullWidth size="small"
              placeholder="Search by first name, last name, email, or username…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField select fullWidth size="small" label="Role"
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <MenuItem value="all">All roles</MenuItem>
              {roles.map((r) => <MenuItem key={r} value={r}>{labelize(r)}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField select fullWidth size="small" label="Gender"
              value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <MenuItem value="all">All genders</MenuItem>
              {genders.map((g) => <MenuItem key={g} value={g}>{labelize(g)}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField select fullWidth size="small" label="Status"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <Button fullWidth variant="outlined" size="small"
              onClick={() => { setSearch(''); setRoleFilter('all'); setGenderFilter('all'); setStatusFilter('all'); }}
              sx={{ height: '100%' }}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 1.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Member Ledger</Typography>
      </Divider>

      <Box sx={{ height: 520, mt: 2 }}>
        {filteredUsers.length ? (
          <DataGrid rows={filteredUsers} columns={columns} loading={loading}
            disableRowSelectionOnClick pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            rowHeight={60} />
        ) : (
          <Alert severity="info">
            {loading ? 'Loading users…' : 'No users match the current filters.'}
          </Alert>
        )}
      </Box>

      <Dialog open={modal.open} onClose={closeModal} fullWidth fullScreen={isMobile} maxWidth="md">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle>{modal.id ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, pt: 1 }}>
            {errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('firstName', 'First Name')} />
                <TextField {...fieldProps('lastName', 'Last Name')} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('age', 'Age', { inputMode: 'numeric', slotProps: { htmlInput: { pattern: '[0-9]*', maxLength: 3 } } })} />
                <TextField {...fieldProps('gender', 'Gender', { select: true })}>
                  {genders.map((g) => <MenuItem key={g} value={g}>{labelize(g)}</MenuItem>)}
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('contactNumber', 'Contact Number', { inputMode: 'numeric', slotProps: { htmlInput: { pattern: '[0-9]*', maxLength: 11 } } })} />
                <TextField {...fieldProps('email', 'Email Address', { type: 'email' })} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('type', 'Role', { select: true })}>
                  {roles.map((r) => <MenuItem key={r} value={r}>{labelize(r)}</MenuItem>)}
                </TextField>
                <TextField {...fieldProps('username', 'Username')} />
              </Stack>
              <TextField {...fieldProps('password', modal.id ? 'Password (leave blank to keep)' : 'Password', {
                type: showPassword ? 'text' : 'password',
                slotProps: {
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end"
                          onClick={() => setShowPassword((prev) => !prev)}
                          onMouseDown={(e) => e.preventDefault()}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                },
              })} />
              <TextField {...fieldProps('address', 'Address', { multiline: true, rows: 3 })} />
              <FormControlLabel
                control={<Switch name="isActive" checked={form.isActive} onChange={handleChange} />}
                label={form.isActive ? 'User status: Active' : 'User status: Inactive'} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation>
              {modal.id ? 'Update User' : 'Save User'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
