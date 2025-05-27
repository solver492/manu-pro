import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Send as SendIconLucide, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

const SendHandlerPage = () => {
  const { id: siteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sites] = useLocalStorage('clientSites', []);
  const [shipments, setShipments] = useLocalStorage('shipments', []);
  
  const [site, setSite] = useState(null);
  const [handlerCount, setHandlerCount] = useState('1');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const HANDLER_COST = 150;

  useEffect(() => {
    const currentSite = sites.find(s => s.id === siteId);
    if (currentSite) {
      setSite(currentSite);
      document.title = `Envoyer Manutentionnaires - ${currentSite.name} | MonAuxiliaire Manu-Pro`;
    } else {
      toast({ title: "Erreur", description: "Site client non trouvé.", variant: "destructive" });
      navigate('/sites');
    }
  }, [siteId, sites, navigate, toast]);

  const handleSend = (e) => {
    e.preventDefault();
    setError('');
    const count = parseInt(handlerCount, 10);
    if (isNaN(count) || count <= 0) {
      setError("Le nombre de manutentionnaires doit être un nombre entier supérieur à zéro.");
      return;
    }
    setIsConfirming(true);
  };

  const confirmSend = () => {
    const count = parseInt(handlerCount, 10);
    const newShipment = {
      id: `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      siteId: site.id,
      handlerCount: count,
      shipmentDate: shipmentDate,
      totalCost: count * HANDLER_COST,
    };
    setShipments(prevShipments => [...prevShipments, newShipment]);
    toast({
      title: "Envoi enregistré !",
      description: `${count} manutentionnaire(s) envoyé(s) à ${site.name} le ${new Date(shipmentDate).toLocaleDateString('fr-FR')}.`,
      variant: "default",
    });
    setIsConfirming(false);
    navigate(`/sites/${siteId}`);
  };

  if (!site) {
    return <div className="text-center p-10">Chargement des informations du site...</div>;
  }

  return (
    <div className="space-y-6 p-1">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link to={`/sites/${siteId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Retour au site</Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Envoyer des Manutentionnaires</h1>
        <p className="text-muted-foreground">Site: <span className="font-semibold text-foreground">{site.name}</span></p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="w-full max-w-lg mx-auto shadow-xl">
          <CardHeader>
            <CardTitle>Détails de l'envoi</CardTitle>
            <CardDescription>Spécifiez le nombre de manutentionnaires et la date d'envoi.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <Label htmlFor="handlerCount">Nombre de manutentionnaires</Label>
                <Input
                  id="handlerCount"
                  type="number"
                  value={handlerCount}
                  onChange={(e) => setHandlerCount(e.target.value)}
                  placeholder="Ex: 5"
                  min="1"
                  required
                  className="bg-background/70"
                />
              </div>
              <div>
                <Label htmlFor="shipmentDate">Date d'envoi</Label>
                <Input
                  id="shipmentDate"
                  type="date"
                  value={shipmentDate}
                  onChange={(e) => setShipmentDate(e.target.value)}
                  required
                  className="bg-background/70"
                />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-destructive flex items-center"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" /> {error}
                </motion.p>
              )}
              <Button type="submit" className="w-full text-lg py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <SendIconLucide className="mr-2 h-5 w-5" /> Confirmer l'envoi
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-6 w-6" /> Confirmer l'envoi</DialogTitle>
            <DialogDescription>
              Veuillez vérifier les détails avant de confirmer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p><strong>Site:</strong> {site.name}</p>
            <p><strong>Nombre de manutentionnaires:</strong> {handlerCount}</p>
            <p><strong>Date d'envoi:</strong> {new Date(shipmentDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Coût estimé:</strong> {(parseInt(handlerCount, 10) * HANDLER_COST).toLocaleString('fr-FR')} DH</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirming(false)}>Annuler</Button>
            <Button onClick={confirmSend} className="bg-primary hover:bg-primary/90">Valider l'envoi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendHandlerPage;