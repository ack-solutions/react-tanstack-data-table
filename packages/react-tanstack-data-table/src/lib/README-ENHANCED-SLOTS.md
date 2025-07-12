# Enhanced Slots System

The enhanced slot system provides powerful customization capabilities for DataTable components without limitations. This system allows you to override any component with full prop control and proper TypeScript support.

## Key Improvements

### 1. Better Prop Merging
The enhanced system provides intelligent prop merging with special handling for:
- **`sx` prop**: Deep merges MUI sx objects
- **`style` prop**: Merges CSS style objects
- **`className` prop**: Concatenates class names properly

### 2. Full Component Customization
- Replace any component without limitations
- Pass any props to slot components
- Maintain full TypeScript support
- Support for custom styled components

### 3. Enhanced Type Safety
- Better TypeScript inference
- Proper component prop typing
- Generic support for data types
- Runtime validation in development

## Enhanced Slot Helper Functions

### `mergeSlotProps(defaultProps, slotProps, userProps)`
Intelligently merges props with priority system:
1. User props (highest priority)
2. Slot props (medium priority)
3. Default props (lowest priority)

```tsx
// Special handling for MUI sx prop
const mergedProps = mergeSlotProps(
    { sx: { color: 'primary.main' } },      // default
    { sx: { fontSize: 16 } },               // slot props
    { sx: { fontWeight: 'bold' } }          // user props
);
// Result: { sx: { color: 'primary.main', fontSize: 16, fontWeight: 'bold' } }
```

### `getSlotComponentWithProps(slots, slotProps, slotName, fallback, defaultProps)`
Returns both the component and merged props:

```tsx
const { component: IconSlot, props: iconProps } = getSlotComponentWithProps(
    slots, 
    slotProps, 
    'searchIcon', 
    DefaultSearchIcon,
    { size: 'medium' }
);

return <IconSlot {...iconProps} />;
```

### `extractSlotProps(slotProps, slotName)`
Type-safe extraction of slot-specific props:

```tsx
const iconProps = extractSlotProps(slotProps, 'searchIcon');
// Returns properly typed props for the searchIcon slot
```

## Usage Examples

### Basic Slot Customization

```tsx
import { DataTable } from '@your-package/react-tanstack-data-table';
import { Star as StarIcon } from '@mui/icons-material';

// Custom icon component
const CustomSearchIcon = (props) => (
    <StarIcon {...props} sx={{ color: 'warning.main', ...props.sx }} />
);

function MyTable() {
    return (
        <DataTable
            data={data}
            columns={columns}
            slots={{
                searchIcon: CustomSearchIcon,
            }}
            slotProps={{
                searchIcon: {
                    fontSize: 'large',
                    sx: {
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' },
                        },
                    },
                },
            }}
        />
    );
}
```

### Advanced Component Replacement

```tsx
import { styled } from '@mui/material/styles';

const CustomToolbar = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderRadius: theme.shape.borderRadius,
}));

function AdvancedTable() {
    return (
        <DataTable
            data={data}
            columns={columns}
            slots={{
                toolbar: CustomToolbar,
                searchInput: ({ value, onChange, placeholder, ...props }) => (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            ...props.style,
                        }}
                        {...props}
                    />
                ),
            }}
            slotProps={{
                toolbar: {
                    sx: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                    },
                },
                searchInput: {
                    placeholder: 'Search anything...',
                    style: {
                        minWidth: '300px',
                    },
                },
            }}
        />
    );
}
```

### Custom Component with Event Handlers

```tsx
const CustomButton = ({ onClick, children, ...props }) => (
    <Button
        variant="contained"
        onClick={(e) => {
            console.log('Custom button clicked!');
            onClick?.(e);
        }}
        {...props}
    >
        {children}
    </Button>
);

function TableWithCustomButton() {
    return (
        <DataTable
            data={data}
            columns={columns}
            slots={{
                exportButton: CustomButton,
            }}
            slotProps={{
                exportButton: {
                    color: 'secondary',
                    sx: {
                        borderRadius: 3,
                        textTransform: 'none',
                    },
                },
            }}
        />
    );
}
```

## Available Slots

### Container Slots
- `root` - Main container
- `tableContainer` - Table container wrapper
- `table` - Table element

### Header Slots
- `toolbar` - Main toolbar
- `header` - Table header
- `headerRow` - Header row
- `headerCell` - Header cell

### Body Slots
- `body` - Table body
- `row` - Table row
- `cell` - Table cell

### Control Slots
- `searchInput` - Search input component
- `columnVisibilityControl` - Column visibility control
- `columnCustomFilterControl` - Column filter control
- `columnPinningControl` - Column pinning control
- `exportButton` - Export button
- `resetButton` - Reset button
- `tableSizeControl` - Table size control

### Icon Slots
- `searchIcon` - Search icon
- `filterIcon` - Filter icon
- `exportIcon` - Export icon
- `columnIcon` - Column visibility icon
- `resetIcon` - Reset icon
- And many more...

## Best Practices

### 1. Component Composition
```tsx
// Good: Compose components properly
const CustomControl = ({ children, ...props }) => (
    <Box sx={{ display: 'flex', gap: 1 }} {...props}>
        {children}
    </Box>
);

// Usage
slots={{
    toolbar: ({ children, ...props }) => (
        <CustomControl {...props}>
            {children}
        </CustomControl>
    ),
}}
```

### 2. Prop Forwarding
```tsx
// Good: Always forward props
const CustomIcon = (props) => (
    <StarIcon {...props} sx={{ color: 'primary.main', ...props.sx }} />
);

// Bad: Not forwarding props
const CustomIcon = () => <StarIcon color="primary" />;
```

### 3. TypeScript Support
```tsx
// Good: Use proper typing
interface CustomButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    [key: string]: any; // Allow additional props
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...props }) => (
    <Button {...props}>{children}</Button>
);
```

### 4. Performance Considerations
```tsx
// Good: Memoize expensive components
const CustomToolbar = React.memo(({ children, ...props }) => (
    <Box {...props}>{children}</Box>
));

// Good: Use callbacks for event handlers
const handleClick = useCallback(() => {
    // Handle click
}, []);
```

## Migration Guide

### From Basic Slots
```tsx
// Before
<DataTable
    slots={{
        searchIcon: MyIcon,
    }}
    slotProps={{
        searchIcon: { color: 'primary' },
    }}
/>

// After (Enhanced)
<DataTable
    slots={{
        searchIcon: MyIcon,
    }}
    slotProps={{
        searchIcon: {
            color: 'primary',
            sx: { fontSize: 20 }, // Now supports sx prop merging
        },
    }}
/>
```

### Component Updates
Update your toolbar components to use the enhanced system:

```tsx
// Before
export function ColumnVisibilityControl() {
    const { slots, slotProps } = useDataTableContext();
    const IconSlot = getSlotComponent(slots, 'columnIcon', DefaultIcon);
    
    return (
        <IconButton>
            <IconSlot {...slotProps?.columnIcon} />
        </IconButton>
    );
}

// After (Enhanced)
export function ColumnVisibilityControl(props = {}) {
    const { slots, slotProps } = useDataTableContext();
    const iconProps = extractSlotProps(slotProps, 'columnIcon');
    const IconSlot = getSlotComponent(slots, 'columnIcon', DefaultIcon);
    
    const mergedProps = mergeSlotProps(
        { size: 'small' },                    // defaults
        slotProps?.columnVisibilityControl,   // slot props
        props                                 // user props
    );
    
    return (
        <IconButton {...mergedProps}>
            <IconSlot {...iconProps} />
        </IconButton>
    );
}
```

## Troubleshooting

### Common Issues

1. **Props not merging correctly**
   - Ensure you're using `mergeSlotProps` function
   - Check prop priority order (user > slot > default)

2. **TypeScript errors**
   - Use `[key: string]: any` for flexible prop interfaces
   - Ensure proper prop forwarding with spread operator

3. **Styling conflicts**
   - Check sx prop merging order
   - Use proper CSS specificity

4. **Performance issues**
   - Memoize expensive components
   - Use callbacks for event handlers
   - Avoid inline function definitions

### Debug Mode
Enable debug mode in development:

```tsx
// Enable slot validation
process.env.NODE_ENV === 'development' && 
    validateSlotProps('searchIcon', props, ['fontSize']);
```

## Conclusion

The enhanced slot system provides unprecedented flexibility for customizing DataTable components. With proper prop merging, full TypeScript support, and intelligent component composition, you can create highly customized tables without limitations.

Key benefits:
- ✅ Full component customization
- ✅ Intelligent prop merging
- ✅ TypeScript support
- ✅ Performance optimized
- ✅ Easy migration path
- ✅ Comprehensive documentation 