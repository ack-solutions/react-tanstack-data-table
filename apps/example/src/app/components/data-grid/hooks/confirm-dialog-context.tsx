/* eslint-disable react/no-multi-comp */
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, Stack } from '@mui/material';
import {
    useCallback,
    useContext,
    useState,
    createContext,
    ReactNode,
} from 'react';



export const ConfirmContext = createContext<any>(null);

export interface ConfirmDialogProps extends DialogProps {
    message?: string;
    yesText?: string;
    title?: string;
    noText?: string;
    yesButtonProps?: ButtonProps;
    noButtonProps?: ButtonProps;
    resolveReject?: [() => void, () => void];
    onClose: () => void;
}

// ConfirmDialog component
function ConfirmDialog({
    noButtonProps,
    title = 'Confirm',
    noText = 'No',
    yesButtonProps,
    yesText = 'Yes',
    message,
    resolveReject,
    onClose,
    ...dialogProps
}: ConfirmDialogProps) {
    const [resolve, reject] = resolveReject || [];

    // Handle cancel button action
    const handleCancel = useCallback(() => {
        if (reject) {
            reject();
        }
        if (onClose) {
            onClose();
        }
    }, [reject, onClose]);

    // Handle confirm button action
    const handleConfirm = useCallback(() => {
        if (resolve) {
            resolve();
        }
        if (onClose) {
            onClose();
        }
    }, [resolve, onClose]);

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            {...dialogProps}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {message ? <DialogContentText>{message}</DialogContentText> : null}
            </DialogContent>
            <DialogActions>
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="end"
                >
                    <Button
                        variant="outlined"
                        color="inherit"
                        fullWidth
                        {...noButtonProps}
                        onClick={handleCancel}
                    >
                        {noText}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        {...yesButtonProps}
                        onClick={handleConfirm}
                    >
                        {yesText}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

interface ConfirmProviderProps {
    children: ReactNode;
}

export default function ConfirmProvider({
    children,
}: ConfirmProviderProps) {
    const [dialogProps, setDialogProps] = useState<Partial<ConfirmDialogProps> | null>(null);
    const [resolveReject, setResolveReject] = useState<[() => void, () => void] | null>(null);

    const confirm = useCallback((options: Partial<ConfirmDialogProps>) => new Promise<void>((resolve, reject) => {
        if (typeof options === 'string') {
            options = { message: options };
        }
        setDialogProps(options);
        setResolveReject([resolve, reject]);
    }), []);

    const handleClose = () => {
        setDialogProps(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {dialogProps && resolveReject ? (
                <ConfirmDialog
                    open={true}
                    {...dialogProps}
                    resolveReject={resolveReject}
                    onClose={handleClose}
                />
            ) : null}
        </ConfirmContext.Provider>
    );
}

export const useConfirm = () => {
    const confirm = useContext(ConfirmContext);
    if (!confirm) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return confirm;
};
