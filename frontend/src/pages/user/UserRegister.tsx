import { useState } from "react";
import { Alert, Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../services/axios";
import type { AxiosResponse } from "axios";
import type { RegisterResponse } from "../../types/user.types";
import axios from "axios";

interface Form {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agree: boolean;
};

export const UserRegister: React.FC = () => {

    const [form, setForm] = useState<Form>({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agree: false,
    })

    const [userProfileImage, setUserProfileImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { type, name, value, checked } = e.target;

        setForm((p) => ({
            ...p,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = e.target.files;

        if (files?.length) {
            setUserProfileImage(files[0])
        }
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        if (!userProfileImage) {
            setError("Please upload a profile image.");
            return;
        }

        if (!form.fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!form.password.trim()) {
            setError("Please enter a password.");
            return;
        }

        if (!form.confirmPassword.trim()) {
            setError("Please confirm your password.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!form.agree) {
            setError("You must agree to the Terms & Conditions.");
            return;
        }

        setError("");
        setLoading(true); // Turn on loading state

        const data = new FormData(); // Only needed while sending 'multipart/form-data'
        data.append("profileImage", userProfileImage);
        data.append("fullName", form.fullName);
        data.append("email", form.email);
        data.append("password", form.password);

        try {
            // Send data
            const response: AxiosResponse<RegisterResponse> = await axiosClient.post<RegisterResponse>("/api/auth/register", data);

            // Redirect to login page
            if (response.data.success) {
                navigate("/");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message);
            } else {
                setError("Registration failed. Please try again.");
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
                            Welcome to <span className="text-primary">SofaCare Pro</span>
                        </Card.Header>

                        <CardBody>
                            {error && (
                                <Alert variant="danger" className="text-center">
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Profile image</Form.Label>
                                    <Form.Control name="profileImage" type="file" accept="image/*" onChange={handleImage} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control name="fullName" value={form.fullName} type="text" placeholder="Enter your full name" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control name="email" value={form.email} type="email" placeholder="Enter your email" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control name="password" value={form.password} type="password" placeholder="Create a password" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control name="confirmPassword" value={form.confirmPassword} type="password" placeholder="Confirm your password" onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check name="agree" checked={form.agree} onChange={handleChange} type="checkbox" label="I agree to the Terms & Conditions." />
                                </Form.Group>

                                <Button disabled={loading} type="submit" variant="primary" className="w-100 fw-bold">{loading ? "Loading..." : "Create Account"}</Button>
                            </Form>
                        </CardBody>

                        {!loading && (
                            <Card.Footer className="text-center fw-light">
                                Already have an account? <Link to={"/"} className="text-decoration-none fw-bold">Login here</Link>
                            </Card.Footer>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}