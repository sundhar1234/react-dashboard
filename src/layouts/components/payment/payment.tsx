import './payment.css';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';
import axiosInstance from '../../../apiCall';

interface Client {
  client_id: number;
  client_name: string;
}

interface Invoice {
  invoice_id: number;
  invoice_no: string;
  invoice_date: string;
  invoice_amount: number;
}

interface Detail {
  receipt_type: '' | 'invoice' | 'on-account' | 'advance' | 'other';
  reference_ids: number[];
  amount: number;
  description: string;
}

type PaymentProps = {
  onSuccess?: () => void;
};

export default function Payment({ onSuccess }: PaymentProps) {
  const router = useRouter();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    recepit_date: '',
    recepit_amount: '',
    payment_mode: '',
    description: '',
    opening_balance: '',
    opening_balance_date: '',
  });

  const [details, setDetails] = useState<Detail[]>([{
    receipt_type: '',
    reference_ids: [],
    amount: 0,
    description: '',
  }]);

  // const [invoices, setInvoices] = useState<Invoice[]>([
  //   { invoice_id: 1, invoice_no: 'INV101', invoice_date: '2024-05-10', invoice_amount: 5000 },
  //   { invoice_id: 2, invoice_no: 'INV102', invoice_date: '2024-05-15', invoice_amount: 7500 },
  //   { invoice_id: 3, invoice_no: 'INV103', invoice_date: '2024-06-01', invoice_amount: 2500 }
  // ]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosInstance.get('/client/details');
        setClients(response.data.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
    fetchInvoices();
  }, []);
  const fetchInvoices = async () => {
    try {
      const response = await axiosInstance.get('/invoice/list');
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [name]: name === 'amount' ? +value : value,
    };
    setDetails(updatedDetails);
  };

  const handleAddDetail = () => {
    setDetails((prev) => [...prev, {
      receipt_type: '',
      reference_ids: [],
      amount: 0,
      description: '',
    }]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReferenceChange = (index: number, selectedOptions: any) => {
    const updatedDetails = [...details];
    updatedDetails[index].reference_ids = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setDetails(updatedDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      client_id: +formData.client_id,
      recepit_amount: +formData.recepit_amount,
      opening_balance: +formData.opening_balance,
      details,
    };

    try {
      await axiosInstance.post('/payment/create', payload);
      alert('Payment submitted successfully!');
      setFormData({
        client_id: '',
        recepit_date: '',
        recepit_amount: '',
        payment_mode: '',
        description: '',
        opening_balance: '',
        opening_balance_date: '',
      });
      setDetails([{ receipt_type: 'invoice', reference_ids: [], amount: 0, description: '' }]);
      onSuccess?.();
      router.push('/payment');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Check console for details.');
    }
  };

  const receiptAmount = +formData.recepit_amount || 0;
  const overallPaid = details.reduce((sum, d) => sum + d.amount, 0);
  const balance = receiptAmount - overallPaid;

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <div className="form">
          <div className="form-details">
            <label>Client Name</label>
            <Select
              name="client_id"
              options={clients.map((c) => ({ value: c.client_id, label: c.client_name }))}
              value={clients.map((c) => ({ value: c.client_id, label: c.client_name }))
                .find(opt => opt.value.toString() === formData.client_id)}
              onChange={(opt) => setFormData((prev) => ({ ...prev, client_id: opt?.value.toString() || '' }))}
              placeholder="Select Client"
              isSearchable
              isClearable
            />
          </div>
          <div className="form-details-part">
            <label>Receipt Date</label>
            <input type="date" name="recepit_date" value={formData.recepit_date} onChange={handleChange} required />
          </div>
        </div>

        <div className="form">
          <div className="form-details">
            <label>Receipt Amount</label>
            <input type="number" name="recepit_amount" value={formData.recepit_amount} onChange={handleChange} required />
          </div>
          <div className="form-details-part">
            <label>Payment Mode</label>
            <select name="payment_mode" value={formData.payment_mode} onChange={handleChange} required>
              <option value="">Select Mode</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="check">Check</option>
            </select>
          </div>
        </div>

        <div className="form">
          <div className="form-details">
            <label>Description</label>
            <textarea name="description" rows={2} value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-details-part">
            <label>Opening Balance</label>
            <input type="number" name="opening_balance" value={formData.opening_balance} onChange={handleChange} />
          </div>
        </div>

        <div className="form">
          <div className="form-details">
            <label>Opening Balance Date</label>
            <input type="date" name="opening_balance_date" value={formData.opening_balance_date} onChange={handleChange} />
          </div>
        </div>

        <hr />
        <h4>Add Payment Details</h4>
        {details.map((detail, index) => {
          const usedReferenceIds = details
            .flatMap((d, i) => (i === index ? [] : d.reference_ids))
            .filter((id, i, arr) => arr.indexOf(id) === i);

          const totalSoFar = details
            .slice(0, index + 1)
            .reduce((sum, d) => sum + d.amount, 0);

          const receiptAmount = +formData.recepit_amount || 0;
          const balance = receiptAmount - totalSoFar;

          return (
            <div key={index} className="form-block">
              <div className="form">
                <div className="form-details">
                  <label>Receipt Type</label>
                  <select
                    name="receipt_type"
                    value={detail.receipt_type}
                    onChange={(e) => handleDetailChange(index, e)}
                    required
                  >
                    <option value="">Select</option>
                    <option value="invoice">Invoice</option>
                    <option value="on-account">On Account</option>
                    <option value="advance">Advance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-details-part">
                  <label>Reference ID</label>
                  <Select
                    isMulti
                    name="reference_ids"
                    isDisabled={detail.receipt_type !== 'invoice'}
                    options={invoices.map(inv => ({
                      value: inv.invoice_id,
                      label: `#${inv.invoice_no} | ₹${inv.invoice_amount} | Dt: ${inv.invoice_date}`,
                      isDisabled: usedReferenceIds.includes(inv.invoice_id),
                    }))}
                    value={invoices
                      .filter(inv => detail.reference_ids.includes(inv.invoice_id))
                      .map(inv => ({
                        value: inv.invoice_id,
                        label: `#${inv.invoice_no} | ₹${inv.invoice_amount} | Dt: ${inv.invoice_date}`,
                      }))}
                    onChange={(opt) => handleReferenceChange(index, opt)}
                    placeholder="Select Invoices"
                    isClearable
                    isSearchable
                  />
                </div>
              </div>

              <div className="form">
                <div className="form-details">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={detail.amount}
                    onChange={(e) => handleDetailChange(index, e)}
                    required
                  />
                </div>
                <div className="form-details-part">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={detail.description}
                    onChange={(e) => handleDetailChange(index, e)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '5px', fontSize: '13px', color: 'green' }}>
                <div>Total Entered: ₹{totalSoFar}</div>
                <div>Balance: ₹{balance < 0 ? 0 : balance}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                <span
                  style={{
                    backgroundColor: 'grey',
                    borderRadius: '3px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'black',
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleRemoveDetail(index)}
                >
                  &times;
                </span>
              </div>
              <hr />
            </div>
          );
        })}

        <div style={{ padding: '5px 8px', marginBottom: '5px', cursor: 'pointer', backgroundColor: 'grey', color: 'white', width: 'fit-content', paddingInline: '10px', borderRadius: '4px' }}>
          <span onClick={handleAddDetail}> + Add</span>
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </section>
  );
}
