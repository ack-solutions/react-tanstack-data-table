import React, { ReactElement } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';


export function AddIcon(props: SvgIconProps): ReactElement {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 24 24"
        >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
            />
        </SvgIcon>
    );
}
