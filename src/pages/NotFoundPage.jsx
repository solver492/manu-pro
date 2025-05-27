
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-6 bg-gradient-to-br from-background to-secondary/10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100, duration: 0.5 }}
        className="p-10 bg-card rounded-xl shadow-2xl max-w-md w-full"
      >
        <AlertTriangle className="mx-auto h-20 w-20 text-destructive mb-6" />
        <h1 className="text-5xl font-extrabold text-primary mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Non Trouvée</h2>
        <p className="text-muted-foreground mb-8">
          Oups ! Il semble que la page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
  