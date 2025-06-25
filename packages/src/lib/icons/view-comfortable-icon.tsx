import { SvgIcon, SvgIconProps } from '@mui/material';


export function ViewComfortableIcon(props: SvgIconProps) {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 24 24"
        >
            <rect
                x="3"
                y="3"
                width="18"
                height="3"
                fill="currentColor"
                rx="1"
            />
            <rect
                x="3"
                y="8"
                width="18"
                height="3"
                fill="currentColor"
                rx="1"
            />
            <rect
                x="3"
                y="13"
                width="18"
                height="3"
                fill="currentColor"
                rx="1"
            />
            <rect
                x="3"
                y="18"
                width="18"
                height="3"
                fill="currentColor"
                rx="1"
            />
        </SvgIcon>
    );
}
