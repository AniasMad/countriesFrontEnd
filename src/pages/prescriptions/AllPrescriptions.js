import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Text, Table, Box, Button } from "@mantine/core";
import { useAuth } from "../../utils/useAuth";

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  const { token } = useAuth();
  const navigate = useNavigate();
  const msg = useLocation()?.state?.msg || null;

  // Fetch all appointments, doctors, and patients
  const getAppointments = async () => {
    try {
      const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(res.data);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    }
  };

  const getDoctors = async () => {
    try {
      const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(res.data);
    } catch (e) {
      console.error("Error fetching doctors:", e);
    }
  };

  const getPatients = async () => {
    try {
      const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/patients/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPatients(res.data);
    } catch (e) {
      console.error("Error fetching patients:", e);
    }
  };

  // Call fetch functions on component mount
  useEffect(() => {
    const fetchData = async () => {
      await getAppointments();
      await getDoctors();
      await getPatients();
      setLoading(false); // Set loading to false once all data is fetched
    };
    fetchData();
  }, [token]);

  // Get doctor name by ID
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((doc) => doc.id === doctorId);
    return doctor ? `${doctor.first_name} ${doctor.last_name}` : "Unknown Doctor";
  };

  // Get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find((pat) => pat.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient";
  };

  // Navigate to the edit appointment page
  const handleRowClick = (appointmentId) => {
    navigate(`/appointments/${appointmentId}/edit`);
  };

  // Delete appointment function
  const handleDelete = async (appointmentId) => {
    try {
      await axios.delete(`https://fed-medical-clinic-api.vercel.app/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove deleted appointment from the state
      setAppointments(appointments.filter((appt) => appt.id !== appointmentId));
      alert("Appointment deleted successfully!");
    } catch (e) {
      console.error("Error deleting appointment:", e);
      alert("Failed to delete appointment!");
    }
  };

  // Show loading state until data is fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render rows in the table
  const rows = appointments.map((appointment) => (
    <tr
      key={appointment.id}
      style={{ cursor: "pointer" }}
      onClick={() => handleRowClick(appointment.id)}
    >
      <td>{getDoctorName(appointment.doctor_id)}</td>
      <td>{getPatientName(appointment.patient_id)}</td>
      <td>
        <Button
          style={{
            background: "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click from triggering
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
      {msg && (
        <Text mb={10} color="red">
          {msg}
        </Text>
      )}
      <Box mb="md">
        <Button
          style={{
            padding: "10px 15px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/appointments/create")}
        >
          Create Appointment
        </Button>
      </Box>
      <Box p="md">
        <Text size="xl" weight={700} mb="sm">
          All Appointments
        </Text>
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
