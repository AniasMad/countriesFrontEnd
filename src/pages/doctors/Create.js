import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form'
import { TextInput, Select, Text, Button } from "@mantine/core";

const Create = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    // This hook comes from mantine
    // This is similar to how we previously handled form state
    // We used a simple useState to store the form data
    // Along with our 'handleChange' function to update the form state
    // Mantine can handle that for us, as well as provide form validation
    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            specialisation: 'General Practitioner'
        },
        // before mantine allows us to submit the form, we can run our own validation
        validate: {
            first_name: (value) => value.length > 2 && value.length < 255 ? null : 'First name must be between 2 and 255 characters',
            last_name: (value) => value.length > 2 && value.length < 255 ? null : 'Last name must be between 2 and 255 characters',
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'), // regex for validating an email address
            phone: (value) => value.length === 10 ? null : 'Phone number must be 10 digits'
        },
    })

    const handleSubmit = () => {
        axios.post(`https://fed-medical-clinic-api.vercel.app/doctors`, form.values, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res.data)
                navigate(`../${res.data.id}`, { relative: 'path' })
            })
            .catch((err) => {
                console.error(err)

                // if our client side validation fails to catch something, we can catch it here
                // we get errors from the server, so we retrieve them here and set them to show the user
                if (err.response.status === 422) {

                    // this is an array, we want an object so have to loop through and get entries
                    let errors = err.response.data.error.issues;

                    form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])))
                }

                // SQL constraint errors have a specific message, so we can catch them and set the field error
                if (err.response.data.message == 'SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.email') {
                    console.log('Saw a unique constraint error')
                    form.setFieldError('email', 'Email must be unique.');
                }

                if (err.response.data.message == 'SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.phone') {
                    form.setFieldError('phone', 'Phone number must be unique.');
                }
            })
    }



    const specialisations = [
        'Podiatrist',
        'Dermatologist',
        'Pediatrician',
        'Psychiatrist',
        'General Practitioner',
    ]


    return (
        <div>
            <Text size={24} mb={5}>Create a doctor</Text>
            <form
                // mantine provides the onSubmit hook, included in our form object
                // this will run our handleSubmit function, but also run the form validation
                onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput withAsterisk label={'First name'} name='first_name' {...form.getInputProps('first_name')} />
                <TextInput withAsterisk label='Last name' name='last_name' {...form.getInputProps('last_name')} />

                <Select
                    withAsterisk
                    name='specialisation'
                    label="Specialisation"
                    placeholder="Pick one"
                    // this wants a value and label, in our case they are the same
                    // so map over the array and return an object with value and label as the same thing
                    data={specialisations.map(specialisation => ({ value: specialisation, label: specialisation }))}
                    {...form.getInputProps('specialisation')}
                />


                {/* form.getInputProps('email') returns an object with props about the input */}
                {/* We can spread (...) this object to pass all the props to the input all at once */}
                <TextInput label={'Email'} withAsterisk name='email' {...form.getInputProps('email')} />

                <TextInput label={'Phone'} name='phone' withAsterisk {...form.getInputProps('phone')} />

                <Button mt={10} type={'submit'}>Submit</Button>
            </form>
        </div>
    )
}

export default Create;