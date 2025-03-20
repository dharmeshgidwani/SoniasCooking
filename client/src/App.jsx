import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Recipe from "./pages/Recipe.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Navbar from "./components/Navbar";
;

const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.role === "admin";
};

function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="recipe/:recipeId" element={<Recipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/admin"
            element={isAdmin() ? <AdminDashboard /> : <Navigate to="/login" />}
          />
        </Routes>
    </Router>
  );
}

export default App;
