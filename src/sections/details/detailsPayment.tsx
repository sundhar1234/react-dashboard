import React, { useEffect, useState } from 'react';

import {
    Box, Card, Table, Checkbox, TableBody, TableContainer,
    MenuItem, Pagination, TableHead, TableRow, TableCell, TextField
} from '@mui/material';

import axiosInstance from '../../apiCall';

type ReceiptDetail = {
    id: number;
    receipt_id: number;
    reference_id: number;
    receipt_type: string;
    amount: string;
    description: string;
};

type PaymentType = {
    id: number | string;
    client_id: number | string;
    recepit_date: string;
    recepit_amount: string;
    payment_mode: string;
    description: string;
    receiptDetails: ReceiptDetail[];
};

export default function DetailsPayment() {
    const [allDetails, setAllDetails] = useState<ReceiptDetail[]>([]);
    const [filteredDetails, setFilteredDetails] = useState<ReceiptDetail[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await axiosInstance.get('/payment/all-payment');
                const details: ReceiptDetail[] = (res.data.data || []).flatMap((payment: PaymentType) =>
                    (payment.receiptDetails || []).map(detail => ({ ...detail }))
                );
                setAllDetails(details);
                setFilteredDetails(details);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        const filtered = allDetails.filter(item =>
            item.receipt_type.toLowerCase().includes(filterType.trim().toLowerCase())
        );
        setFilteredDetails(filtered);
        setPage(0);
    }, [filterType, allDetails]);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = currentPageData.map(n => n.receipt_id.toString());
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleClick = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) newSelected = [...selected, id];
        else newSelected = selected.filter(item => item !== id);

        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, value: number) => setPage(value - 1);

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const currentPageData = filteredDetails.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const isSelected = (id: string) => selected.includes(id);

    return (
        <Box p={3}>
            <TextField
                label="Search by Receipt Type"
                variant="outlined"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
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
                                        checked={selected.length === currentPageData.length && currentPageData.length > 0}
                                        indeterminate={selected.length > 0 && selected.length < currentPageData.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                <TableCell>Receipt ID</TableCell>
                                <TableCell>Reference ID</TableCell>
                                <TableCell>Receipt Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentPageData.map(row => {
                                const isItemSelected = isSelected(row.receipt_id.toString());
                                return (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        selected={isItemSelected}
                                        onClick={() => handleClick(row.receipt_id.toString())}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isItemSelected} />
                                        </TableCell>
                                        <TableCell>{row.receipt_id}</TableCell>
                                        <TableCell>{row.reference_id}</TableCell>
                                        <TableCell>{row.receipt_type}</TableCell>
                                        <TableCell>{row.amount}</TableCell>
                                        <TableCell>{row.description}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {currentPageData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No data found
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
                        onChange={handleChangeRowsPerPage}
                        size="small"
                        sx={{ width: 150 }}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                    </TextField>

                    <Pagination
                        count={Math.ceil(filteredDetails.length / rowsPerPage)}
                        page={page + 1}
                        onChange={handleChangePage}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            </Card>
        </Box>
    );
}
