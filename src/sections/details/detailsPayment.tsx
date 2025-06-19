import React, { useState, useEffect } from 'react';
import {
    Box, Card, Table, Checkbox, TableBody, TableContainer,
    TablePagination, TableHead, TableRow, TableCell, TextField,
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
    const [details, setDetails] = useState<ReceiptDetail[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selected, setSelected] = useState<string[]>([]);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<keyof ReceiptDetail>('receipt_id');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await axiosInstance.get('/payment/all-payment');
                // Flatten receiptDetails from all payments
                const allReceiptDetails: ReceiptDetail[] = res.data.data.flatMap((payment: PaymentType) =>
                    payment.receiptDetails.map(detail => ({
                        ...detail,
                    }))
                );
                setDetails(allReceiptDetails);
            } catch (error) {
                console.error('Error fetching payments:', error);
            }
        };
        fetchPayments();
    }, []);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredData.map((n) => n.receipt_id.toString());
            setSelected(newSelected);
        } else {
            setSelected([]);
        }
    };

    const handleClick = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter((item) => item !== id);
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0);
    };

    const comparator = (a: ReceiptDetail, b: ReceiptDetail) => {
        const valA = a[orderBy]?.toString().toLowerCase() || '';
        const valB = b[orderBy]?.toString().toLowerCase() || '';
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    };

    const filteredData = details
        .filter((item) => item.receipt_id.toString().includes(filterName.toLowerCase()))
        .sort(comparator);

    const isSelected = (id: string) => selected.indexOf(id) !== -1;
    const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filteredData.length);

    return (
        <Box p={3}>
            <TextField
                label="Search by Receipt ID"
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
                                <TableCell>Receipt ID</TableCell>
                                <TableCell>Reference ID</TableCell>
                                <TableCell>Receipt Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
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
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No data found
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
