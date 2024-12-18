import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { TextInput, Text, Button, Loader } from "@mantine/core";

const EditPatient = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Get the patient ID from the URL params

    const [loading, setLoading] = useState(true);

    // Initialize form with empty values
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            address: '',
        },
        validate: {
            first_name: (value) => value.length > 2 && value.length < 255 ? null : 'First name must be between 2 and 255 characters',
            last_name: (value) => value.length > 2 && value.length < 255 ? null : 'Last name must be between 2 and 255 characters',
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            phone: (value) => value.length === 10 ? null : 'Phone number must be 10 digits',
            date_of_birth: (value) => value ? null : 'Date of birth is required',
            address: (value) => value.length > 0 ? null : 'Address is required',
        },
    });

    // Fetch the patient details
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const patient = res.data;
                
                // Set form values for the patient once fetched
                form.setValues({
                    first_name: patient.first_name || '',
                    last_name: patient.last_name || '',
                    email: patient.email || '',
                    phone: patient.phone || '',
                    date_of_birth: patient.date_of_birth || '',
                    address: patient.address || '',
                });
                setLoading(false);  // Stop loading once data is fetched
            } catch (e) {
                console.error("Error fetching patient:", e);
                // Navigate with a message if patient is not found
                if (e.response && e.response.status === 404) {
                    navigate('/patients', { state: { msg: 'Patient not found!' } });
                }
                setLoading(false);  // Stop loading if there's an error
            }
        };

        fetchPatient();
    }, [id, token, navigate]); // Trigger fetching once, no need for dependency on form

    // Handle form submission to update the patient
    const handleSubmit = () => {
        const patientData = {
            first_name: form.values.first_name,
            last_name: form.values.last_name,
            email: form.values.email,
            phone: form.values.phone,
            date_of_birth: form.values.date_of_birth, // Ensure the date format is correct
            address: form.values.address,
        };

        // Make PATCH request to update the patient
        axios.patch(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, patientData, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
            navigate('/patients', { state: { msg: 'Patient updated successfully!' } });
        })
        .catch((err) => {
            console.error("Error updating patient:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.error.issues;
                form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
            } else if (err.response && err.response.status === 404) {
                navigate('/patients', { state: { msg: 'Patient not found!' } });
            }
        });
    };

    // Display loading state while fetching data
    if (loading) return <Loader />;

    return (
        <div>
            <Text size={24} mb={10}>Edit Patient</Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    withAsterisk
                    label="First Name"
                    {...form.getInputProps('first_name')}
                />
                <TextInput
                    withAsterisk
                    label="Last Name"
                    {...form.getInputProps('last_name')}
                />
                <TextInput
                    withAsterisk
                    label="Email"
                    {...form.getInputProps('email')}
                />
                <TextInput
                    withAsterisk
                    label="Phone"
                    {...form.getInputProps('phone')}
                />
                <TextInput
                    withAsterisk
                    label="Date of Birth"
                    type="date"
                    {...form.getInputProps('date_of_birth')}
                />
                <TextInput
                    withAsterisk
                    label="Address"
                    {...form.getInputProps('address')}
                />
                <Button mt={10} type="submit">Update Patient</Button>
            </form>
        </div>
    );
};

export default EditPatient;
