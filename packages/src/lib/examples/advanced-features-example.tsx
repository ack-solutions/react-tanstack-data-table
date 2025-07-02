import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    TextField,
    Switch,
    FormControlLabel,
    Paper,
    Grid,
    Divider,
    IconButton,
    Tooltip,
    Badge,
    Avatar,
    LinearProgress,
    Rating,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { DataTable } from '../components';
import { DataTableColumn } from '../types';

// Complex data interface with nested objects
interface Employee {
    id: number;
    name: string;
    email: string;
    avatar: string;
    department: {
        id: number;
        name: string;
        color: string;
    };
    position: string;
    salary: number;
    performance: {
        rating: number;
        trend: 'up' | 'down' | 'stable';
        score: number;
    };
    skills: string[];
    startDate: string;
    isActive: boolean;
    projects: {
        id: number;
        name: string;
        progress: number;
        priority: 'high' | 'medium' | 'low';
    }[];
    metadata: {
        lastLogin: string;
        vacationDays: number;
        certifications: number;
    };
}

// Generate rich sample data
const generateEmployeeData = (): Employee[] => {
    const departments = [
        { id: 1, name: 'Engineering', color: '#2196F3' },
        { id: 2, name: 'Design', color: '#9C27B0' },
        { id: 3, name: 'Marketing', color: '#FF9800' },
        { id: 4, name: 'Sales', color: '#4CAF50' },
        { id: 5, name: 'HR', color: '#F44336' },
    ];

    const positions = ['Senior', 'Mid-level', 'Junior', 'Lead', 'Manager'];
    const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'Design', 'Analytics', 'Leadership'];
    const names = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eva Garcia', 'Frank Miller', 'Grace Lee', 'Henry Davis'];

    return Array.from({ length: 20 }, (_, index) => {
        const dept = departments[index % departments.length];
        const employeeSkills = skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2);

        return {
            id: index + 1,
            name: names[index % names.length] || `Employee ${index + 1}`,
            email: `employee${index + 1}@company.com`,
            avatar: `https://i.pravatar.cc/40?img=${index + 1}`,
            department: dept,
            position: `${positions[index % positions.length]} ${dept.name.slice(0, -3)}er`,
            salary: 60000 + (index * 5000) + Math.floor(Math.random() * 20000),
            performance: {
                rating: Math.floor(Math.random() * 5) + 1,
                trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
                score: Math.floor(Math.random() * 40) + 60,
            },
            skills: employeeSkills,
            startDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
            isActive: Math.random() > 0.1,
            projects: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, projIndex) => ({
                id: projIndex + 1,
                name: `Project ${String.fromCharCode(65 + projIndex)}`,
                progress: Math.floor(Math.random() * 100),
                priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
            })),
            metadata: {
                lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                vacationDays: Math.floor(Math.random() * 25),
                certifications: Math.floor(Math.random() * 8),
            },
        };
    });
};

export function AdvancedFeaturesExample() {
    const [employees, setEmployees] = useState<Employee[]>(generateEmployeeData());
    const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
    const [showNestedData, setShowNestedData] = useState(false);

    // Inline editing handlers
    const handleStartEdit = useCallback((employeeId: number) => {
        setEditingRows(prev => new Set([...prev, employeeId]));
    }, []);

    const handleSaveEdit = useCallback((employeeId: number) => {
        setEditingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(employeeId);
            return newSet;
        });
        // In a real app, you'd save to your data store here
    }, []);

    const handleCancelEdit = useCallback((employeeId: number) => {
        setEditingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(employeeId);
            return newSet;
        });
        // In a real app, you'd revert changes here
    }, []);

    const handleFieldChange = useCallback((employeeId: number, field: string, value: any) => {
        setEmployees(prev => prev.map(emp =>
            emp.id === employeeId
                ? { ...emp, [field]: value }
                : emp
        ));
    }, []);

    // Custom cell renderers
    const NameCell = ({ row }: { row: Employee }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={row.avatar} sx={{ width: 32, height: 32 }} />
            <Box>
                <Typography variant="body2" fontWeight="medium">
                    {row.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {row.email}
                </Typography>
            </Box>
        </Box>
    );

    const DepartmentCell = ({ row }: { row: Employee }) => (
        <Chip
            label={row.department.name}
            size="small"
            sx={{
                backgroundColor: row.department.color,
                color: 'white',
                fontWeight: 'medium',
            }}
        />
    );

    const SalaryCell = ({ row }: { row: Employee }) => {
        const isEditing = editingRows.has(row.id);

        if (isEditing) {
            return (
                <TextField
                    size="small"
                    type="number"
                    value={row.salary}
                    onChange={(e) => handleFieldChange(row.id, 'salary', parseInt(e.target.value))}
                    sx={{ width: 120 }}
                />
            );
        }

        return (
            <Typography variant="body2" fontWeight="medium">
                ${row.salary.toLocaleString()}
            </Typography>
        );
    };

    const PerformanceCell = ({ row }: { row: Employee }) => {
        const trendIcon = {
            up: <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />,
            down: <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />,
            stable: <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />,
        };

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={row.performance.rating} size="small" readOnly />
                {trendIcon[row.performance.trend]}
                <Typography variant="caption">
                    {row.performance.score}%
                </Typography>
            </Box>
        );
    };

    const SkillsCell = ({ row }: { row: Employee }) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
            {row.skills.slice(0, 3).map((skill, index) => (
                <Chip
                    key={index}
                    label={skill}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                />
            ))}
            {row.skills.length > 3 && (
                <Chip
                    label={`+${row.skills.length - 3}`}
                    size="small"
                    variant="filled"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                />
            )}
        </Box>
    );

    const ProjectsCell = ({ row }: { row: Employee }) => (
        <Box sx={{ minWidth: 150 }}>
            {row.projects.map((project, index) => (
                <Box key={index} sx={{ mb: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight="medium">
                            {project.name}
                        </Typography>
                        <Chip
                            label={project.priority}
                            size="small"
                            color={project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'default'}
                            sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ height: 4, borderRadius: 2 }}
                        color={project.priority === 'high' ? 'error' : project.priority === 'medium' ? 'warning' : 'primary'}
                    />
                </Box>
            ))}
        </Box>
    );

    const ActionsCell = ({ row }: { row: Employee }) => {
        const isEditing = editingRows.has(row.id);

        if (isEditing) {
            return (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Save changes">
                        <IconButton size="small" onClick={() => handleSaveEdit(row.id)} color="primary">
                            <SaveIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel editing">
                        <IconButton size="small" onClick={() => handleCancelEdit(row.id)} color="secondary">
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit employee">
                    <IconButton size="small" onClick={() => handleStartEdit(row.id)} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete employee">
                    <IconButton
                        size="small"
                        onClick={() => {
                            setEmployees(prev => prev.filter(emp => emp.id !== row.id));
                        }}
                        color="error"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    };

    // Row expansion content
    const renderSubComponent = useCallback(({ row }: { row: Employee }) => (
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Contact Information
                    </Typography>
                    <Typography variant="body2">
                        <strong>Email:</strong> {row.email}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Position:</strong> {row.position}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Start Date:</strong> {new Date(row.startDate).toLocaleDateString()}
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Metadata
                    </Typography>
                    <Typography variant="body2">
                        <strong>Last Login:</strong> {new Date(row.metadata.lastLogin).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Vacation Days:</strong> {row.metadata.vacationDays}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Certifications:</strong> {row.metadata.certifications}
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        All Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {row.skills.map((skill, index) => (
                            <Chip
                                key={index}
                                label={skill}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    ), []);

    // Dynamic column configuration
    const columns = useMemo(() => {
        const baseColumns:DataTableColumn<Employee>[] = [
            {
                accessorKey: 'name',
                header: 'Employee',
                size: 200,
                cell: ({ row }: { row: { original: Employee } }) => <NameCell row={row.original} />,
                enableSorting: true,
                filterable: true,
                type: 'text',
            },
            {
                accessorKey: 'department.name',
                header: 'Department',
                size: 120,
                cell: ({ row }: { row: { original: Employee } }) => <DepartmentCell row={row.original} />,
                enableSorting: true,
                filterable: true,
                type: 'select',
                options: [
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'HR', label: 'HR' },
                ],
            },
            {
                accessorKey: 'salary',
                header: 'Salary',
                size: 120,
                cell: ({ row }: { row: { original: Employee } }) => <SalaryCell row={row.original} />,
                enableSorting: true,
                filterable: true,
                type: 'number',
            },
            {
                accessorKey: 'performance.rating',
                header: 'Performance',
                size: 200,
                cell: ({ row }: { row: { original: Employee } }) => <PerformanceCell row={row.original} />,
                enableSorting: true,
            },
            {
                accessorKey: 'skills',
                header: 'Skills',
                size: 250,
                cell: ({ row }: { row: { original: Employee } }) => <SkillsCell row={row.original} />,
                enableSorting: false,
            },
        ];

        if (showNestedData) {
            baseColumns.push({
                accessorKey: 'projects',
                header: 'Projects',
                size: 200,
                cell: ({ row }: { row: { original: Employee } }) => <ProjectsCell row={row.original} />,
                enableSorting: false,
            });
        }

        if (showAdvancedFeatures) {
            baseColumns.push({
                id: 'actions',
                header: 'Actions',
                size: 100,
                cell: ({ row }: { row: { original: Employee } }) => <ActionsCell row={row.original} />,
                enableSorting: false,
                filterable: false,
            });
        }

        return baseColumns;
    }, [showAdvancedFeatures, showNestedData, editingRows]);

    const addNewEmployee = useCallback(() => {
        const newEmployee: Employee = {
            id: Math.max(...employees.map(e => e.id)) + 1,
            name: 'New Employee',
            email: 'new@company.com',
            avatar: 'https://i.pravatar.cc/40?img=1',
            department: { id: 1, name: 'Engineering', color: '#2196F3' },
            position: 'Junior Developer',
            salary: 60000,
            performance: { rating: 3, trend: 'stable', score: 75 },
            skills: ['React'],
            startDate: new Date().toISOString().split('T')[0],
            isActive: true,
            projects: [],
            metadata: {
                lastLogin: new Date().toISOString(),
                vacationDays: 20,
                certifications: 0,
            },
        };

        setEmployees(prev => [...prev, newEmployee]);
        handleStartEdit(newEmployee.id);
    }, [employees, handleStartEdit]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Advanced Features Demo
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                A comprehensive example showcasing inline editing, custom cell renderers,
                row expansion, dynamic columns, and complex local data operations.
            </Typography>

            {/* Feature Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Feature Controls
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showAdvancedFeatures}
                                onChange={(e) => setShowAdvancedFeatures(e.target.checked)}
                            />
                        }
                        label="Inline Editing & Actions"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showNestedData}
                                onChange={(e) => setShowNestedData(e.target.checked)}
                            />
                        }
                        label="Show Project Data"
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={addNewEmployee}
                        size="small"
                    >
                        Add Employee
                    </Button>
                    <Badge badgeContent={editingRows.size} color="primary">
                        <Typography variant="body2">
                            Editing Rows
                        </Typography>
                    </Badge>
                </Box>
            </Paper>

            {/* Statistics */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Statistics
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Total Employees
                        </Typography>
                        <Typography variant="h6">
                            {employees.length}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Active Employees
                        </Typography>
                        <Typography variant="h6">
                            {employees.filter(e => e.isActive).length}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Avg Salary
                        </Typography>
                        <Typography variant="h6">
                            ${Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length).toLocaleString()}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Currently Editing
                        </Typography>
                        <Typography variant="h6">
                            {editingRows.size}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Data Table */}
            <DataTable
                data={employees}
                totalRow={employees.length}
                columns={columns}

                // Advanced features
                enableRowSelection={true}
                enableMultiRowSelection={true}
                enableSorting={true}
                enableGlobalFilter={true}
                enableColumnFilter={true}
                enableColumnDragging={true}
                enableColumnPinning={true}
                enablePagination={true}

                // Row expansion
                getRowCanExpand={() => true}
                renderSubComponent={(row) => renderSubComponent({ row: row.original as Employee })}

                // Initial state
                initialState={{
                    pagination: {
                        pageIndex: 0,
                        pageSize: 10,
                    },
                    columnOrder: ['name', 'department.name', 'salary', 'performance.rating', 'skills'],
                }}

                // Styling
                tableContainerProps={{
                    sx: {
                        '& .MuiTableRow-root:hover': {
                            backgroundColor: 'action.hover',
                        },
                        '& .MuiTableCell-root': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        },
                    }
                }}

                // Bulk actions
                enableBulkActions={true}
                bulkActions={(selectionState) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                let selectedEmployees: Employee[];
                                if (selectionState.type === 'include') {
                                    selectedEmployees = employees.filter(emp => selectionState.ids.includes(emp.id.toString()));
                                } else {
                                    selectedEmployees = employees.filter(emp => !selectionState.ids.includes(emp.id.toString()));
                                }
                                const avgSalary = selectedEmployees.reduce((sum, emp) => sum + emp.salary, 0) / selectedEmployees.length;
                                alert(`Average salary of ${selectedEmployees.length} selected employees: $${Math.round(avgSalary).toLocaleString()}`);
                            }}
                        >
                            📊 Calculate Avg Salary
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                const updatedEmployees = employees.map(emp => {
                                    const isSelected = selectionState.type === 'include'
                                        ? selectionState.ids.includes(emp.id.toString())
                                        : !selectionState.ids.includes(emp.id.toString());

                                    return isSelected
                                        ? { ...emp, performance: { ...emp.performance, rating: 5 } }
                                        : emp;
                                });
                                setEmployees(updatedEmployees);
                            }}
                        >
                            ⭐ Boost Performance
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => {
                                let selectedEmployees: Employee[];
                                if (selectionState.type === 'include') {
                                    selectedEmployees = employees.filter(emp => selectionState.ids.includes(emp.id.toString()));
                                } else {
                                    selectedEmployees = employees.filter(emp => !selectionState.ids.includes(emp.id.toString()));
                                }

                                if (window.confirm(`Delete ${selectedEmployees.length} selected employees?`)) {
                                    const selectedIds = selectedEmployees.map(emp => emp.id);
                                    setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
                                }
                            }}
                        >
                            🗑️ Delete Selected
                        </Button>
                    </Box>
                )}

                // Fit to screen
                fitToScreen={true}
            />

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    💡 <strong>Features demonstrated:</strong>
                    <br />
                    • Inline editing with save/cancel actions
                    <br />
                    • Custom cell renderers with rich content (avatars, ratings, progress bars)
                    <br />
                    • Row expansion with detailed information
                    <br />
                    • Dynamic column configuration
                    <br />
                    • Complex nested data structures
                    <br />
                    • Real-time statistics and bulk operations
                    <br />
                    • Advanced styling and theming
                </Typography>
            </Box>
        </Box>
    );
} 