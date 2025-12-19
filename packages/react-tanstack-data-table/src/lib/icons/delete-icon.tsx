import React, { ReactElement } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';


export function DeleteIcon(props: SvgIconProps): ReactElement {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 24 24"
        >
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            <rect
                x="9"
                y="8"
                width="2"
                height="9"
                fill="currentColor"
                opacity="0.6"
            />
            <rect
                x="13"
                y="8"
                width="2"
                height="9"
                fill="currentColor"
                opacity="0.6"
            />
        </SvgIcon>
    );
}
