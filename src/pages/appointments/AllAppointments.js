import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Text, Table, Box, Button, Loader } from "@mantine/core";
import { useAuth } from "../../utils/useAuth";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  const navigate = useNavigate();
  const msg = useLocation()?.state?.msg || null;

  const getAppointments = async () => {
    try {
      const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    }
  };

  const getDoctors = async () => {
    try {
      const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (e) {
      console.error("Error fetching doctors:", e);
    }
  };

  const getPatients = async () => {
    try {
      const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/patients/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (e) {
      console.error("Error fetching patients:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getAppointments();
      await getDoctors();
      await getPatients();
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((doc) => doc.id === doctorId);
    return doctor ? `${doctor.first_name} ${doctor.last_name}` : "Unknown Doctor";
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((pat) => pat.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient";
  };

  const handleRowClick = (appointmentId) => {
    navigate(`/appointments/${appointmentId}/edit`);
  };

  const handleDelete = async (appointmentId) => {
    try {
      await axios.delete(`https://fed-medical-clinic-api.vercel.app/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.filter((appt) => appt.id !== appointmentId));
      alert("Appointment deleted successfully!");
    } catch (e) {
      console.error("Error deleting appointment:", e);
      alert("Failed to delete appointment!");
    }
  };

  if (loading) return <Loader />;

  const rows = appointments.map((appointment) => (
    <tr key={appointment.id} style={{ cursor: "pointer" }} onClick={() => handleRowClick(appointment.id)}>
      <td>{getDoctorName(appointment.doctor_id)}</td>
      <td>{getPatientName(appointment.patient_id)}</td>
      <td>
        <Button
          color="red"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(appointment.id);
          }}
        >
          Delete
        </Button>
      </td>
    </tr>
  ));

  return (
    <div>
      {msg && <Text mb={10} color="red">{msg}</Text>}
      <Box mb="md">
        <Button color="blue" onClick={() => navigate("/appointments/create")}>
          Create Appointment
        </Button>
      </Box>
      <Box p="md">
        <Text size="xl" weight={700} mb="sm">All Appointments</Text>
        <Table striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Patient Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Box>
    </div>
  );
};

export default AllAppointments;
