import React, { useState, useEffect } from 'react';
import { Box, Card, Table, Button, TableBody, Typography, TableContainer, TablePagination, TableHead, TableRow, TableCell, Checkbox, Modal, TextField, IconButton, } from '@mui/material';

import Payment from 'src/layouts/components/payment/payment';
import axiosInstance from '../../apiCall';

type PaymentType = {
  id: string | number;
  client_id: string | number;
  recepit_date: string;
  recepit_amount: string;
  payment_mode: string;
  description: string;
};

export default function PaymnetView() {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState<keyof PaymentType>('client_id');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axiosInstance.get('/payment/all-payment');
        setPayments(res.data.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSort = (id: keyof PaymentType) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const comparator = (a: PaymentType, b: PaymentType) => {
    const valA = a[orderBy]?.toString().toLowerCase() || '';
    const valB = b[orderBy]?.toString().toLowerCase() || '';
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  };

  const filteredData = payments
    .filter((payment) =>
      payment.client_id.toString().toLowerCase().includes(filterName.toLowerCase())
    )
    .sort(comparator);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredData.map((n) => n.client_id.toString());
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

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - filteredData.length);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Payments</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Add Payment
        </Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            maxWidth: '1000px',
            height: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Add Payment</Typography>
            <IconButton onClick={handleClose}>
               <button
                style={{ fontSize: '30px', background: 'none', border: 'none', cursor: 'pointer',color:"#FF0000" }}
              >
                &times;
              </button>
            </IconButton>
          </Box>
          <Payment  onSuccess={() => {
              handleClose();
            }}/>
        </Box>
      </Modal>

      <TextField
        label="Search by Client ID"
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
                <TableCell onClick={() => handleSort('client_id')}>Client ID</TableCell>
                <TableCell onClick={() => handleSort('recepit_date')}>Receipt Date</TableCell>
                <TableCell onClick={() => handleSort('recepit_amount')}>Receipt Amount</TableCell>
                <TableCell>Payment Mode</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const idStr = row.client_id.toString();
                  const isItemSelected = isSelected(idStr);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      role="checkbox"
                      selected={isItemSelected}
                      onClick={() => handleClick(idStr)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                      <TableCell>{row.client_id}</TableCell>
                      <TableCell>{row.recepit_date}</TableCell>
                      <TableCell>{row.recepit_amount}</TableCell>
                      <TableCell>{row.payment_mode}</TableCell>
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

