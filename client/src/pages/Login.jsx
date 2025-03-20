import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Login.css"; // Import the updated CSS

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault(); 
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields!");
      return;
    }

    // toast.info("Logging in... Please wait!", { autoClose: 2000 });

    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", form);
      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login Successful!", { autoClose: 2000 });

      // 🔹 Redirect Admin to AdminDashboard
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}> 
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Login</button> 
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
