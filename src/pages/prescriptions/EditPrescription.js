import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { Select, TextInput, Text, Button, Loader } from "@mantine/core";

const EditPrescription = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Get the prescription ID from the URL params

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize form with empty values
    const form = useForm({
        initialValues: {
            doctor_id: '',
            patient_id: '',
            diagnosis_id: '',
            medication: '',
            dosage: '',
            start_date: '',
            end_date: '',
        },
        validate: {
            doctor_id: (value) => value ? null : 'Please select a doctor',
            patient_id: (value) => value ? null : 'Please select a patient',
            diagnosis_id: (value) => value ? null : 'Please select a diagnosis',
            medication: (value) => value ? null : 'Medication is required',
            dosage: (value) => value ? null : 'Dosage is required',
            start_date: (value) => value ? null : 'Start date is required',
            end_date: (value) => value ? null : 'End date is required',
        },
    });

    // Fetch doctors, patients, diagnoses, and the prescription details
    useEffect(() => {
        const fetchDoctorsAndPatients = async () => {
            try {
                const [doctorRes, patientRes, diagnosisRes] = await Promise.all([
                    axios.get(`https://fed-medical-clinic-api.vercel.app/doctors`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`https://fed-medical-clinic-api.vercel.app/patients`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`https://fed-medical-clinic-api.vercel.app/diagnoses`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setDoctors(doctorRes.data);
                setPatients(patientRes.data);
                setDiagnoses(diagnosisRes.data);
            } catch (e) {
                console.error("Error fetching doctors, patients or diagnoses:", e);
            }
        };

        const fetchPrescription = async () => {
            try {
                const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/prescriptions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const prescription = res.data;
                
                // Set form values for the prescription once fetched
                form.setValues({
                    doctor_id: prescription.doctor_id || '',
                    patient_id: prescription.patient_id || '',
                    diagnosis_id: prescription.diagnosis_id || '',
                    medication: prescription.medication || '',
                    dosage: prescription.dosage || '',
                    start_date: prescription.start_date
                        ? new Date(prescription.start_date).toISOString().split('T')[0]
                        : '',
                    end_date: prescription.end_date
                        ? new Date(prescription.end_date).toISOString().split('T')[0]
                        : '',
                });
                setLoading(false);  // Stop loading once data is fetched
            } catch (e) {
                console.error("Error fetching prescription:", e);
                // Navigate with a message if prescription is not found
                if (e.response && e.response.status === 404) {
                    navigate('/prescriptions', { state: { msg: 'Prescription not found!' } });
                }
                setLoading(false);  // Stop loading if there's an error
            }
        };

        fetchDoctorsAndPatients();
        fetchPrescription();
    }, [id, token, navigate]); // Trigger fetching once, no need for dependency on form

    // Handle form submission to update the prescription
    const handleSubmit = () => {
        const prescriptionData = {
            id: id, // Keep the id in the request body (important to match API format)
            doctor_id: parseInt(form.values.doctor_id, 10),
            patient_id: parseInt(form.values.patient_id, 10),
            diagnosis_id: parseInt(form.values.diagnosis_id, 10),
            medication: form.values.medication,
            dosage: form.values.dosage,
            start_date: form.values.start_date, 
            end_date: form.values.end_date, 
        };
    
        // Make PATCH request to update the prescription
        axios.patch(`https://fed-medical-clinic-api.vercel.app/prescriptions/${id}`, prescriptionData, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
            navigate('/prescriptions', { state: { msg: 'Prescription updated successfully!' } });
        })
        .catch((err) => {
            console.error("Error updating prescription:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.error.issues;
                form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
            } else if (err.response && err.response.status === 404) {
                navigate('/prescriptions', { state: { msg: 'Prescription not found!' } });
            }
        });
    };

    // Display loading state while fetching data
    if (loading) return <Loader />;

    return (
        <div>
            <Text size={24} mb={10}>Edit Prescription</Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Select
                    withAsterisk
                    label="Select Doctor"
                    placeholder="Pick a doctor"
                    data={doctors.map(doctor => ({
                        value: doctor.id,
                        label: `${doctor.first_name} ${doctor.last_name}`,
                    }))}
                    {...form.getInputProps('doctor_id')}
                />
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
                <Select
                    withAsterisk
                    label="Select Diagnosis"
                    placeholder="Pick a diagnosis"
                    data={diagnoses.map(diagnosis => ({
                        value: diagnosis.id,
                        label: diagnosis.condition,
                    }))}
                    {...form.getInputProps('diagnosis_id')}
                />
                <TextInput
                    withAsterisk
                    label="Medication"
                    {...form.getInputProps('medication')}
                />
                <TextInput
                    withAsterisk
                    label="Dosage"
                    {...form.getInputProps('dosage')}
                />
                <TextInput
                    withAsterisk
                    label="Start Date"
                    type="date"
                    {...form.getInputProps('start_date')}
                />
                <TextInput
                    withAsterisk
                    label="End Date"
                    type="date"
                    {...form.getInputProps('end_date')}
                />
                <Button mt={10} type="submit">Update Prescription</Button>
            </form>
        </div>
    );
};

export default EditPrescription;
