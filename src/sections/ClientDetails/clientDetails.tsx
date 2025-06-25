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
    MenuItem,
    Button,
    Modal
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


    const [openModal, setOpenModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
    const [outstandingValue, setOutstandingValue] = useState('');

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

    const handleViewClick = async (client: ClientType) => {
        try {
            const response = await axiosInstance.get(`/client/${client.client_id}`);
            const updatedClient = response.data;
            setSelectedClient(updatedClient);
            setOutstandingValue(updatedClient.outstanding?.toString() || '');
            setOpenModal(true);
        } catch (error) {
            console.error('Failed to fetch client by ID:', error);
        }
    };
    const handleUpdateOutstanding = async () => {
        try {
            if (selectedClient) {
                await axiosInstance.put('/client/update', {
                    client_id: selectedClient.client_id,
                    outstanding: Number(outstandingValue),
                    creditOrDebit: selectedClient.creditOrDebit
                });

                const updatedClients = clients.map((client) =>
                    client.client_id === selectedClient.client_id
                        ? { ...client, outstanding: Number(outstandingValue) }
                        : client
                );
                setClients(updatedClients);
                setOpenModal(false);
            }
        } catch (error) {
            console.error('Error updating outstanding value:', error);
        }
    };
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
                                <TableCell>Actions</TableCell>
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
                                        <TableCell>
                                            <Button variant="outlined" size="small" onClick={() => handleViewClick(row)}>
                                                View
                                            </Button>
                                        </TableCell>
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


                    <Modal open={openModal} onClose={() => setOpenModal(false)}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: 4,
                                minWidth: 800
                            }}
                        >
                            <Typography variant="h6" mb={2}>
                                Before Outstanding for <strong>{selectedClient?.outstanding ?? 0} {selectedClient?.creditOrDebit || ''}</strong>
                            </Typography>

                            <TextField
                                label="Outstanding"
                                type="number"
                                fullWidth
                                value={outstandingValue}
                                onChange={(e) => setOutstandingValue(e.target.value)}
                                margin="normal"
                            />

                            <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                                <Button variant="outlined" onClick={() => setOpenModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleUpdateOutstanding}>
                                    Update
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </Box>
            </Card>
        </Box>
    );
}
