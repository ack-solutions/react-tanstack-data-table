import { Theme } from '@mui/material';


export function cssBaseline(_theme: Theme) {
    return {
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                },
                html: {
                    margin: 0,
                    padding: 0,
                    width: '100%',
                    height: '100%',
                    WebkitOverflowScrolling: 'touch',
                },
                body: {
                    margin: 0,
                    padding: 0,
                    width: '100%',
                    height: '100%',
                },
                '#root, #__next': {
                    width: '100%',
                    height: '100%',
                },
                input: {
                    backGroundColor: '#000',
                    '&[type=number]': {
                        backGroundColor: '#000',
                        // MozAppearance: 'textfield',
                        '&::-webkit-outer-spin-button': {
                            margin: 0,
                            '-webkit-appearance': 'none',
                        },
                        '&::-webkit-inner-spin-button': {
                            margin: 0,
                            '-webkit-appearance': 'none',
                        },
                    },
                },

                img: {
                    maxWidth: '100%',
                    display: 'inline-block',
                    verticalAlign: 'bottom',
                },
                '.pac-container': {
                    zIndex: '1500 !important',
                },
            },
        },
    };
}
/* Chrome, Safari, Edge, Opera */
// input::-webkit-outer-spin-button,
// input::-webkit-inner-spin-button {
//   -webkit-appearance: none;
//   margin: 0;
// }

// /* Firefox */
// input[type=number] {
//   -moz-appearance: textfield;
// }
