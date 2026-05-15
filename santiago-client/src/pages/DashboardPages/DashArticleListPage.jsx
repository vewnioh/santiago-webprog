import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, InputAdornment, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { fetchArticles, createArticle, updateArticle, deleteArticle } from '../../services/ArticleService';

const card = {
  p: 2.5, pl: 3, position: 'relative', overflow: 'hidden', transition: 'border-color .25s',
  '&:hover': { borderColor: 'rgba(251, 191, 36, 0.35)' },
  '&::before': { content: '""', position: 'absolute', top: 16, bottom: 16, left: 0, width: '2px', bgcolor: 'primary.main', opacity: 0.85 },
};
const num = { fontVariantNumeric: 'tabular-nums' };
const pulse = { '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.35, transform: 'scale(0.85)' } } };

const blankForm = {
  slug: '',
  title: '',
  genre: '',
  director: '',
  year: '',
  rating: '',
  paragraphs: '',
  preview: '',
  isActive: true,
};

const DashArticleListPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [modal, setModal] = useState({ open: false, id: null });
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { data } = await fetchArticles();
      setArticles(
        (data.articles || []).map((a) => ({ ...a, id: a._id }))
      );
      setApiError('');
    } catch {
      setApiError('Unable to load articles from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArticles(); }, []);

  const openModal = (article) => {
    setModal({ open: true, id: article?._id ?? null });
    setForm(article ? {
      slug: article.slug,
      title: article.title,
      genre: article.genre,
      director: article.director,
      year: String(article.year),
      rating: String(article.rating),
      paragraphs: String(article.paragraphs ?? ''),
      preview: article.preview ?? '',
      isActive: article.isActive,
    } : { ...blankForm });
    setErrors({});
  };

  const closeModal = () => {
    setModal({ open: false, id: null });
    setForm(blankForm);
    setErrors({});
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    [
      ['slug', 'Slug'],
      ['title', 'Title'],
      ['genre', 'Genre'],
      ['director', 'Director'],
      ['year', 'Year'],
      ['rating', 'Rating'],
    ].forEach(([key, label]) => {
      if (!String(form[key] ?? '').trim()) next[key] = `${label} is required.`;
    });
    if (!next.year && !/^\d{4}$/.test(form.year)) next.year = 'Year must be a 4-digit number.';
    if (!next.rating) {
      const r = Number(form.rating);
      if (isNaN(r) || r < 0 || r > 10) next.rating = 'Rating must be between 0 and 10.';
    }
    if (!next.slug && articles.some((a) => a.slug === form.slug && a._id !== modal.id)) {
      next.slug = 'Slug already exists.';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      genre: form.genre.trim(),
      director: form.director.trim(),
      year: Number(form.year),
      rating: Number(form.rating),
      paragraphs: Number(form.paragraphs) || 0,
      preview: form.preview.trim(),
      isActive: form.isActive,
    };

    try {
      if (modal.id) {
        await updateArticle(modal.id, payload);
      } else {
        await createArticle(payload);
      }
      await loadArticles();
      closeModal();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save article.' });
    }
  };

  const handleToggleStatus = async (article) => {
    try {
      await updateArticle(article._id, { isActive: !article.isActive });
      await loadArticles();
    } catch {
      setApiError('Failed to update article status.');
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

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (q) {
        const haystack = `${a.slug} ${a.title} ${a.director} ${a.genre}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter === 'active' && !a.isActive) return false;
      if (statusFilter === 'inactive' && a.isActive) return false;
      return true;
    });
  }, [articles, search, statusFilter]);

  const total = articles.length;
  const active = articles.filter((a) => a.isActive).length;
  const showing = filteredArticles.length;
  const kpis = [
    { label: 'Total Articles', value: total, hint: 'in database' },
    { label: 'Published', value: active, bar: total ? Math.round((active / total) * 100) : 0 },
    { label: 'Unpublished', value: total - active, hint: 'inactive' },
    { label: 'Showing', value: showing, hint: 'after filters' },
  ];

  const columns = [
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 140 },
    { field: 'title', headerName: 'Title', flex: 1.5, minWidth: 180 },
    { field: 'genre', headerName: 'Genre', flex: 1, minWidth: 140 },
    { field: 'director', headerName: 'Director', flex: 1, minWidth: 140 },
    { field: 'year', headerName: 'Year', width: 80 },
    { field: 'rating', headerName: 'Rating', width: 90, valueGetter: (_, row) => `${row.rating}/10` },
    { field: 'paragraphs', headerName: 'Paragraphs', width: 110 },
    { field: 'preview', headerName: 'Preview', flex: 2, minWidth: 200,
      valueGetter: (_, row) => row.preview || '—',
      renderCell: (p) => (
        <Typography variant="caption" color="text.secondary" noWrap>
          {p.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      sortable: false,
      renderCell: (p) => (
        <Chip
          size="small"
          label={p.row.isActive ? 'Active' : 'Inactive'}
          color={p.row.isActive ? 'success' : 'default'}
          variant={p.row.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} sx={{ py: 0.3 }}>
          <Button size="small" variant="outlined" onClick={() => openModal(p.row)}>Edit</Button>
          <Button
            size="small"
            variant="contained"
            disableElevation
            color={p.row.isActive ? 'warning' : 'success'}
            onClick={() => handleToggleStatus(p.row)}
          >
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
          <Typography variant="overline" color="primary">Screening Room / Archive</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4">Articles</Typography>
            <Typography variant="overline" color="text.secondary" sx={num}>
              {active} published · {total - active} unpublished
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            startIcon={<NoteAddIcon sx={{ fontSize: 18 }} />}
            onClick={() => openModal()}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            Add Article
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
                  <Box sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: '#1c1c20', overflow: 'hidden' }}>
                    <Box sx={{ width: `${k.bar}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 999 }} />
                  </Box>
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
          <Typography variant="overline" color="text.secondary">Filter Articles</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth size="small"
              placeholder="Search by slug, title, director, or genre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField select fullWidth size="small" label="Status"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button fullWidth variant="outlined" size="small"
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              sx={{ height: '100%' }}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 1.5 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Article Ledger</Typography>
      </Divider>

      <Box sx={{ height: 520, mt: 2 }}>
        {filteredArticles.length ? (
          <DataGrid
            rows={filteredArticles}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            rowHeight={60}
          />
        ) : (
          <Alert severity="info">
            {loading ? 'Loading articles…' : 'No articles match the current filters.'}
          </Alert>
        )}
      </Box>

      <Dialog open={modal.open} onClose={closeModal} fullWidth fullScreen={isMobile} maxWidth="md">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle>{modal.id ? 'Edit Article' : 'Add Article'}</DialogTitle>
          <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, pt: 1 }}>
            {errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('slug', 'Slug')} />
                <TextField {...fieldProps('title', 'Title')} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('genre', 'Genre')} />
                <TextField {...fieldProps('director', 'Director')} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField {...fieldProps('year', 'Year', { inputMode: 'numeric', slotProps: { htmlInput: { maxLength: 4 } } })} />
                <TextField {...fieldProps('rating', 'Rating (0–10)', { inputMode: 'decimal' })} />
                <TextField {...fieldProps('paragraphs', 'Paragraphs', { inputMode: 'numeric' })} />
              </Stack>
              <TextField {...fieldProps('preview', 'Preview Text', { multiline: true, rows: 3 })} />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Chip
                  size="small"
                  label={form.isActive ? 'Active' : 'Inactive'}
                  color={form.isActive ? 'success' : 'default'}
                  variant={form.isActive ? 'filled' : 'outlined'}
                  onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  sx={{ cursor: 'pointer' }}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation>
              {modal.id ? 'Update Article' : 'Save Article'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DashArticleListPage;
