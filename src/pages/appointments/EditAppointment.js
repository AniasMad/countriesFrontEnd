import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { Select, TextInput, Text, Button, Loader } from "@mantine/core";

const EditAppointment = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Get the appointment ID from the URL params

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize form with empty values
    const form = useForm({
        initialValues: {
            doctor_id: '',
            patient_id: '',
            appointment_date: '', // For storing the appointment date
        },
        validate: {
            doctor_id: (value) => value ? null : 'Please select a doctor',
            patient_id: (value) => value ? null : 'Please select a patient',
            appointment_date: (value) => value ? null : 'Date is required',
        },
    });

    // Fetch doctors, patients and the appointment details
    useEffect(() => {
        const fetchDoctorsAndPatients = async () => {
            try {
                const [doctorRes, patientRes] = await Promise.all([
                    axios.get(`https://fed-medical-clinic-api.vercel.app/doctors`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`https://fed-medical-clinic-api.vercel.app/patients`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setDoctors(doctorRes.data);
                setPatients(patientRes.data);
            } catch (e) {
                console.error("Error fetching doctors or patients:", e);
            }
        };

        const fetchAppointment = async () => {
            try {
                const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/appointments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const appointment = res.data;
                
                // Set form values for the appointment once fetched
                form.setValues({
                    doctor_id: appointment.doctor_id || '',
                    patient_id: appointment.patient_id || '',
                    appointment_date: appointment.appointment_date
                        ? new Date(appointment.appointment_date).toISOString().split('T')[0]
                        : '',
                });
                setLoading(false);  // Stop loading once data is fetched
            } catch (e) {
                console.error("Error fetching appointment:", e);
                // Navigate with a message if appointment is not found
                if (e.response && e.response.status === 404) {
                    navigate('/appointments', { state: { msg: 'Appointment not found!' } });
                }
                setLoading(false);  // Stop loading if there's an error
            }
        };

        fetchDoctorsAndPatients();
        fetchAppointment();
    }, [id, token, navigate]); // Trigger fetching once, no need for dependency on form

    // Handle form submission to update the appointment
    const handleSubmit = () => {
        const formattedDate = new Date(form.values.appointment_date).toISOString().split('T')[0];
        
        const appointmentData = {
            id: id, // Keep the id in the request body (important to match API format)
            doctor_id: parseInt(form.values.doctor_id, 10),
            patient_id: parseInt(form.values.patient_id, 10),
            appointment_date: formattedDate, // Ensure the date format is correct
        };
    
        // Make PATCH request to update the appointment
        axios.patch(`https://fed-medical-clinic-api.vercel.app/appointment/${id}`, appointmentData, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
            navigate('/appointments', { state: { msg: 'Appointment updated successfully!' } });
        })
        .catch((err) => {
            console.error("Error updating appointment:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.error.issues;
                form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
            } else if (err.response && err.response.status === 404) {
                navigate('/appointments', { state: { msg: 'Appointment not found!' } });
            }
        });
    };

    // Display loading state while fetching data
    if (loading) return <Loader />;

    return (
        <div>
            <Text size={24} mb={10}>Edit Appointment</Text>
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
                <TextInput
                    withAsterisk
                    label="Date"
                    type="date"
                    {...form.getInputProps('appointment_date')}
                />
                <Button mt={10} type="submit">Update Appointment</Button>
            </form>
        </div>
    );
};

export default EditAppointment;
