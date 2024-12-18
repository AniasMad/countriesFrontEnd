import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';

import { Container, Button, SimpleGrid, Divider, Group, Paper, PaperProps, PasswordInput, Stack, Text, TextInput } from '@mantine/core';

const LoginForm = () => {
    const navigate = useNavigate();
    const {login} = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = (e) => {
        // The form will cause a refresh by default. We don't want that, because our state will disappear.
        e.preventDefault();        

        login(form.email, form.password)
        
        navigate('/')
    }

    const handleChange = (e) => {
        setForm(({
            ...form,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <Container>
    <Paper radius="md" p="xl" withBorder>
      <Text size="lg" fw={500}>
        Welcome! Please Log In.
      </Text>

      <Divider label="Continue with email" labelPosition="center" my="lg" />

      <form>
        <Stack>
          <TextInput
            required
            onChange={handleChange}
            value={form.email}
            type="email"
            name="email"
            placeholder="joe.bloggs@email.com"
            radius="md"
          />

          <PasswordInput
            required
            onChange={handleChange}
            value={form.password}
            type="password"
            name="password"
            placeholder="Password"
            radius="md"
          />

        </Stack>

        <Group justify="space-between" mt="xl">
          <Button type="submit" onClick={handleSubmit} radius="xl">
            Register
          </Button>
        </Group>
      </form>
    </Paper>     
    </Container>
    )
}

export default LoginForm