const COMPANY_API = `${process.env.REACT_APP_BACKEND_URL}/api/companies`;

export const getAllCompanies = async () => {
  const response = await fetch(`${COMPANY_API}/`);
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

export const addCompany = async (companyName) => {
  const response = await fetch(`${COMPANY_API}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: companyName }),
  });

  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};
