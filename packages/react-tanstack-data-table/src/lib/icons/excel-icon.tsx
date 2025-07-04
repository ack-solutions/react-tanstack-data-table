import { SvgIcon, SvgIconProps } from '@mui/material';


export function ExcelIcon(props: SvgIconProps) {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 24 24"
        >
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            <path d="M11.5,15L9.75,12.5L11.5,10H10L8.75,11.5L7.5,10H6L7.75,12.5L6,15H7.5L8.75,13.5L10,15H11.5M15,10V12H17V10H15M15,14V16H17V14H15Z" />
        </SvgIcon>
    );
}
