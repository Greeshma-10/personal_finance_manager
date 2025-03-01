import backgroundImage from "../../assets/finance.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields", toastOptions);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", toastOptions);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/reset-password-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || "Failed to reset password", toastOptions);
        setLoading(false);
        return;
      }

      toast.success("Password reset successful! Redirecting...", toastOptions);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      toast.error("Something went wrong!", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container className="p-4" style={{ maxWidth: "400px", marginTop: "100px", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(255,255,255,0.2)" }}>
      <h2 className="text-white text-center">Reset Password</h2>
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
        <Form.Group className="mt-3">
          <Form.Label className="text-white">New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mt-3">
          <Form.Label className="text-white">Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" className="mt-3 w-100" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </Form>
    </Container>
    </div>
  );
};

export default ResetPassword;
