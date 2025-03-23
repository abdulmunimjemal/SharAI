import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import Logo from './ui/Logo';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
  const [language, setLanguage] = useState<string>('en');
  const [, setLocation] = useLocation();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // Here you would implement language change functionality
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border shadow-sm">
      <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => setLocation("/")}>
            <span className="font-semibold text-xl text-primary">SharAI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1 h-9 rounded-full border border-border bg-background/50">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {language === 'en' ? 'English' : 
                     language === 'ar' ? 'العربية' : 
                     language === 'ur' ? 'اردو' : 
                     language === 'fr' ? 'Français' : 'Language'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-card border border-border">
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="cursor-pointer">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('ar')} className="cursor-pointer">
                  <span className="font-arabic">العربية</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('ur')} className="cursor-pointer">
                  <span className="font-arabic">اردو</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('fr')} className="cursor-pointer">
                  Français
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Admin access remains through direct URL only */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
