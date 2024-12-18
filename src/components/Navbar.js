import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
// We don't want the name 'Navbar' to conflict with the Mantine component of the same name
// So we use an alias 'MantineNavbar' to refer to the Mantine component
import { Navbar as MantineNavbar, Button, Stack } from '@mantine/core';

const Navbar = () => {
    const { logout, token } = useAuth();

    const navigate = useNavigate();
    return (
        <MantineNavbar width={{ base: 300 }} height={500} p="xs">
            <Stack>
                {/* 
                    Mantine has the notion of 'polymorphic' components. 
                    We can pass another component into this button to transform its root element form a button to a Link, but keep the styling of the button
                    See another example in Home.js on line 48
                    - Explained: https://dev.to/thexdev/polymorphic-component-2737
                */}
                <Button component={Link} to='/'>
                    Doctors
                </Button>

                <Button component={Link} to='/patients'>
                    Patients
                </Button>

                <Button component={Link} to='/appointments'>
                    Appointments
                </Button>

                <Button component={Link} to='/prescriptions'>
                    Prescriptions
                </Button>

                <Button component={Link} to='/diagnoses'>
                    Diagnoses
                </Button>

                <Button component={Link} to='/register'>
                    Register
                </Button>

                <Button component={Link} to='/login'>
                    Login
                </Button>

                {/* Only displaying the logout button if we have a token (i.e, we are logged in) */}
                {
                    token && (
                        <Button color='red' variant={'outline'} onClick={() => {
                            logout();
                            navigate('/login', { replace: true })
                        }}>Logout</Button>
                    )
                }

            </Stack>
        </MantineNavbar >
    );
};

export default Navbar;