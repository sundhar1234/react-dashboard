import './payment.css';

import { useEffect, useState } from 'react';

// import { useRouter } from 'src/routes/hooks';
mport { useNavigate } from 'react-router-dom';

import axiosInstance from '../../../apiCall';

// Define TypeScript type for a client
type Client = {
    client_id: number;
    client_name: string;

};

export default function Payment() {
    // const router = useRouter();
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
        details: '',
    });


    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get('/client/list-all');
                console.log(response.data, 'Fetched Clients');
                setClients(response.data.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };
        fetchClients();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting:', formData);


        try {
            const response = await axiosInstance.post('/payment/create', formData);
            console.log('Success:', response.data);
            alert('Payment submitted successfully!');
            navigate('/payment');

        } catch (error) {
            console.error('Submission error:', error);
            alert('Submission failed.');
        }
    };

    return (
        <section>
            <form onSubmit={handleSubmit}>
                <div className="form">
                    <div className="form-details">
                        <label>Client Name</label>
                        <select name="client_id" value={formData.client_id} onChange={handleChange}>
                            <option value="">Select Client</option>
                            {clients.map((client) => (
                                <option key={client.client_id} value={client.client_id}>
                                    {client.client_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-details-part">
                        <label>Receipt Date</label>
                        <input type="date" name="recepit_date" value={formData.recepit_date} onChange={handleChange} />
                    </div>
                </div>

                <div className="form">
                    <div className="form-details">
                        <label>Receipt Amount</label>
                        <input type="number" name="recepit_amount" value={formData.recepit_amount} onChange={handleChange} />
                    </div>

                    <div className="form-details-part">
                        <label>Payment Mode</label>
                        <select name="payment_mode" value={formData.payment_mode} onChange={handleChange}>
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

                    <div className="form-details-part">
                        <label>Details</label>
                        <textarea name="details" rows={2} value={formData.details} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </section>
    );
}
