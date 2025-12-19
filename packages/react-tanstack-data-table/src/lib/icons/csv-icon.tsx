import React, { ReactElement } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';


export function CsvIcon(props: SvgIconProps): ReactElement {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 24 24"
        >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            <path d="M7,12.5A0.5,0.5 0 0,1 7.5,12H8.5A0.5,0.5 0 0,1 9,12.5V13.5A0.5,0.5 0 0,1 8.5,14H7.5A0.5,0.5 0 0,1 7,13.5M10.5,12.5A0.5,0.5 0 0,1 11,12H12A0.5,0.5 0 0,1 12.5,12.5V13.5A0.5,0.5 0 0,1 12,14H11A0.5,0.5 0 0,1 10.5,13.5M14,12.5A0.5,0.5 0 0,1 14.5,12H15.5A0.5,0.5 0 0,1 16,12.5V13.5A0.5,0.5 0 0,1 15.5,14H14.5A0.5,0.5 0 0,1 14,13.5" />
        </SvgIcon>
    );
}
