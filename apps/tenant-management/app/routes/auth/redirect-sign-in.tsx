import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function RedirectSignIn() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/sign-in", { replace: true });
  }, [navigate]);

  return null;
}
