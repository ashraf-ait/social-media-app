import "./form.css";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useState } from "react";
import { IonIcon } from "@ionic/react";
import { mailOutline,lockClosedOutline } from "ionicons/icons";
import { useDispatch } from "react-redux";
import { loginUser } from "../../redux/apiCalls/authApiCall";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const dispatch = useDispatch();

  // From Submit Handler
  const formSubmitHandler = (e) => {
    e.preventDefault();
    if (email.trim() === "") return toast.error("Email is required");
    if (password.trim() === "") return toast.error("Password is required");

    dispatch(loginUser({ email, password }));
  };

  return (
    <section className="form-container">
      <h1 className="form-title">Login</h1>
      <form onSubmit={formSubmitHandler} className="form">


        <div className="form-group">
          <label htmlFor="email" className="form-label">
          
           
          </label>

          <IonIcon icon={mailOutline} className="icon" />
          <input
          
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            id="email"
            placeholder="Enter your email"
            className="form-input"
          />
        </div>


        <div className="form-group">
          <label htmlFor="password" className="form-label">
          
          </label>
          <IonIcon icon={lockClosedOutline} className="icon" />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            id="password"
            placeholder="Enter your password"
            className="form-input"
          />
        </div>
        <button type="submit" className="form-btn">
          Login
        </button>
      </form>
      <div className="form-footer">
        Did you forget your password?{" "}
        <Link to="/forgot-password">Forgot Password</Link>
      </div>
    </section>
  );
};

export default Login;
