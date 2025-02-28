import backgroundImage from "../../assets/finance.jpg";
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:4000/api/auth/verifyToken", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });

        // ✅ Ensure response is JSON before parsing
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          if (!response.ok) throw new Error(data.message || "Unauthorized");
        } catch {
          throw new Error("Invalid response format. Possible backend error.");
        }

      } catch (error) {
        console.error("❌ Token verification failed:", error.message);
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = values;

    if (!email || !password) {
      toast.error("Please fill in all fields", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid email or password!", toastOptions);
        setLoading(false);
        return;
      }

      toast.success("Login successful!", toastOptions);
      localStorage.setItem("token", data.token);
      setTimeout(() => navigate("/"), 1000);

    } catch (error) {
      toast.error("Something went wrong!", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      
      <Container className="p-4" style={{ maxWidth: "400px", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(255,255,255,0.2)" }}>
        
        <Row>
          <Col>
            <h1 className="text-center">
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "white" }} />
            </h1>
            <h2 className="text-white text-center">Login</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail" className="mt-3">
                <Form.Label className="text-white">Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" name="email" onChange={handleChange} value={values.email} />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label className="text-white">Password</Form.Label>
                <Form.Control type="password" name="password" placeholder="Password" onChange={handleChange} value={values.password} />
              </Form.Group>

              <div className="mt-4 text-center">
                <Link to="/forgotPassword" className="text-white">Forgot Password?</Link>

                <Button type="submit" className="mt-3 w-100" disabled={loading}>
                  {loading ? "Signing in…" : "Login"}
                </Button>

                <p className="mt-3 text-white">
                  Don't Have an Account? <Link to="/register" className="text-white">Register</Link>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;
