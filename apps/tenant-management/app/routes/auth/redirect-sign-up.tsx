import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function RedirectSignUp() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/sign-up", { replace: true });
  }, [navigate]);

  return null;
}
