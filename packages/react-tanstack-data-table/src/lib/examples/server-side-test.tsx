/**
 * Simple test component to demonstrate server-side fetching example
 * This shows how to use the ServerSideFetchingExample component
 */
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ServerSideFetchingExample } from './server-side-fetching-example';

export function ServerSideTest() {
    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Server-Side Data Fetching Test
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    This example demonstrates how to use the DataTable component with server-side data fetching.
                    The onFetchData callback handles all server operations including filtering, sorting, and pagination.
                </Typography>
                
                <ServerSideFetchingExample />
            </Paper>
        </Box>
    );
} 