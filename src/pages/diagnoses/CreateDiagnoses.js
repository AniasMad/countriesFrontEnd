import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { Select, TextInput, Text, Button } from "@mantine/core";

const CreateDiagnoses = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);

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

    // Fetch patients
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

        fetchPatients();
    }, [token]);

    const handleSubmit = () => {
        const formattedDate = new Date(form.values.diagnosis_date).toISOString().split('T')[0];
        const diagnosisData = {
            patient_id: parseInt(form.values.patient_id, 10),
            condition: form.values.condition,
            diagnosis_date: formattedDate, 
        }; 
        axios.post(`https://fed-medical-clinic-api.vercel.app/diagnoses`, diagnosisData, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            navigate('/diagnoses', { state: { msg: 'Diagnosis created successfully!' } });
        })
        .catch((err) => {
            console.error("Error:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.error.issues;
                form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
            }
        });
    };

    return (
        <div>
            <Text size={24} mb={10}>Create a Diagnosis</Text>
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
                <Button mt={10} type="submit">Submit</Button>
            </form>
        </div>
    );
};

export default CreateDiagnoses;
