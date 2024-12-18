import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { Select, TextInput, Text, Button, Loader } from "@mantine/core";

const EditDiagnoses = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Get the diagnosis ID from the URL params

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize form with empty values
    const form = useForm({
        initialValues: {
            patient_id: '',
            condition: '',
            diagnosis_date: '',
        },
        validate: {
            patient_id: (value) => value ? null : 'Please select a patient',
            condition: (value) => value ? null : 'Condition is required',
            diagnosis_date: (value) => value ? null : 'Date is required',
        },
    });

    // Fetch patients and the diagnosis details
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/patients`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPatients(res.data);
            } catch (e) {
                console.error("Error fetching patients:", e);
            }
        };

        const fetchDiagnosis = async () => {
            try {
                const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/diagnoses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const diagnosis = res.data;

                // Set form values for the diagnosis once fetched
                form.setValues({
                    patient_id: diagnosis.patient_id || '',
                    condition: diagnosis.condition || '',
                    diagnosis_date: diagnosis.diagnosis_date
                        ? new Date(diagnosis.diagnosis_date).toISOString().split('T')[0]
                        : '',
                });
                setLoading(false);  // Stop loading once data is fetched
            } catch (e) {
                console.error("Error fetching diagnosis:", e);
                // Navigate with a message if diagnosis is not found
                if (e.response && e.response.status === 404) {
                    navigate('/diagnoses', { state: { msg: 'Diagnosis not found!' } });
                }
                setLoading(false);  // Stop loading if there's an error
            }
        };

        fetchPatients();
        fetchDiagnosis();
    }, [id, token, navigate]); // Trigger fetching once, no need for dependency on form

    // Handle form submission to update the diagnosis
    const handleSubmit = () => {
        const formattedDate = new Date(form.values.diagnosis_date).toISOString().split('T')[0];
        
        const diagnosisData = {
            id: id, // Keep the id in the request body (important to match API format)
            patient_id: parseInt(form.values.patient_id, 10),
            condition: form.values.condition,
            diagnosis_date: formattedDate, // Ensure the date format is correct
        };
    
        // Make PATCH request to update the diagnosis
        axios.patch(`https://fed-medical-clinic-api.vercel.app/diagnoses/${id}`, diagnosisData, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
            navigate('/diagnoses', { state: { msg: 'Diagnosis updated successfully!' } });
        })
        .catch((err) => {
            console.error("Error updating diagnosis:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.error.issues;
                form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
            } else if (err.response && err.response.status === 404) {
                navigate('/diagnoses', { state: { msg: 'Diagnosis not found!' } });
            }
        });
    };

    // Display loading state while fetching data
    if (loading) return <Loader />;

    return (
        <div>
            <Text size={24} mb={10}>Edit Diagnosis</Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Select
                    withAsterisk
                    label="Select Patient"
                    placeholder="Pick a patient"
                    data={patients.map(patient => ({
                        value: patient.id,
                        label: `${patient.first_name} ${patient.last_name}`,
                    }))}
                    {...form.getInputProps('patient_id')}
                />
                <TextInput
                    withAsterisk
                    label="Condition"
                    placeholder="Enter diagnosis condition"
                    {...form.getInputProps('condition')}
                />
                <TextInput
                    withAsterisk
                    label="Diagnosis Date"
                    type="date"
                    {...form.getInputProps('diagnosis_date')}
                />
                <Button mt={10} type="submit">Update Diagnosis</Button>
            </form>
        </div>
    );
};

export default EditDiagnoses;
