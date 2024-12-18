import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import { Select, TextInput, Text, Button } from "@mantine/core";

const CreatePrescription = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]); // Fetch diagnoses

  const form = useForm({
    initialValues: {
      doctor_id: "",
      patient_id: "",
      diagnosis_id: "", // Add diagnosis_id field
      medication: "",
      dosage: "",
      start_date: "",
      end_date: "",
    },
    validate: {
      doctor_id: (value) => (value ? null : "Please select a doctor"),
      patient_id: (value) => (value ? null : "Please select a patient"),
      diagnosis_id: (value) => (value ? null : "Please select a diagnosis"),
      medication: (value) => (value ? null : "Medication is required"),
      dosage: (value) => (value ? null : "Dosage is required"),
      start_date: (value) => (value ? null : "Start date is required"),
      end_date: (value) => (value ? null : "End date is required"),
    },
  });

  // Fetch doctors, patients, and diagnoses
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (e) {
        console.error("Error fetching doctors:", e);
      }
    };

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

    const fetchDiagnoses = async () => {
      try {
        const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/diagnoses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDiagnoses(res.data);
      } catch (e) {
        console.error("Error fetching diagnoses:", e);
      }
    };

    fetchDoctors();
    fetchPatients();
    fetchDiagnoses();
  }, [token]);

  const handleSubmit = () => {
    const formattedStartDate = new Date(form.values.start_date).toISOString().split("T")[0];
    const formattedEndDate = new Date(form.values.end_date).toISOString().split("T")[0];

    const prescriptionData = {
      doctor_id: parseInt(form.values.doctor_id, 10),
      patient_id: parseInt(form.values.patient_id, 10),
      diagnosis_id: parseInt(form.values.diagnosis_id, 10), // Ensure diagnosis_id is provided
      medication: form.values.medication,
      dosage: form.values.dosage,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    };

    axios
      .post(`https://fed-medical-clinic-api.vercel.app/prescriptions`, prescriptionData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        navigate("/prescriptions", { state: { msg: "Prescription created successfully!" } });
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
      <Text size={24} mb={10}>
        Create a Prescription
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          withAsterisk
          label="Select Doctor"
          placeholder="Pick a doctor"
          data={doctors.map((doctor) => ({
            value: doctor.id,
            label: `${doctor.first_name} ${doctor.last_name}`,
          }))}
          {...form.getInputProps("doctor_id")}
        />
        <Select
          withAsterisk
          label="Select Patient"
          placeholder="Pick a patient"
          data={patients.map((patient) => ({
            value: patient.id,
            label: `${patient.first_name} ${patient.last_name}`,
          }))}
          {...form.getInputProps("patient_id")}
        />
        <Select
          withAsterisk
          label="Select Diagnosis"
          placeholder="Pick a diagnosis"
          data={diagnoses.map((diagnosis) => ({
            value: diagnosis.id,
            label: diagnosis.condition, // Use condition field for diagnosis name
          }))}
          {...form.getInputProps("diagnosis_id")}
        />
        <TextInput
          withAsterisk
          label="Medication"
          placeholder="Enter medication name"
          {...form.getInputProps("medication")}
        />
        <TextInput
          withAsterisk
          label="Dosage"
          placeholder="Enter dosage"
          {...form.getInputProps("dosage")}
        />
        <TextInput
          withAsterisk
          label="Start Date"
          type="date"
          {...form.getInputProps("start_date")}
        />
        <TextInput
          withAsterisk
          label="End Date"
          type="date"
          {...form.getInputProps("end_date")}
        />
        <Button mt={10} type="submit">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default CreatePrescription;
