import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    Typography,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Checkbox,
    TextField,
    Pagination,
    MenuItem
} from '@mui/material';
import axiosInstance from '../../apiCall';

type ClientType = {
    client_id: number;
    client_name: string;
    address: string;
    city: string;
    phone: number;
    currency: string;
    country: string;
    outstanding: number | null;
    creditOrDebit: string;
};

export default function ClientView() {
    const [clients, setClients] = useState<ClientType[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState<number[]>([]);
    const [searchText, setSearchText] = useState('');
    const [totalCount, setTotalCount] = useState(50);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axiosInstance.post('/client/list-all', {
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    text: searchText
                });
                setClients(response.data.data);
                if (response.data.total) {
                    setTotalCount(response.data.total);
                }
            } catch (error) {
                console.error('Error fetching clients', error);
            }
        };
        fetchClients();
    }, [page, rowsPerPage, searchText]);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = clients.map((n) => n.client_id);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleClick = (id: number) => {
        const selectedIndex = selected.indexOf(id);
        const newSelected =
            selectedIndex === -1
                ? [...selected, id]
                : selected.filter((item) => item !== id);
        setSelected(newSelected);
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;
    const emptyRows = Math.max(0, rowsPerPage - clients.length);

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Clients</Typography>
            </Box>

            <TextField
                label="Search anything (Name, City, Phone...)"
                variant="outlined"
                value={searchText}
                onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(0);
                }}
                fullWidth
                margin="normal"
            />

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selected.length === clients.length && clients.length > 0}
                                        indeterminate={selected.length > 0 && selected.length < clients.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                <TableCell>Client ID</TableCell>
                                <TableCell>Client Name</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell>Country</TableCell>
                                <TableCell>Outstanding</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.map((row) => {
                                const isItemSelected = isSelected(row.client_id);
                                return (
                                    <TableRow
                                        key={row.client_id}
                                        hover
                                        selected={isItemSelected}
                                        onClick={() => handleClick(row.client_id)}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isItemSelected} />
                                        </TableCell>
                                        <TableCell>{row.client_id}</TableCell>
                                        <TableCell>{row.client_name}</TableCell>
                                        <TableCell>{row.city}</TableCell>
                                        <TableCell>{row.phone}</TableCell>
                                        <TableCell>{row.currency}</TableCell>
                                        <TableCell>{row.country}</TableCell>
                                        <TableCell>{`${row.outstanding ?? 0} ${row.creditOrDebit || ''}`}</TableCell>
                                    </TableRow>
                                );
                            })}

                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={9} />
                                </TableRow>
                            )}

                            {clients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No clients found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                    <TextField
                        select
                        label="Rows per page"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        size="small"
                        sx={{ width: 150 }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                    </TextField>

                    <Pagination
                        count={Math.ceil(totalCount / rowsPerPage)}
                        page={page + 1}
                        onChange={(_e, value) => setPage(value - 1)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            </Card>
        </Box>
    );
}
