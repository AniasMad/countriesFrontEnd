import { useEffect, useState } from "react";
import axios from 'axios'
import { useLocation, useNavigate } from "react-router-dom";
import { Card, SimpleGrid, Button, Text, Flex, Avatar, Paper } from "@mantine/core";

const AllPatients = () => {
    const [patients, setPatients] = useState([])

    const navigate = useNavigate();

    // We saw in a previous class how our ProtectedRoute checks for authorisation
    // if no token is found, it redirects to the '/' route, passing a 'msg' via the route state
    // if there is a message, we retrieve it here and display it
    const msg = useLocation()?.state?.msg || null;

    const getPatients = async () => {
        try {
            const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/patients/`);
            setPatients(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        // We can't make useEffect itself async, so we call an async function from inside it
        const fetchData = async () => {
            await getPatients();
        }

        fetchData();
    }, []);


    if (!patients.length) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {msg && <Text mb={10} color='red'>{msg}</Text>}
            <Button mb={10} onClick={() => navigate('/patients/create')}>Create Patient</Button>
            <SimpleGrid cols={2}>

                {
                    patients && patients.map((patient) => {
                        return (
                            <div>
                                <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)" shadow="sm">
                                    <Avatar
                                        src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${patient.first_name}`}
                                        size={120}
                                        radius={120}
                                        mx="auto"
                                    />
                                    <Flex justify={'center'} direction={'column'} gap={6}>
                                        <Text ta="center" fz="lg" fw={500} mt="md">
                                            {patient.first_name} {patient.last_name}
                                        </Text>
                                        <Flex justify={'center'} direction={'Row'} gap={4}>
                                        <Button variant="default" onClick={() => navigate(`/patients/${patient.id}`)}>View</Button>
                                        </Flex>
                                    </Flex>
                                </Paper>
                            </div>
                        )
                    })
                }
            </SimpleGrid>
        </div>
    );
};

export default AllPatients;