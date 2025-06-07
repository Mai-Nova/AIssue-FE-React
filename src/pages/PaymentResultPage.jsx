import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from '../services/api';

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSuccess = location.pathname.endsWith('/success');

  useEffect(() => {
    if (isSuccess) {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);
        return;
      }
      api.apiRequest('/payment/complete', {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(() => {
          setTimeout(() => {
            navigate("/profile?tab=subscription", { replace: true });
          }, 1000);
        })
        .catch(() => {
          setTimeout(() => {
            navigate("/profile?tab=subscription", { replace: true });
          }, 1000);
        });
    } else {
      setTimeout(() => {
        navigate("/profile?tab=subscription", { replace: true });
      }, 1000);
    }
  }, [isSuccess, location.search, location.pathname, navigate]);

  return null;
}