/**
 * ViewsControl — the toolbar "Views" menu. Lists the synthetic Default view + the
 * saved views (check on the active one, delete button per row), with actions to save
 * the current layout as a new view, update the active view, and reset to default.
 * A dot on the trigger marks unsaved changes against the active view. Reads the
 * reactive list from engine.derived and drives everything through engine.api.views.
 */
import CheckOutlined from '@mui/icons-material/CheckOutlined';
// The standard `Outlined` theme variant (not the standalone `DeleteOutline`, which
// MUI 8/9 dropped) — visually identical and present across @mui/icons-material v5–v9.
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import {
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    TextField,
    Tooltip,
} from '@mui/material';
import { useState, type ReactElement } from 'react';

import type { DataTableSlots } from '../../types/slots.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { ViewsFeatherIcon } from '../icons';
import { useLocaleText } from '../../locale/locale-context';

export interface ViewsControlProps<T> {
    engine: UseDataTableResult<T>;
    slots?: Partial<DataTableSlots>;
}

const menuSlotProps = { paper: { elevation: 3, sx: { mt: 0.75, borderRadius: 2, minWidth: 240, maxHeight: 420 } } } as const;

export function ViewsControl<T>({ engine, slots }: ViewsControlProps<T>): ReactElement {
    const locale = useLocaleText();
    const { api, derived } = engine;
    const views = derived.savedViews;
    const activeId = derived.activeViewId;
    const ViewsIcon = slots?.viewsIcon ?? ViewsFeatherIcon;

    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');

    // Reactive (recomputes on the api-populating render too); no imperative api read.
    const dirty = derived.viewsDirty;
    const activeView = views.find((v) => v.id === activeId) ?? null;

    const close = () => { setAnchor(null); setSaving(false); setName(''); };
    const doSave = () => {
        const n = name.trim();
        if (!n) return;
        api.views.saveView(n);
        close();
    };

    return (
        <>
            <Tooltip title={locale.toolbarViews}>
                <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
                    <Badge color="primary" variant="dot" invisible={!dirty} overlap="circular">
                        <ViewsIcon fontSize="small" />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={!!anchor} onClose={close} slotProps={menuSlotProps}>
                {saving ? (
                    <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 220 }} onKeyDown={(e) => e.stopPropagation()}>
                        <TextField
                            autoFocus
                            size="small"
                            fullWidth
                            placeholder={locale.viewsNamePlaceholder}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') doSave(); }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button size="small" onClick={() => { setSaving(false); setName(''); }}>{locale.viewsCancel}</Button>
                            <Button size="small" variant="contained" disabled={!name.trim()} onClick={doSave}>{locale.viewsSave}</Button>
                        </Box>
                    </Box>
                ) : [
                    <ListSubheader key="hdr" sx={{ lineHeight: '32px' }}>{locale.toolbarViews}</ListSubheader>,
                    <MenuItem key="default" selected={!activeId} onClick={() => { api.views.resetView(); close(); }}>
                        <ListItemText primary={locale.viewsDefault} />
                        {!activeId ? <CheckOutlined fontSize="small" color="primary" sx={{ ml: 2 }} /> : null}
                    </MenuItem>,
                    ...views.map((v) => (
                        <MenuItem key={v.id} selected={v.id === activeId} onClick={() => { api.views.applyView(v.id); close(); }}>
                            <ListItemText primary={v.name} primaryTypographyProps={{ noWrap: true }} sx={{ pr: 1 }} />
                            {v.id === activeId ? <CheckOutlined fontSize="small" color="primary" /> : null}
                            <IconButton
                                size="small"
                                aria-label={`${locale.viewsDelete} ${v.name}`}
                                sx={{ ml: 0.5 }}
                                onClick={(e) => { e.stopPropagation(); api.views.deleteView(v.id); }}
                            >
                                <DeleteOutlined fontSize="small" />
                            </IconButton>
                        </MenuItem>
                    )),
                    <Divider key="div" />,
                    <MenuItem key="saveas" onClick={() => setSaving(true)}>
                        <ListItemText primary={locale.viewsSaveAs} />
                    </MenuItem>,
                    <MenuItem key="update" disabled={!activeView || !dirty} onClick={() => { if (activeId) api.views.updateView(activeId); close(); }}>
                        <ListItemText primary={locale.viewsUpdate} secondary={activeView && dirty ? locale.viewsUnsaved : undefined} />
                    </MenuItem>,
                    <MenuItem key="reset" onClick={() => { api.views.resetView(); close(); }}>
                        <ListItemText primary={locale.viewsResetToDefault} />
                    </MenuItem>,
                ]}
            </Menu>
        </>
    );
}
