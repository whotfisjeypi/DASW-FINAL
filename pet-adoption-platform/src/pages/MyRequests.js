import React, { useState, useEffect } from 'react';
import { fetchRequests, cancelRequest } from '../utils/api';
import PetCard from '../components/PetCard';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const getRequests = async () => {
      const data = await fetchRequests();
      setRequests(data);
    };
    getRequests();
  }, []);

  const handleCancel = async (requestId) => {
    await cancelRequest(requestId);
    setRequests(requests.filter(request => request.id !== requestId));
  };

  return (
    <div>
      <h2>Mis Solicitudes</h2>
      {requests.length === 0 ? (
        <p>No tienes solicitudes pendientes.</p>
      ) : (
        requests.map(request => (
          <PetCard key={request.id} pet={request.pet}>
            <button onClick={() => handleCancel(request.id)}>Cancelar Solicitud</button>
          </PetCard>
        ))
      )}
    </div>
  );
};

export default MyRequests;