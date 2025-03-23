import React from 'react';
import Logo from './ui/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <Logo className="mb-4 md:mb-0" />
          
          <div className="mb-6 md:mb-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <i className="ri-question-line text-lg"></i>
                <span className="ml-1 text-sm">FAQ</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <i className="ri-information-line text-lg"></i>
                <span className="ml-1 text-sm">About</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <i className="ri-shield-check-line text-lg"></i>
                <span className="ml-1 text-sm">Privacy</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <i className="ri-mail-line text-lg"></i>
                <span className="ml-1 text-sm">Contact</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row md:justify-between md:items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Islamic Q&A. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="ri-facebook-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="ri-twitter-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="ri-instagram-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              <i className="ri-youtube-fill text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
