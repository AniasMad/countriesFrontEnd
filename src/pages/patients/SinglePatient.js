import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { Avatar, Button, Card, Group, Text, Container, Table, Loader } from "@mantine/core";

const SinglePatient = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [patientInfo, setPatientInfo] = useState(null);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [patientPrescriptions, setPatientPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch patient details, appointments, prescriptions, and doctors
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientRes, appointmentsRes, prescriptionsRes, doctorsRes] = await Promise.all([
                    axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://fed-medical-clinic-api.vercel.app/appointments", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://fed-medical-clinic-api.vercel.app/prescriptions", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://fed-medical-clinic-api.vercel.app/doctors", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setPatientInfo(patientRes.data);
                setPatientAppointments(
                    appointmentsRes.data.filter(
                        (appointment) => String(appointment.patient_id) === String(id)
                    )
                );
                setPatientPrescriptions(
                    prescriptionsRes.data.filter(
                        (prescription) => String(prescription.patient_id) === String(id)
                    )
                );
                setDoctors(doctorsRes.data);
            } catch (error) {
                console.error("Error fetching patient data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, token]);

    const getDoctorName = (doctorId) => {
        const doctor = doctors.find((doc) => String(doc.id) === String(doctorId));
        return doctor ? `${doctor.first_name} ${doctor.last_name}` : "Unknown Doctor";
    };

    // Delete patient and their appointments/prescriptions
    const deletePatient = async () => {
        if (!patientInfo) return;
        if (!window.confirm("Deleting will also cancel all this patient's appointments and prescriptions. Proceed?")) {
            return;
        }
    
        try {
            // Delete all appointments for the patient
            const patientAppointmentsIds = patientAppointments.map(appointment => appointment.id);
            await Promise.all(patientAppointmentsIds.map(id => axios.delete(`https://fed-medical-clinic-api.vercel.app/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })));
    
            // Delete all prescriptions for the patient
            const patientPrescriptionsIds = patientPrescriptions.map(prescription => prescription.id);
            await Promise.all(patientPrescriptionsIds.map(id => axios.delete(`https://fed-medical-clinic-api.vercel.app/prescriptions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })));
    
            // Now delete the patient
            await axios.delete(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Redirect to the /patients page after deletion
            navigate('/patients');
        } catch (error) {
            console.error("Error deleting patient:", error);
        }
    };
    

    // Show loading spinner
    if (loading) {
        return <Loader />;
    }

    // If no patient info is found
    if (!patientInfo) {
        return <Text>No patient found with this ID.</Text>;
    }

    return (
        <Container>
            <Card withBorder padding="xl" radius="md">
                <Card.Section
                    h={140}
                    style={{
                        backgroundImage: `url(https://api.dicebear.com/9.x/glass/svg?seed=${patientInfo.first_name})`,
                        backgroundSize: 'cover',
                    }}
                />
                <Avatar
                    src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${patientInfo.first_name}`}
                    size={80}
                    radius={80}
                    mx="auto"
                    mt={-30}
                />
                <Text ta="center" fz="lg" fw={500} mt="sm">
                    {patientInfo.first_name} {patientInfo.last_name}
                </Text>
                <Text ta="center" fz="m" c="dimmed">
                    {patientInfo.email}
                </Text>

                <Text p="md" size="xl" weight={700}>
                    Appointments
                </Text>
                {patientAppointments.length > 0 ? (
                    <Table striped highlightOnHover withBorder withColumnBorders>
                        <thead>
                            <tr>
                                <th>Appointment ID</th>
                                <th>Doctor Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.id}</td>
                                    <td>{getDoctorName(appointment.doctor_id)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Text>No appointments for this patient.</Text>
                )}

                <Text p="md" size="xl" weight={700}>
                    Prescriptions
                </Text>
                {patientPrescriptions.length > 0 ? (
                    <Table striped highlightOnHover withBorder withColumnBorders>
                        <thead>
                            <tr>
                                <th>Prescription ID</th>
                                <th>Medication</th>
                                <th>Dosage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patientPrescriptions.map((prescription) => (
                                <tr key={prescription.id}>
                                    <td>{prescription.id}</td>
                                    <td>{prescription.medication}</td>
                                    <td>{prescription.dosage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Text>No prescriptions for this patient.</Text>
                )}

                <Group position="apart" mt="xl">
                    <Button
                        fullWidth
                        radius="md"
                        size="md"
                        variant="default"
                        onClick={() => navigate(`/patients/${id}/edit`)}
                    >
                        ✏️ Edit Patient
                    </Button>
                    <Button
                        fullWidth
                        radius="md"
                        size="md"
                        variant="default"
                        onClick={deletePatient}
                    >
                        🗑️ Delete Patient
                    </Button>
                </Group>
            </Card>
        </Container>
    );
};

export default SinglePatient;
