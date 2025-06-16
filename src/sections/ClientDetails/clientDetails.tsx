import React, { useState, useEffect } from 'react';
import { Box, Card, Table, TableBody, Typography, TableContainer, TablePagination, TableHead, TableRow, TableCell, Checkbox, TextField, } from '@mui/material';

import axiosInstance from '../../apiCall';
type ClientType = {
    client_id: number;
    client_name: string;
    address: string;
    city: string;
    phone: number;
    currency: string;
    country: string;
};

export default function ClientView() {
    const [clients, setClients] = useState<ClientType[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selected, setSelected] = useState<number[]>([]);
    const [filterName, setFilterName] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get('/client/list-all');
                setClients(response.data.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        fetchClients();
    }, []);

    const filteredData = clients.filter((client) =>
        client.client_name.toLowerCase().includes(filterName.toLowerCase())
    );

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredData.map((n) => n.client_id);
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleClick = (id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter((item) => item !== id);
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0);
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;
    const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filteredData.length);

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Clients</Typography>
            </Box>
            <TextField
                label="Search by Client Name"
                variant="outlined"
                value={filterName}
                onChange={handleFilter}
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
                                        checked={selected.length === filteredData.length && filteredData.length > 0}
                                        indeterminate={selected.length > 0 && selected.length < filteredData.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                <TableCell>Client ID</TableCell>
                                <TableCell>Client Name</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell>Country</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
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
                                            <TableCell>{row.address}</TableCell>
                                            <TableCell>{row.city}</TableCell>
                                            <TableCell>{row.phone}</TableCell>
                                            <TableCell>{row.currency}</TableCell>
                                            <TableCell>{row.country}</TableCell>
                                        </TableRow>
                                    );
                                })}

                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={8} />
                                </TableRow>
                            )}

                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No clients found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    page={page}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        </Box>
    );
}
