import { LogIn } from "lucide-react";
import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import type { JSX } from "react/jsx-runtime"
import axiosClient from "../../services/axios";
import type { LoginResponse } from "../../types/user.types";
import axios from "axios";
import { useAppDispatch } from "../../redux/hooks";
import { setUser } from "../../redux/userSlice";

interface Form {
    email: string;
    password: string;
}

export const UserLogin = (): JSX.Element => {
    const [form, setForm] = useState<Form>({
        email: "",
        password: ""
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((p) => ({
            ...p,
            [name]: value
        }));
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!form.password.trim()) {
            setError("Please enter a password.");
            return;
        }

        setError("");
        setLoading(true); // Turn on loading state

        try {
            const response = await axiosClient.post<LoginResponse>("/api/auth/login", form);

            if (response.data.success) {
                const loggedInUser = response.data.data;

                dispatch(setUser(loggedInUser));

                if (loggedInUser.role === "Customer") {
                    navigate("/customer/dashboard");

                } else if (loggedInUser.role === "Field_Cleaner") {
                    navigate("/cleaner/dashboard");

                } else if (loggedInUser.role === "Manager") {
                    navigate("/manager/dashboard");

                } else if (loggedInUser.role === "Owner") {
                    navigate("/owner/dashboard");

                }
            }

        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message);
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false); // Turn off loading state
        }
    }

    return (
        <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center bg-light p-4">
            <Row className="w-100 justify-content-center">
                <Col xs={11} sm={8} md={6} lg={4}>
                    <Card className="p-4">
                        <Card.Header className="text-center fw-bold fs-3">
                            Welcome Back!
                        </Card.Header>

                        <Card.Body>
                            {error && (
                                <Alert variant="danger" className="text-center">
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control name="email" value={form.email} onChange={handleChange} type="email" placeholder="Enter your email" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control name="password" value={form.password} onChange={handleChange} type="password" placeholder="Enter your password" />
                                </Form.Group>

                                <Button disabled={loading} type="submit" variant="primary" className="w-100 fw-bold">{loading ? " Loading..." : <>Login < LogIn size={20} /></>}</Button>
                            </Form>
                        </Card.Body>

                        {!loading && (
                            <Card.Footer className="text-center fw-light">
                                Don't have an account? <Link to={"/register"} className="text-decoration-none fw-bold">Register here</Link>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}