import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const OrderTrackRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/orders/${id}?tab=tracking`, { replace: true });
    } else {
      navigate('/orders', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

export default OrderTrackRedirect;

