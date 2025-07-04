import { SvgIcon, SvgIconProps } from '@mui/material';


export function UnpinIcon(props: SvgIconProps) {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 24 24"
        >
            <path
                d="M2 5.27L3.28 4 20 20.72 18.73 22l-3.41-3.41V22h-1.6v-6H8v-2l2-2V9.27L2 5.27zM16 12V4h1V2H7v2h1v3.73l8 8z"
                opacity="0.7"
            />
            <path d="M14.73 12L16 10.73V4h1V2H7v2h1v3.73l2.27 2.27z" />
        </SvgIcon>
    );
}
