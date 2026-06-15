const BE_URL = import.meta.env.VITE_BE_URL;

export const onboardNewTenant = async (payload: any ) => {
  const response = await fetch(
    `${BE_URL}/backoffice/onboard-tenant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response;
};

export const getAdminDshboard = async () => {
  const response = await fetch(
    `${BE_URL}/backoffice/dashboard-stats`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response.json();
};

export const uploadLogoFile = async (payload: any ) => {
  const response = await fetch(
    `${BE_URL}/backoffice/upload-logo`,
    {
      method: "POST",
      body: payload,
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response.json();
};

export const removeUserFromOrg = async (userId: string, orgId: string) => { 
  const response = await fetch(
    `${BE_URL}/organizations/${orgId}/user/${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response.json();
};

export const getOrganizationDetail = async (orgId: string) => {
  const response = await fetch(
    `${BE_URL}/organizations/${orgId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response.json();
};