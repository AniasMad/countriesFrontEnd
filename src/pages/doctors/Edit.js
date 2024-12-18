import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { TextInput, Select, Text, Button, Loader } from "@mantine/core";
import { useEffect, useState } from 'react';

const Edit = () => {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    // Set the initial form state as empty
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            specialisation: 'General Practitioner'
        },
        validate: {
            first_name: (value) => value.length > 2 && value.length < 255 ? null : 'First name must be between 2 and 255 characters',
            last_name: (value) => value.length > 2 && value.length < 255 ? null : 'Last name must be between 2 and 255 characters',
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'), // regex for validating an email address
            phone: (value) => value.length === 10 ? null : 'Phone number must be 10 digits'
        },
    });

    const [loading, setLoading] = useState(true);

    // Fetch doctor details on page load
    useEffect(() => {
        const fetchDoctorDetails = async () => {
            try {
                const response = await axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Only update form values if the data is not already set
                if (form.values.first_name === '') {
                    form.setValues(response.data); // Populate the form with the doctor's current data
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching doctor details:', error);
                setLoading(false);
            }
        };

        fetchDoctorDetails();
    }, [id, token, form]);

    // Handle form submission to update doctor
    const handleSubmit = () => {
        axios.patch(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, form.values, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                console.log(res.data);
                navigate(`/doctors/${res.data.id}`);
            })
            .catch((err) => {
                console.error(err);

                if (err.response.status === 422) {
                    let errors = err.response.data.error.issues;
                    form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
                }

                if (err.response.data.message === 'SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.email') {
                    form.setFieldError('email', 'Email must be unique.');
                }

                if (err.response.data.message === 'SQLITE_CONSTRAINT: SQLITE error: UNIQUE constraint failed: doctors.phone') {
                    form.setFieldError('phone', 'Phone number must be unique.');
                }
            });
    };

    const specialisations = [
        'Podiatrist',
        'Dermatologist',
        'Pediatrician',
        'Psychiatrist',
        'General Practitioner',
    ];

    if (loading) return <Loader />;

    return (
        <div>
            <Text size={24} mb={5}>Edit Doctor</Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput withAsterisk label={'First name'} name='first_name' {...form.getInputProps('first_name')} />
                <TextInput withAsterisk label='Last name' name='last_name' {...form.getInputProps('last_name')} />

                <Select
                    withAsterisk
                    name='specialisation'
                    label="Specialisation"
                    placeholder="Pick one"
                    data={specialisations.map(specialisation => ({ value: specialisation, label: specialisation }))}
                    {...form.getInputProps('specialisation')}
                />

                <TextInput label={'Email'} withAsterisk name='email' {...form.getInputProps('email')} />
                <TextInput label={'Phone'} name='phone' withAsterisk {...form.getInputProps('phone')} />

                <Button mt={10} type={'submit'}>Submit</Button>
            </form>
        </div>
    );
};

export default Edit;
