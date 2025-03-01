import backgroundImage from "../../assets/finance.jpg";
import { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Add useNavigate

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      toast.error("Please enter your username", toastOptions);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || "Failed to generate reset token", toastOptions);
        setLoading(false);
        return;
      }

      toast.success("Reset token generated! Redirecting...", toastOptions);
      
      // ✅ Redirect to Reset Password Page after success
      setTimeout(() => navigate("/reset-password"), 3000);
    } catch (error) {
      toast.error("Something went wrong!", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container className="p-4" style={{ maxWidth: "400px", marginTop: "100px", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(255,255,255,0.2)" }}>
      <h2 className="text-white text-center">Forgot Password</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mt-3">
          <Form.Label className="text-white">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="mt-3 w-100" disabled={loading}>
          {loading ? "Processing..." : "Generate Reset Token"}
        </Button>
      </Form>
      <p className="mt-3 text-white text-center">
        <Link to="/login" className="text-white">Back to Login</Link>
      </p>
    </Container>
    </div>
  );
};

export default ForgotPassword;
