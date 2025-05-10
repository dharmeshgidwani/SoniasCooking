import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Signup.css"; // Import updated CSS

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault(); 
    try {
      toast.info("Sending OTP... Please wait."); 
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/signup`, form);
      toast.success("Signup successful! OTP sent to your email.");
      setIsOtpModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/verify-otp`, { email: form.email, otp });
      toast.success("Email Verified! Redirecting to home...");
      setIsOtpModalOpen(false);
      setForm({ name: "", email: "", phone: "", password: "" });
      setOtp("");

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="signup-box">
        <h2>Signup</h2>
        <form onSubmit={handleSignup}> {/* 🔹 Wrap in form */}
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button type="submit">Signup</button> 
        </form>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <>
          <div className="modal-overlay" onClick={() => setIsOtpModalOpen(false)}></div>
          <div className="otp-modal">
            <span className="close-btn" onClick={() => setIsOtpModalOpen(false)}>&times;</span>
            <h3>Verify OTP</h3>
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={handleVerifyOTP}>Verify OTP</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Signup;
