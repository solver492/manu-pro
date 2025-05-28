import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ApiService from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Send, Search, PlusCircle, Edit2, Trash2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const ClientSitesPage = () => {
  const [clientSites, setClientSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getSites();
        console.log('Réponse API:', response);
        if (!Array.isArray(response)) {
          throw new Error('Format de réponse invalide');
        }
        setClientSites(response);
      } catch (error) {
        console.error('Erreur lors du chargement des sites:', error);
        toast({ 
          title: "Erreur de chargement", 
          description: `Impossible de charger les sites : ${error.message}`, 
          variant: "destructive" 
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSites();
  }, [toast]);

  // Fonction de recherche par ID
  const filteredSites = React.useMemo(() => {
    if (!searchTerm.trim()) return clientSites;

    const searchTermUpper = searchTerm.trim().toUpperCase();

    return clientSites.filter(site => {
      return site.id.toUpperCase().includes(searchTermUpper);
    });
  }, [clientSites, searchTerm]);

  const handleAddSite = () => {
    toast({
      title: 'Information',
      description: 'Disponible prochainement',
      variant: 'default',
    });
  };

  const handleEditSite = (siteId) => {
    // Placeholder for edit functionality
    // This would typically navigate to an edit form or open a modal
    toast({
      title: "Fonctionnalité à venir",
      description: `La modification du site ${siteId} sera bientôt disponible.`,
    });
  };

  const confirmDeleteSite = async () => {
    if (siteToDelete) {
      try {
        await ApiService.deleteSite(siteToDelete.id);
        setClientSites(prevSites => prevSites.filter(site => site.id !== siteToDelete.id));
        toast({
          title: "Site Supprimé",
          description: `${siteToDelete.name} a été supprimé avec succès.`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: `Impossible de supprimer le site: ${error.message}`,
          variant: "destructive"
        });
      }
      setSiteToDelete(null);
    }
  };


  return (
    <div className="space-y-8 p-1">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center">
          <Briefcase className="mr-3 h-10 w-10" /> Sites Clients
        </h1>
        <Button onClick={handleAddSite} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <PlusCircle className="mr-2 h-5 w-5" /> Ajouter un Site
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un site par ID (ex: IRIS, AZUR...)"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchTerm('');
              }
            }}
            className="pl-8 w-full transition-all duration-200 focus:shadow-md"
            type="search"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center p-10 text-muted-foreground bg-card rounded-lg shadow-md">
          <p className="text-2xl font-semibold mb-2">Chargement des sites...</p>
        </div>
      ) : filteredSites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSites.map((site, index) => (
              <motion.div key={site.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-primary flex items-center">
                          <Briefcase className="mr-2 h-5 w-5" /> {site.id}
                        </CardTitle>
                        <CardDescription className="text-xs">{site.name || 'Nom non spécifié'}</CardDescription>
                        <CardDescription className="text-xs mt-1">{site.address || 'Adresse non spécifiée'}</CardDescription>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full self-start bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100">
                        Actif
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* You can add more site details here if needed */}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-border/50">
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto" disabled>
                      <Link to={`/sites/${site.id}`}>
                        <Eye className="mr-1 h-4 w-4" /> Exploiter
                      </Link>
                    </Button>
                    <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                      <Link to={`/sites/${site.id}/send`}>
                        <Send className="mr-1 h-4 w-4" /> Envoyer
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" disabled title="Disponible prochainement" className="text-muted-foreground">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled title="Disponible prochainement" className="text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-10 text-muted-foreground bg-card rounded-lg shadow-md"
        >
          <Search className="mx-auto h-16 w-16 mb-6 text-primary/50" />
          <p className="text-2xl font-semibold mb-2">Aucun site client trouvé.</p>
          <p>Essayez d'ajuster vos termes de recherche ou <Button variant="link" onClick={handleAddSite} className="p-0 h-auto text-lg">ajoutez un nouveau site</Button>.</p>
        </motion.div>
      )}
    </div>
  );
};

export default ClientSitesPage;