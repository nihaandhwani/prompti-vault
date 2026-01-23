import { Link } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img 
              src={settings.logo_url} 
              alt={settings.company_name} 
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-sm font-bold text-[#811622]" style={{ fontFamily: 'Manrope' }}>
                Prompti Vault by {settings.company_name}
              </p>
              <p className="text-xs text-[#53435B]">
                Empowering Social Impact Through Technology
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm">
            <a 
              href={settings.company_website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#53435B] hover:text-[#811622] transition-colors"
            >
              Visit {settings.company_name}
            </a>
            <a 
              href={`mailto:${settings.contact_email}`}
              className="text-[#53435B] hover:text-[#811622] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-[#53435B]">
          © {new Date().getFullYear()} {settings.company_name}. All rights reserved. | Transforming the development sector with innovative solutions
        </div>
      </div>
    </footer>
  );
};

export default Footer;
