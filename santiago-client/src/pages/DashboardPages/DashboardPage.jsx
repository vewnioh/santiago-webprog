import { Typography, Grid, Paper, Box, Stack, Chip, Divider } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { DataGrid } from '@mui/x-data-grid';
import StarRateIcon from '@mui/icons-material/StarRate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const venues = [
  { id: 1, name: 'Vault Cinema · Makati',   pos: [14.5547, 121.0244], showing: 'Whiplash' },
  { id: 2, name: 'Reel House · BGC',        pos: [14.5507, 121.0510], showing: 'The Martian' },
  { id: 3, name: 'Marquee · Quezon City',   pos: [14.6488, 121.0509], showing: 'Dead Poets Society' },
  { id: 4, name: 'Lumière · Pasay',         pos: [14.5378, 120.9819], showing: 'Oblivion' },
];

const card = {
  p: 2.5, pl: 3, position: 'relative', overflow: 'hidden', transition: 'border-color .25s, transform .25s',
  '&:hover': { borderColor: 'rgba(251, 191, 36, 0.35)' },
  '&::before': { content: '""', position: 'absolute', top: 16, bottom: 16, left: 0, width: '2px', bgcolor: 'primary.main', opacity: 0.85 },
};
const num = { fontVariantNumeric: 'tabular-nums' };
const pulse = { '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.35, transform: 'scale(0.85)' } } };

const SectionLabel = ({ reel, children }) => (
  <Typography variant="overline" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box component="span" sx={{ color: 'primary.main', letterSpacing: '.22em' }}>REEL {reel}</Box>
    <Box component="span" sx={{ width: 18, height: '1px', bgcolor: 'divider' }} />
    {children}
  </Typography>
);

const columns = [
  { field: 'id', headerName: '#', width: 60 },
  { field: 'title', headerName: 'Title', flex: 1.4, minWidth: 200, editable: true },
  { field: 'director', headerName: 'Director', flex: 1.1, minWidth: 160, editable: true },
  { field: 'year', headerName: 'Year', type: 'number', width: 80, editable: true },
  {
    field: 'rating', headerName: 'Rating', type: 'number', width: 110,
    renderCell: (p) => (
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
        <StarRateIcon fontSize="small" color="primary" />
        <Typography variant="body2" sx={num}>{p.value?.toFixed(1)}</Typography>
      </Stack>
    ),
  },
  { field: 'genre', headerName: 'Genre', width: 130, renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" /> },
];

const rows = [
  { id: 1, title: 'Dead Poets Society',     director: 'Peter Weir',         year: 1989, rating: 9.5, genre: 'Drama' },
  { id: 2, title: 'The Sixth Sense',        director: 'M. Night Shyamalan', year: 1999, rating: 9.0, genre: 'Thriller' },
  { id: 3, title: '13 Going on 30',         director: 'Gary Winick',        year: 2004, rating: 8.0, genre: 'Rom-Com' },
  { id: 4, title: 'Oblivion',               director: 'Joseph Kosinski',    year: 2013, rating: 7.5, genre: 'Sci-Fi' },
  { id: 5, title: 'The Amazing Spider-Man', director: 'Marc Webb',          year: 2012, rating: 7.5, genre: 'Action' },
  { id: 6, title: 'The Martian',            director: 'Ridley Scott',       year: 2015, rating: 8.4, genre: 'Sci-Fi' },
  { id: 7, title: 'Whiplash',               director: 'Damien Chazelle',    year: 2014, rating: 9.2, genre: 'Drama' },
];

const DashboardPage = () => {
  const avg = (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1);
  const kpis = [
    { label: 'Films in Vault', value: rows.length, delta: '+2 this week' },
    { label: 'Avg Rating',     value: avg,         delta: 'Δ +0.3' },
  ];
  const gauges = [{ label: 'Seat Occupancy', v: 72 }, { label: "Tonight's Check-in", v: 86 }];

  return (
    <Box>
      <Box sx={{ mb: 3.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider',
        backgroundImage: 'radial-gradient(520px circle at 0% 100%, rgba(251,191,36,0.09), transparent 55%)',
        mx: -3, px: 3, pt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.2} mb={0.8}>
          <Box sx={{ ...pulse, width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 10px #fbbf24', animation: 'pulse 2s ease-in-out infinite' }} />
          <Typography variant="overline" color="primary">Projection Booth / Overview</Typography>
        </Stack>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" flexWrap="wrap" sx={{ width: '100%', rowGap: 0.5 }}>
          <Typography variant="h4">Tonight's Run</Typography>
          <Typography variant="overline" color="text.secondary" sx={num}>Wed · 24 Apr 2026 · 21:42</Typography>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {kpis.map((k) => (
          <Grid size={{ xs: 6, md: 3 }} key={k.label}>
            <Paper sx={{ ...card, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="overline" color="text.secondary">{k.label}</Typography>
              <Typography variant="h3" sx={num}>{k.value}</Typography>
              <Stack direction="row" alignItems="center" spacing={0.4} sx={{ color: 'success.main', mt: 'auto', pt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" fontWeight={700} sx={num}>{k.delta}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
        {gauges.map((g) => (
          <Grid size={{ xs: 6, md: 3 }} key={g.label}>
            <Paper sx={{ ...card, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="overline" color="text.secondary">{g.label}</Typography>
              <Box sx={{ mx: 'auto', mt: 'auto' }}>
                <Gauge width={140} height={100} value={g.v} valueMin={0} valueMax={100}
                  sx={{ [`& .${gaugeClasses.valueText}`]: { fontSize: 22, fontFamily: "'DM Serif Display', serif" } }} />
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={card}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box>
                <SectionLabel reel="01">Release Schedule</SectionLabel>
                <Typography variant="h6" sx={{ mt: 0.5 }}>Quarterly Screenings</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.7}><Box sx={{ width: 8, height: 8, bgcolor: '#fbbf24', borderRadius: '2px' }} /><Typography variant="caption" color="text.secondary">2D</Typography></Stack>
                <Stack direction="row" alignItems="center" spacing={0.7}><Box sx={{ width: 8, height: 8, bgcolor: '#a78bfa', borderRadius: '2px' }} /><Typography variant="caption" color="text.secondary">IMAX</Typography></Stack>
              </Stack>
            </Stack>
            <BarChart
              xAxis={[{ scaleType: 'band', data: ['Q1', 'Q2', 'Q3', 'Q4'] }]}
              series={[
                { data: [35, 44, 24, 34], label: '2D',   color: '#fbbf24' },
                { data: [51, 6, 49, 30],  label: 'IMAX', color: '#a78bfa' },
              ]}
              height={280}
              borderRadius={4}
              slotProps={{ legend: { hidden: true } }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={card}>
            <SectionLabel reel="02">Rotation</SectionLabel>
            <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>Genre Share</Typography>
            <PieChart
              colors={['#fbbf24', '#f59e0b', '#a78bfa', '#34d399', '#60a5fa']}
              series={[{
                data: [
                  { id: 0, value: 32, label: 'Drama' },
                  { id: 1, value: 22, label: 'Sci-Fi' },
                  { id: 2, value: 18, label: 'Thriller' },
                  { id: 3, value: 12, label: 'Rom-Com' },
                  { id: 4, value: 16, label: 'Other' },
                ],
                innerRadius: 40, paddingAngle: 2, cornerRadius: 4,
              }]}
              height={280}
            />
          </Paper>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 1.5, '&::before, &::after': { borderColor: 'divider' } }}>
            <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>Now Showing in the Vault</Typography>
          </Divider>
          <Box sx={{ height: 380 }}>
            <DataGrid
              rows={rows} columns={columns}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </Grid>

        <Grid size={12}>
          <Paper sx={card}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box>
                <SectionLabel reel="03">On The Map</SectionLabel>
                <Typography variant="h6" sx={{ mt: 0.5 }}>Screening Venues</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={num}>{venues.length} locations · Metro Manila</Typography>
            </Stack>
            <Box sx={{ height: 360, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              <MapContainer center={[14.5847, 121.0244]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {venues.map((v) => (
                  <Marker key={v.id} position={v.pos}>
                    <Popup>
                      <strong>{v.name}</strong><br />
                      Now showing: {v.showing}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
