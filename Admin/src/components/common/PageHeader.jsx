import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

/**
 * `crumbs`: [{ label, path? }] — last item (no path) renders as plain text.
 */
const PageHeader = ({ title, crumbs = [], action }) => (
  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
    <Box>
      {crumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ mb: 0.5, fontSize: 13 }}
        >
          {crumbs.map((c, i) =>
            c.path ? (
              <MuiLink
                key={i}
                component={RouterLink}
                to={c.path}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: 13 }}
              >
                {c.label}
              </MuiLink>
            ) : (
              <Typography key={i} color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
                {c.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Typography variant="h5">{title}</Typography>
    </Box>
    {action && <Box>{action}</Box>}
  </Box>
);

export default PageHeader;
