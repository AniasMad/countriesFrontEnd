import { useEffect, useState } from "react";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { Avatar, Button, Card, Group, Text, Container, Table, Loader } from '@mantine/core';

const SingleDoctor = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctorInfo, setDoctorInfo] = useState(null);
    const [doctorAppointments, setDoctorAppointments] = useState([]);
    const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch doctor details, appointments, prescriptions, and patients
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorRes, appointmentsRes, prescriptionsRes, patientsRes] = await Promise.all([
                    axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('https://fed-medical-clinic-api.vercel.app/appointments', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('https://fed-medical-clinic-api.vercel.app/prescriptions', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('https://fed-medical-clinic-api.vercel.app/patients', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setDoctorInfo(doctorRes.data);
                setDoctorAppointments(
                    appointmentsRes.data.filter(appointment => String(appointment.doctor_id) === String(id))
                );
                setDoctorPrescriptions(
                    prescriptionsRes.data.filter(prescription => String(prescription.doctor_id) === String(id))
                );
                setPatients(patientsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, token]);

    const deleteDoctor = async () => {
        if (!doctorInfo) return;
        if (!window.confirm("Deleting will also cancel all this doctor's appointments and prescriptions. Proceed?")) {
            return;
        }

        try {
            await axios.delete(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/');
        } catch (error) {
            console.error("Error deleting doctor:", error);
        }
    };

    // Show loading spinner
    if (loading) {
        return <Loader />;
    }

    // If no doctor info is found
    if (!doctorInfo) {
        return <Text>No doctor found with this ID.</Text>;
    }

    return (
        <Container>
            <Card withBorder padding="xl" radius="md">
                <Card.Section
                    h={140}
                    style={{
                        backgroundImage: `url(https://api.dicebear.com/9.x/glass/svg?seed=${doctorInfo.first_name})`,
                        backgroundSize: 'cover',
                    }}
                />
                <Avatar
                    src={`https://api.dicebear.com/9.x/micah/svg?seed=${doctorInfo.first_name}`}
                    size={80}
                    radius={80}
                    mx="auto"
                    mt={-30}
                />
                <Text ta="center" fz="lg" fw={500} mt="sm">
                    {doctorInfo.first_name} {doctorInfo.last_name}
                </Text>
                <Text ta="center" fz="m" c="dimmed">
                    {doctorInfo.specialisation}
                </Text>

                <Text p="md" size="xl" weight={700}>
                    Appointments
                </Text>
                {doctorAppointments.length > 0 ? (
                    <Table striped highlightOnHover withBorder withColumnBorders>
                        <thead>
                            <tr>
                                <th>Appointment ID</th>
                                <th>Patient Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctorAppointments.map((appointment) => {
                                const patient = patients.find(
                                    p => String(p.id) === String(appointment.patient_id)
                                );
                                return (
                                    <tr key={appointment.id}>
                                        <td>{appointment.id}</td>
                                        <td>
                                            {patient
                                                ? `${patient.first_name} ${patient.last_name}`
                                                : "Unknown Patient"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                ) : (
                    <Text>No appointments for this doctor.</Text>
                )}

                <Text p="md" size="xl" weight={700}>
                    Prescriptions
                </Text>
                {doctorPrescriptions.length > 0 ? (
                    <Table striped highlightOnHover withBorder withColumnBorders>
                        <thead>
                            <tr>
                                <th>Prescription ID</th>
                                <th>Medication</th>
                                <th>Dosage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctorPrescriptions.map((prescription) => (
                                <tr key={prescription.id}>
                                    <td>{prescription.id}</td>
                                    <td>{prescription.medication}</td>
                                    <td>{prescription.dosage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Text>No prescriptions for this doctor.</Text>
                )}

                <Group position="apart" mt="xl">
                    <Button
                        fullWidth
                        radius="md"
                        size="md"
                        variant="default"
                        onClick={() => navigate(`/doctors/${id}/edit`)}
                    >
                        ✏️ Edit Doctor
                    </Button>
                    <Button
                        fullWidth
                        radius="md"
                        size="md"
                        variant="default"
                        onClick={deleteDoctor}
                    >
                        🗑️ Delete Doctor
                    </Button>
                </Group>
            </Card>
        </Container>
    );
};

export default SingleDoctor;
