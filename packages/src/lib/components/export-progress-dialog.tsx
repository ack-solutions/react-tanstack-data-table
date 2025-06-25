import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    LinearProgress,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import React from 'react';

import { ExportProgress, ExportResult } from '../types';


interface ExportProgressDialogProps {
    open: boolean;
    progress?: ExportProgress;
    result?: ExportResult;
    onCancel?: () => void;
    onClose?: () => void;
    exportType?: 'csv' | 'excel';
}

export function ExportProgressDialog({
    open,
    progress,
    result,
    onCancel,
    onClose,
    exportType = 'csv',
}: ExportProgressDialogProps) {
    const formatTime = (milliseconds: number): string => {
        if (milliseconds < 1000) return `${milliseconds}ms`;
        const seconds = Math.round(milliseconds / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = [
            'Bytes',
            'KB',
            'MB',
            'GB',
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isCompleted = !!result;
    const isExporting = !!progress && !isCompleted;

    return (
        <Dialog
            open={open}
            onClose={isExporting ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={isExporting}
        >
            <DialogTitle>
                {isCompleted ? 'Export Completed' : `Exporting to ${exportType.toUpperCase()}`}
            </DialogTitle>

            <DialogContent>
                {isExporting && progress ? (
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                        >
                            Processing
                            {' '}
                            {progress.processedRows.toLocaleString()}
                            {' '}
                            of
                            {' '}
                            {progress.totalRows.toLocaleString()}
                            {' '}
                            rows
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={progress.percentage}
                            sx={{ mb: 2 }}
                        />

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                            <Typography variant="body2">
                                {progress.percentage}
                                % Complete
                            </Typography>
                            <Chip
                                label={`Chunk ${progress.currentChunk} / ${progress.totalChunks}`}
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        {progress.estimatedTimeRemaining !== undefined && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Estimated time remaining:
                                {' '}
                                {formatTime(progress.estimatedTimeRemaining)}
                            </Typography>
                        )}
                    </Box>
                ) : null}

                {isCompleted && result ? (
                    <Box>
                        <Typography
                            variant="body1"
                            gutterBottom
                        >
                            Export completed successfully!
                        </Typography>

                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={1}
                            mt={2}
                        >
                            <Typography variant="body2">
                                <strong>Filename:</strong>
                                {' '}
                                {result.filename}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Rows:</strong>
                                {' '}
                                {result.totalRows.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Columns:</strong>
                                {' '}
                                {result.totalColumns}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Processing time:</strong>
                                {' '}
                                {formatTime(result.processingTime)}
                            </Typography>
                            {result.fileSize ? (
                                <Typography variant="body2">
                                    <strong>File size:</strong>
                                    {' '}
                                    {formatFileSize(result.fileSize)}
                                </Typography>
                            ) : null}
                        </Box>
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions>
                {isExporting && onCancel ? (
                    <Button
                        onClick={onCancel}
                        color="secondary"
                    >
                        Cancel Export
                    </Button>
                ) : null}

                {isCompleted && onClose ? (
                    <Button
                        onClick={onClose}
                        color="primary"
                        variant="contained"
                    >
                        Close
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}
