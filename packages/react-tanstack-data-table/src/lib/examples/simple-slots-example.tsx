/**
 * Simple Enhanced Slots Example
 * 
 * This example demonstrates the key improvements in the enhanced slot system:
 * - Better prop merging with special handling for sx, style, and className
 * - Full component customization without limitations
 * - Proper TypeScript support
 */
import React from 'react';
import { 
    Box, 
    Typography, 
    IconButton,
    Chip,
    alpha,
    useTheme
} from '@mui/material';
import { 
    Star as StarIcon,
    Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/table/data-table';
import { DataTableColumn } from '../types';

// Sample data
interface SampleData {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
}

const sampleData: SampleData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' },
];

const columns: DataTableColumn<SampleData>[] = [
    { id: 'name', accessorKey: 'name', header: 'Name' },
    { id: 'email', accessorKey: 'email', header: 'Email' },
    { 
        id: 'status', 
        accessorKey: 'status', 
        header: 'Status',
        cell: ({ getValue }) => (
            <Chip 
                label={getValue() as string} 
                color={getValue() === 'active' ? 'success' : 'default'}
                size="small"
            />
        )
    },
];

// Custom icon component
const CustomSearchIcon = (props: any) => (
    <StarIcon {...props} sx={{ color: 'warning.main', ...props.sx }} />
);

const CustomFilterIcon = (props: any) => (
    <FavoriteIcon {...props} sx={{ color: 'error.main', ...props.sx }} />
);

export function SimpleEnhancedSlotsExample() {
    const theme = useTheme();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Enhanced Slots System
            </Typography>
            
            <Typography variant="body1" paragraph>
                This example demonstrates the key improvements in the enhanced slot system:
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Key Improvements:
                </Typography>
                <ul>
                    <li><strong>Better Prop Merging:</strong> Special handling for sx, style, and className props</li>
                    <li><strong>Full Customization:</strong> Override any component without limitations</li>
                    <li><strong>Enhanced Type Safety:</strong> Better TypeScript support with proper typing</li>
                    <li><strong>Flexible Props:</strong> Pass any props to slot components</li>
                    <li><strong>Priority System:</strong> User props override slot props override defaults</li>
                </ul>
            </Box>

            <DataTable
                data={sampleData}
                columns={columns}
                enableGlobalFilter
                enableColumnVisibility
                enableColumnFilter
                // Enhanced slot system demonstration
                slots={{
                    // Custom icons with full styling control
                    searchIcon: CustomSearchIcon,
                    filterIcon: CustomFilterIcon,
                }}
                
                // Enhanced slot props with better merging
                slotProps={{
                    // Customize search icon with animation
                    searchIcon: {
                        fontSize: 'large',
                        sx: {
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' },
                            },
                        },
                    },
                    
                    // Customize filter icon with hover effects
                    filterIcon: {
                        fontSize: 'medium',
                        sx: {
                            transform: 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'rotate(180deg)',
                            },
                        },
                    },
                    
                    // Customize table container with custom scrollbar
                    tableContainer: {
                        sx: {
                            maxHeight: '400px',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: alpha(theme.palette.grey[300], 0.5),
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            },
                        },
                    },
                    
                    // Customize toolbar with enhanced styling
                    toolbar: {
                        sx: {
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: 2,
                            padding: 2,
                            margin: '0 0 16px 0',
                        },
                    },
                }}
            />

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Enhanced Slot Helper Functions:
                </Typography>
                <Box component="pre" sx={{ 
                    backgroundColor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1,
                    fontSize: '0.875rem',
                    overflow: 'auto',
                }}>
{`// Enhanced prop merging with special handling
export function mergeSlotProps(
    defaultProps = {},
    slotProps = {},
    userProps = {}
) {
    // Handles sx, style, and className merging
    // User props have highest priority
}

// Enhanced slot component retrieval
export function getSlotComponentWithProps(
    slots,
    slotProps,
    slotName,
    fallback,
    defaultProps = {}
) {
    return {
        component: getSlotComponent(slots, slotName, fallback),
        props: mergeSlotProps(defaultProps, slotProps[slotName], {})
    };
}

// Usage in components:
const { component: IconSlot, props: iconProps } = 
    getSlotComponentWithProps(slots, slotProps, 'searchIcon', DefaultIcon);

return <IconSlot {...iconProps} />;`}
                </Box>
            </Box>
        </Box>
    );
} 