import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface FeatureSectionProps {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
}

export function FeatureSection({
  title,
  description,
  children,
  spacing = 3,
  align = 'flex-start',
}: FeatureSectionProps) {
  return (
    <Stack spacing={spacing} alignItems={align} width="100%">
      <Box width="100%">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {children}
    </Stack>
  );
}
