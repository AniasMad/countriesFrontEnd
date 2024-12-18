import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { Table, Button, Text, Loader, Box } from "@mantine/core";

const AllDiagnoses = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [diagnoses, setDiagnoses] = useState([]);
    const [patients, setPatients] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch all diagnoses
    useEffect(() => {
        const fetchDiagnoses = async () => {
            try {
                const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/diagnoses`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDiagnoses(res.data);
                setLoading(false);

                // Fetch patient data for each diagnosis
                res.data.forEach(async (diagnosis) => {
                    if (!patients[diagnosis.patient_id]) {
                        try {
                            const patientRes = await axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${diagnosis.patient_id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            setPatients((prevPatients) => ({
                                ...prevPatients,
                                [diagnosis.patient_id]: patientRes.data,
                            }));
                        } catch (e) {
                            console.error(`Error fetching patient with id ${diagnosis.patient_id}:`, e);
                        }
                    }
                });
            } catch (e) {
                console.error("Error fetching diagnoses:", e);
                setLoading(false);
            }
        };

        fetchDiagnoses();
    }, [token, patients]);

    if (loading) return <Loader />;

    // Handle delete button click
    const handleDelete = async (diagnosisId) => {
        try {
            await axios.delete(`https://fed-medical-clinic-api.vercel.app/diagnoses/${diagnosisId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove deleted diagnosis from the state
            setDiagnoses(diagnoses.filter((diag) => diag.id !== diagnosisId));
            alert("Diagnosis deleted successfully!");
        } catch (e) {
            console.error("Error deleting diagnosis:", e);
            alert("Failed to delete diagnosis!");
        }
    };

    // Helper function to format dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); 
    };
    
    const handleRowClick = (diagnosisId) => {
        navigate(`/diagnoses/${diagnosisId}/edit`);
    };

    return (
        <div>
            <Text size={24} weight={700} mb={10}>Diagnoses List</Text>
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
                    onClick={() => navigate('/diagnoses/create')}
                >
                    Create Diagnosis
                </Button>
            </Box>
            <Box p="md">
                <Table striped highlightOnHover withBorder withColumnBorders>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Condition</th>
                            <th>Diagnosis Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diagnoses.map((diagnosis) => {
                            const patient = patients[diagnosis.patient_id];
                            return (
                                <tr
                                    key={diagnosis.id}
                                    onClick={() => handleRowClick(diagnosis.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        {patient
                                            ? `${patient.first_name} ${patient.last_name}`
                                            : 'Loading patient...'}
                                    </td>
                                    <td>{diagnosis.condition}</td>
                                    <td>{formatDate(diagnosis.diagnosis_date)}</td>
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
                                                handleDelete(diagnosis.id);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Box>
        </div>
    );
};

export default AllDiagnoses;
