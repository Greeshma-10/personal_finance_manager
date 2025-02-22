import backgroundImage from "../../assets/finance.jpg"; // Adjust the path as needed

import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./auth.css";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/"); // Redirect if user is already logged in
    }
  }, [navigate]);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password } = values;

    if (!name || !email || !password) {
      toast.error("All fields are required!", toastOptions);
      return;
    }

    setLoading(true);

    // Retrieve existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email is already registered
    const userExists = existingUsers.find((user) => user.email === email);
    if (userExists) {
      toast.error("Email already registered. Please log in.", toastOptions);
      setLoading(false);
      return;
    }

    // Store new user
    const newUser = { name, email, password };
    const updatedUsers = [...existingUsers, newUser];

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("user", JSON.stringify(newUser)); // Store logged-in user

    toast.success("Registration successful!", toastOptions);

    setTimeout(() => {
      navigate("/"); // Redirect to homepage after success
    }, 2000);
  };

  return (
    <>
      <div
        className="register-container"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container className="form-container">
  <h2 className="text-white text-center">Sign Up</h2>
  <Form onSubmit={handleSubmit}>
    <Form.Group >
      <Form.Label className="text-white">Name</Form.Label>
      <Form.Control
        type="text"
        name="name"
        placeholder="Full name"
        value={values.name}
        onChange={handleChange}
        className="input-field"
      />
    </Form.Group>

    <Form.Group >
      <Form.Label className="text-white">Email</Form.Label>
      <Form.Control
        type="email"
        name="email"
        placeholder="Enter email"
        value={values.email}
        onChange={handleChange}
        className="input-field"
      />
    </Form.Group>

    <Form.Group >
      <Form.Label className="text-white">Password</Form.Label>
      <Form.Control
        type="password"
        name="password"
        placeholder="Password"
        value={values.password}
        onChange={handleChange}
        className="input-field"
      />
    </Form.Group>

    <Button type="submit" className="mt-3 btn-style" disabled={loading}>
      {loading ? "Registering..." : "Signup"}
    </Button>

    <p className="mt-2 text-center" style={{ color: "#ccc", fontSize: "14px" }}>
      Already have an account? <Link to="/login" className="text-white">Login</Link>
    </p>
  </Form>
</Container>

        <ToastContainer />
      </div>
    </>
  );
};

export default Register;
