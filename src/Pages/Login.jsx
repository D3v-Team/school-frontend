import React, { useState } from "react";
import { Button, Input } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { sweetAlert } from "../utils/sweetalert";
import bgImage from "../img/Footer.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const loginData = { login, password };
      const response = await axios.post(`/login`, loginData);
      
      if (response.status === 200) {
        let token = response.data?.data?.token;
        localStorage.setItem("token", token);
        navigate("/admin");
        sweetAlert("Muvaffaqiyatli", "success");
      }
    } catch (error) {
      let errorText = error.response?.data?.message || "Xatolik yuz berdi";
      setError(errorText);
      sweetAlert(errorText, "error");
    } finally {
      setLoading(false);
    }
  };

  // Enter tugmasini bosganda ishlaydigan funksiya
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Formning avtomatik jo‘natilishining oldini olamiz
      handleLogin();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <form 
        className="w-full max-w-md p-6 bg-white bg-opacity-90 rounded-lg shadow-lg text-center"
        onKeyDown={handleKeyDown} // Enter tugmachasini kuzatish uchun qo‘shildi
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Kirish</h2>
        <div className="space-y-4">
          <Input
            label="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            color="gray"
            type="text"
            required
            className="border-black"
          />
          <div className="relative">
            <Input
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              color="gray"
              type={showPassword ? "text" : "password"}
              required
              className="border-black pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5 text-gray-600" />
              ) : (
                <FaEye className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button
            fullWidth
            color="gray"
            onClick={handleLogin}
            className="bg-black text-white hover:bg-gray-800 capitalize text-lg"
            disabled={loading}
          >
            {loading ? "Yuklanmoqda..." : "Jo'natish"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
