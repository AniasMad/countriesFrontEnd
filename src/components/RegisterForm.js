import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";
import { Container, Button, SimpleGrid, Divider, Group, Paper, PaperProps, PasswordInput, Stack, Text, TextInput } from '@mantine/core';

const RegisterForm = (props) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    // The form will cause a refresh by default. We don't want that, because our state will disappear.
    e.preventDefault();

    axios
      .post(`https://fed-medical-clinic-api.vercel.app/register`, form)
      .then((res) => {
        console.log(res);

        localStorage.setItem("user", JSON.stringify(res.data.user));

        login(form.email, form.password);

        navigate("/");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container>
    <Paper radius="md" p="xl" withBorder>
      <Text size="lg" fw={500}>
        Welcome! Please Create an Account.
      </Text>

      <Divider label="Continue with email" labelPosition="center" my="lg" />

      <form>
        <Stack>
          <TextInput
            onChange={handleChange}
            value={form.first_name}
            type="text"
            name="first_name"
            placeholder="First Name"
            radius="md"
          />
          <TextInput
              onChange={handleChange}
              value={form.last_name}
              type="text"
              name="last_name"
              placeholder="Last Name"
              radius="md"
            />

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
  );
};

export default RegisterForm;
