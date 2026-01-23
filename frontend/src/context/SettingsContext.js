import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    logo_url: 'https://customer-assets.emergentagent.com/job_prompt-forge-125/artifacts/b9zqkf94_Dhwani%20RIS%20Logo.jfif',
    company_name: 'Dhwani RIS',
    company_website: 'https://dhwaniris.com',
    contact_email: 'partnerships@dhwaniris.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
