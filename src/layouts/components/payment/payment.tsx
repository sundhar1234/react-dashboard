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

interface Detail {
  receipt_type: 'invoice' | 'on-account' | 'advance' | 'other';
  reference_id: number | null;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '',
    recepit_date: '',
    recepit_amount: '',
    payment_mode: '',
    description: '',
    opening_balance: '',
    opening_balance_date: '',
  });

  const [details, setDetails] = useState<Detail[]>([
    {
      receipt_type: 'invoice',
      reference_id: null,
      amount: 0,
      description: '',
    },
  ]);

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
  }, []);

  const filteredClients = clients.filter((client) =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedDetails = [...details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [name]: name === 'amount' || name === 'reference_id' ? +value : value,
    };
    setDetails(updatedDetails);
  };

  const handleAddDetail = () => {
    setDetails((prev) => [
      ...prev,
      {
        receipt_type: 'invoice',
        reference_id: null,
        amount: 0,
        description: '',
      },
    ]);
  };
  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
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
      setDetails([
        {
          receipt_type: 'invoice',
          reference_id: null,
          amount: 0,
          description: '',
        },
      ]);
      onSuccess?.();
      router.push('/payment');
      // navigate('/payment');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Check console for details.');
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <div className="form">
          <div className="form-details">
            <label>Client Name</label>
            <Select
              name="client_id"
              options={clients.map((client) => ({
                value: client.client_id,
                label: client.client_name,
              }))}
              value={
                clients
                  .map((client) => ({
                    value: client.client_id,
                    label: client.client_name,
                  }))
                  .find((option) => option.value.toString() === formData.client_id)
              }
              onChange={(selectedOption) => {
                setFormData((prev) => ({
                  ...prev,
                  client_id: selectedOption?.value.toString() || '',
                }));
              }}
              placeholder="Select Client"
              isSearchable
              isClearable
            />
          </div>
          <div className="form-details-part">
            <label>Receipt Date</label>
            <input
              type="date"
              name="recepit_date"
              value={formData.recepit_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form">
          <div className="form-details">
            <label>Receipt Amount</label>
            <input
              type="number"
              name="recepit_amount"
              value={formData.recepit_amount}
              onChange={handleChange}
              required
            />
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
            <input
              type="number"
              name="opening_balance"
              value={formData.opening_balance}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form">
          <div className="form-details">
            <label>Opening Balance Date</label>
            <input
              type="date"
              name="opening_balance_date"
              value={formData.opening_balance_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <hr />
        <h4>Add Payment Details</h4>

        {details.map((detail, index) => (
          <div key={index} className="form-block">
            <div className="form">
              <div className="form-details">
                <label>Receipt Type</label>
                <select
                  name="receipt_type"
                  value={detail.receipt_type}
                  onChange={(e) => handleDetailChange(index, e)}
                >
                  <option value="invoice">Invoice</option>
                  <option value="on-account">On Account</option>
                  <option value="advance">Advance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-details-part">
                <label>Reference ID</label>
                <input
                  type="number"
                  name="reference_id"
                  value={detail.reference_id ?? ''}
                  onChange={(e) => handleDetailChange(index, e)}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
              <span style={{ backgroundColor: 'grey', borderRadius: '3px', fontSize: '15px', fontWeight: 500, color: 'black', padding: '2px 1px', cursor: 'pointer' }} onClick={() => handleRemoveDetail(index)}>  &times;</span>
            </div>
            <hr />
          </div>
        ))}
        <div style={{ padding: '10px 0', cursor: 'pointer' }}>
          <span onClick={handleAddDetail}>  &#43;</span>
        </div>
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </section>
  );
}
