import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { TextInput, Button, Text, Container } from "@mantine/core";

const CreatePatient = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Form validation and initial values for creating a patient
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '', 
            address: ''
        },
        validate: {
            first_name: (value) => 
                value.length >= 2 && value.length <= 255 ? null : 'First name must be between 2 and 255 characters',
            last_name: (value) => 
                value.length >= 2 && value.length <= 255 ? null : 'Last name must be between 2 and 255 characters',
            email: (value) => 
                (/^\S+@\S+\.\S+$/.test(value) ? null : 'Please enter a valid email address'),
            phone: (value) => 
                value.length === 10 ? null : 'Phone number must be exactly 10 digits',
            date_of_birth: (value) => 
                value && value.length > 0 ? null : 'Date of birth is required',
            address: (value) => 
                value && value.length > 0 ? null : 'Address is required'
        }
    });

    // Handle form submission to create a new patient
    const handleSubmit = () => {
        axios.post(`https://fed-medical-clinic-api.vercel.app/patients`, form.values, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {
            console.log(res.data);
            navigate(`/patients/${res.data.id}`);
        })
        .catch((err) => {
            console.error(err);

            if (err.response.status === 422) {
                let errors = err.response.data.error.issues;
                form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
            }

            if (err.response.data.message == 'SQLITE_CONSTRAINT: SQLITE error: UNIQUE constraint failed: patients.email') {
                form.setFieldError('email', 'Email must be unique.');
            }

            if (err.response.data.message == 'SQLITE_CONSTRAINT: SQLITE error: UNIQUE constraint failed: patients.phone') {
                form.setFieldError('phone', 'Phone number must be unique.');
            }
        });
    };

    return (
        <Container>
            <Text size={24} mb={5}>Create a new patient</Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput withAsterisk label={'First name'} name='first_name' {...form.getInputProps('first_name')} />
                <TextInput withAsterisk label={'Last name'} name='last_name' {...form.getInputProps('last_name')} />
                <TextInput withAsterisk label={'Email'} name='email' {...form.getInputProps('email')} />
                <TextInput withAsterisk label={'Phone'} name='phone' {...form.getInputProps('phone')} />
                <TextInput withAsterisk label={'Date of Birth'} name='date_of_birth' {...form.getInputProps('date_of_birth')} />
                <TextInput withAsterisk label={'Address'} name='address' {...form.getInputProps('address')} />

                <Button mt={10} type={'submit'}>Submit</Button>
            </form>
        </Container>
    );
}

export default CreatePatient;
