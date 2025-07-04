import { Autorenew } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { useDataTableContext } from '../../contexts/data-table-context';


export function ColumnResetControl() {
    const { table } = useDataTableContext();

    const handleResetLayout = () => {
        table.resetColumnOrder();
        table.resetColumnPinning();
        table.resetColumnSizing();
    };

    return (
        <Tooltip title="Reset layout">
            <IconButton
                size="small"
                onClick={handleResetLayout}
            >
                <Autorenew />
            </IconButton>
        </Tooltip>
    );
}
