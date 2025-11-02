import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface FeatureLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  subtitle?: ReactNode;
}

export function FeatureLayout({ title, description, subtitle, children }: FeatureLayoutProps) {
  return (
    <Stack
      spacing={4}
      sx={{
        width: '100%',
      }}
    >
      <Box>
        {subtitle ? (
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              letterSpacing: 1.2,
              fontWeight: 600,
              mb: 1,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Stack>
  );
}
