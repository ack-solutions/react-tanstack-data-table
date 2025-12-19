import { Box, Chip, Collapse, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NavNode } from '../../content/navigation';

interface NavigationTreeProps {
  nodes: NavNode[];
  activeSection: string;
  expanded: Set<string>;
  isMobile: boolean;
  onItemClick: (id: string) => void;
  onToggleExpand: (id: string) => void;
  depth?: number;
}

export function NavigationTree({
  nodes,
  activeSection,
  expanded,
  onItemClick,
  onToggleExpand,
  depth = 0,
}: NavigationTreeProps) {
  const renderNav = (nodeList: NavNode[], currentDepth: number): React.ReactElement => (
    <List disablePadding sx={{ px: 0.5 }}>
      {nodeList.map((node) => {
        const indent = currentDepth * 12;

        if (node.type === 'item') {
          return (
            <ListItemButton
              key={node.id}
              onClick={() => onItemClick(node.id)}
              selected={activeSection === node.id}
              sx={{
                pl: 1.5 + indent / 8,
                pr: 1,
                py: 0.65,
                minHeight: 36,
                borderRadius: 1,
                mx: 0.5,
                my: 0.2,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemText 
                primary={node.title} 
                primaryTypographyProps={{ 
                  fontWeight: activeSection === node.id ? 600 : 500,
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                }} 
              />
              {node.badge ? (
                <Chip 
                  label={node.badge.toUpperCase()} 
                  size="small" 
                  color="success" 
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem',
                    '& .MuiChip-label': { px: 0.75, py: 0 }
                  }} 
                />
              ) : null}
            </ListItemButton>
          );
        }

        if (node.type === 'label') {
          const isOpen = expanded.has(node.id);
          return (
            <Box key={node.id} sx={{ mt: 1.5 }}>
              <ListItemButton
                onClick={() => onToggleExpand(node.id)}
                sx={{ 
                  pl: 1.5 + indent / 8, 
                  pr: 1,
                  py: 0.5,
                  minHeight: 32,
                  borderRadius: 1,
                  mx: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={node.title}
                  primaryTypographyProps={{
                    variant: 'overline',
                    fontSize: '0.7rem',
                    letterSpacing: 1,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                />
                {isOpen ? (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                )}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 0.5 }}>
                  {node.children ? renderNav(node.children, currentDepth + 1) : null}
                </Box>
              </Collapse>
            </Box>
          );
        }

        return (
          <Box key={node.id} sx={{ mt: 1, mb: 0.5 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                px: 2, 
                color: 'text.secondary', 
                fontSize: '0.7rem',
                letterSpacing: 1,
                fontWeight: 700,
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {node.title}
            </Typography>
            {node.children ? renderNav(node.children, currentDepth + 1) : null}
          </Box>
        );
      })}
    </List>
  );

  return renderNav(nodes, depth);
}
