import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApiService from '@/services/api';
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

  const [isLoading, setIsLoading] = useState(true);
  
  const [site, setSite] = useState(null);
  const [handlerCount, setHandlerCount] = useState('1');
  const [shipmentDate, setShipmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const HANDLER_COST = 150;

  useEffect(() => {
    const fetchSite = async () => {
      try {
        setIsLoading(true);
        const currentSite = await ApiService.getSite(siteId);
        setSite(currentSite);
        document.title = `Envoyer Manutentionnaires - ${currentSite.name} | MonAuxiliaire Manu-Pro`;
      } catch (error) {
        console.error('Erreur lors du chargement du site:', error);
        toast({ 
          title: "Erreur", 
          description: "Site client non trouvé.", 
          variant: "destructive" 
        });
        navigate('/sites');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSite();
  }, [siteId, navigate, toast]);

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

  const confirmSend = async () => {
    try {
      const count = parseInt(handlerCount, 10);
      const shipmentData = {
        siteId: site.id,
        handlerCount: count,
        shipmentDate: shipmentDate,
      };
      await ApiService.createShipment(shipmentData);
      toast({
        title: "Envoi enregistré !",
        description: `${count} manutentionnaire(s) envoyé(s) à ${site.name} le ${new Date(shipmentDate).toLocaleDateString('fr-FR')}.`,
        variant: "default",
      });
      setIsConfirming(false);
      navigate(`/sites/${siteId}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer l'envoi",
        variant: "destructive",
      });
    }
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