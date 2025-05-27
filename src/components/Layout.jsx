import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Briefcase, BarChart3, LogOut, UserCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Update title based on user auth state
    document.title = user ? "MonAuxiliaire Manu-Pro" : "Connexion - MonAuxiliaire Manu-Pro";

  }, [darkMode, user]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30 dark:from-background dark:to-secondary/10">
      {user && (
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 50 }}
          className="bg-card/80 dark:bg-card/90 backdrop-blur-md shadow-md sticky top-0 z-40"
        >
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-2xl font-bold text-primary flex items-center">
                <Briefcase className="h-7 w-7 mr-2" />
                <span>MonAuxiliaire Manu-Pro</span>
              </Link>
              <div className="flex items-center space-x-4">
                <NavLink to="/" icon={<Home />}>Dashboard</NavLink>
                <NavLink to="/sites" icon={<Briefcase />}>Sites Clients</NavLink>
                <NavLink to="/stats" icon={<BarChart3 />}>Statistiques</NavLink>
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <span>{user.fullName || user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </nav>
        </motion.header>
      )}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {!user && (
         <footer className="py-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MonAuxiliaire Manu-Pro. Tous droits réservés.</p>
        </footer>
      )}
       {user && (
         <footer className="py-6 bg-card/80 dark:bg-card/90 backdrop-blur-md shadow-inner mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MonAuxiliaire Manu-Pro. Tous droits réservés.</p>
            <p>Conçu avec ❤️ par Hostinger Horizons</p>
          </div>
        </footer>
      )}
    </div>
  );
};

const NavLink = ({ to, children, icon }) => {
  return (
    <Link
      to={to}
      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"
    >
      {React.cloneElement(icon, { className: "h-5 w-5 mr-2"})}
      {children}
    </Link>
  );
};


export default Layout;