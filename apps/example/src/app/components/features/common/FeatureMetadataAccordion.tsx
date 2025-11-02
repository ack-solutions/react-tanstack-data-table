import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { FeatureMetadataGroup } from '../data/data-table-metadata';
import { FeatureMetadataTable } from './FeatureMetadataTable';

interface FeatureMetadataAccordionProps {
  groups: FeatureMetadataGroup[];
  defaultExpandedCount?: number;
  includePossibleValues?: boolean;
}

export function FeatureMetadataAccordion({
  groups,
  defaultExpandedCount = 1,
  includePossibleValues,
}: FeatureMetadataAccordionProps) {
  return (
    <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {groups.map((group, index) => (
        <Accordion key={group.id} defaultExpanded={index < defaultExpandedCount} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {group.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.description}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ overflowX: 'auto' }}>
              <FeatureMetadataTable
                items={group.items}
                includePossibleValues={includePossibleValues}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
