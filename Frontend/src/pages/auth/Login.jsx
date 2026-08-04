/* global google */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import {
  Box,
  Card,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Link,
} from "@mui/material";

import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import CustomInput from "../../components/common/CustomInput";
import CustomButton from "../../components/common/CustomButton";

import { authService } from "../../services/authService";
import { getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { emailPattern } from "../../utils/validators";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const {
    control,
    handleSubmit,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  // Google Login
 
  const handleGoogleLoginResponse = async (response) => {
    setLoading(true);
    setError("");

    try {
      const res = await authService.loginWithGoogle(response.credential);

      const { token, user: userData } = res.data;

      if (userData.role.toLowerCase() !== "employee") {
        setError(
          "This portal is for employees only. Please use the Admin panel."
        );
        return;
      }

      login(token, userData);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

 

  useEffect(() => {
    const loadGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLoginResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        {
          theme: "outline",
          size: "large",
          width: 340,
          text: "signin_with",
          shape: "pill",
        }
      );
    };

    if (window.google) {
      loadGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          loadGoogle();
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);


  useEffect(() => {
    if (user) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [user]);

  
  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setError("");

    try {
      const res = await authService.login(email, password);

      const { token, user: userData } = res.data;

      if (userData.role.toLowerCase() !== "employee") {
        setError(
          "This portal is for employees only. Please use the Admin panel."
        );
        return;
      }

      login(token, userData);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b,#334155)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: 430,
          
          p: 4,
          backdropFilter: "blur(12px)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
        >
          EMS
        </Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Employee Management System
        </Typography>

        <Typography
          variant="h5"
          align="center"
          sx={{
            mt: 4,
            fontWeight: 700,
          }}
        >
          
        </Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Login to continue
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            name="email"
            control={control}
            label="Email"
            type="email"
            rules={{
              required: "Email is required",
              pattern: emailPattern,
            }}
            startIcon={<MailOutlineRoundedIcon />}
          />

          <CustomInput
            name="password"
            control={control}
            label="Password"
            type={showPassword ? "text" : "password"}
            rules={{
              required: "Password is required",
            }}
            startIcon={<LockOutlineRoundedIcon />}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <VisibilityOffRoundedIcon />
                  ) : (
                    <VisibilityRoundedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />

          <Box
            display="flex"
            justifyContent="flex-end"
            mt={1}
          >
            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
            >
              Forgot Password?
            </Link>
          </Box>

          <CustomButton
            fullWidth
            type="submit"
            loading={loading}
            sx={{
              mt: 3,
              py: 1.4,
              borderRadius: 3,
              fontSize: 16,
            }}
          >
            Sign In
          </CustomButton>

          <Divider sx={{ my: 4 }}>
            <Typography variant="body2">
              OR
            </Typography>
          </Divider>

          <Box
            display="flex"
            justifyContent="center"
          >
            <Box id="google-login-btn"></Box>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default Login;