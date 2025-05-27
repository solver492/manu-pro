import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, DollarSign, CalendarDays, BarChart2, Send, ListOrdered } from 'lucide-react';
import { motion } from 'framer-motion';

const SiteDetailPage = () => {
  const { id: siteId } = useParams();
  const [sites, setSites] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [site, setSite] = useState(null);
  const [siteStats, setSiteStats] = useState({
    handlersToday: 0,
    handlersMonth: 0,
    historyLast6Months: [],
    totalCostGenerated: 0,
  });
  const [siteShipmentHistory, setSiteShipmentHistory] = useState([]);

  const HANDLER_COST = 150;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteResponse, shipmentsResponse] = await Promise.all([
          ApiService.getSite(siteId),
          ApiService.getSiteShipments(siteId)
        ]);
        
        setSite(siteResponse);
        setShipments(shipmentsResponse.data);
        
        const currentSite = siteResponse;

    if (currentSite) {
      document.title = `Détails Site - ${currentSite.name} | MonAuxiliaire Manu-Pro`;
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let handlersToday = 0;
      let handlersMonth = 0;
      const historyLast6Months = Array(6).fill(null).map((_, i) => {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        return { month: d.toLocaleString('fr-FR', { month: 'short' }), year: d.getFullYear(), count: 0 };
      }).reverse();

      let totalCostGenerated = 0;
      const siteSpecificShipments = shipments
        .filter(ship => ship.siteId === siteId)
        .sort((a, b) => new Date(b.shipmentDate) - new Date(a.shipmentDate)); // Sort by date descending

      setSiteShipmentHistory(siteSpecificShipments);

      siteSpecificShipments.forEach(ship => {
        const shipmentDate = new Date(ship.shipmentDate);
        const shipmentMonth = shipmentDate.getMonth();
        const shipmentYear = shipmentDate.getFullYear();

        totalCostGenerated += ship.handlerCount * HANDLER_COST;

        if (ship.shipmentDate === todayStr) {
          handlersToday += ship.handlerCount;
        }
        if (shipmentMonth === currentMonth && shipmentYear === currentYear) {
          handlersMonth += ship.handlerCount;
        }
        
        historyLast6Months.forEach(histMonth => {
          if (histMonth.month === shipmentDate.toLocaleString('fr-FR', { month: 'short' }) && histMonth.year === shipmentYear) {
            histMonth.count += ship.handlerCount;
          }
        });
      });
      
      setSiteStats({ handlersToday, handlersMonth, historyLast6Months, totalCostGenerated });
    }
  }, [siteId, sites, shipments]);

  if (!site) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-semibold text-destructive">Site non trouvé</h2>
        <p className="text-muted-foreground">Le site que vous recherchez n'existe pas ou a été déplacé.</p>
        <Button asChild className="mt-4">
          <Link to="/sites"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des sites</Link>
        </Button>
      </div>
    );
  }

  const StatDisplayCard = ({ title, value, icon, color }) => (
    <motion.div whileHover={{ y: -5 }} className="flex-1 min-w-[200px]">
      <Card className={`shadow-lg border-l-4 ${color}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {React.cloneElement(icon, { className: "h-4 w-4 text-muted-foreground"})}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 p-1">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link to="/sites"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux sites</Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{site.name} - Exploitation</h1>
          <p className="text-muted-foreground">{site.address}</p>
        </div>
        <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Link to={`/sites/${site.id}/send`}>
            <Send className="mr-2 h-5 w-5" /> Envoyer Manutentionnaires
          </Link>
        </Button>
      </motion.div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <StatDisplayCard title="Envoyés Aujourd'hui" value={siteStats.handlersToday} icon={<Users />} color="border-blue-500" />
        <StatDisplayCard title="Envoyés ce Mois" value={siteStats.handlersMonth} icon={<CalendarDays />} color="border-green-500" />
        <StatDisplayCard title="Coût Total Généré" value={`${siteStats.totalCostGenerated.toLocaleString('fr-FR')} DH`} icon={<DollarSign />} color="border-yellow-500" />
         <Card className="shadow-lg border-l-4 border-purple-500 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Statut du Site</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`px-3 py-1.5 text-base font-semibold rounded-full ${
              site.status === 'actif' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'
            }`}>
              {site.status === 'actif' ? 'Actif' : 'Inactif'}
            </span>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-6 w-6 text-primary" /> Historique des 6 Derniers Mois</CardTitle>
            <CardDescription>Nombre de manutentionnaires envoyés sur ce site.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-end space-x-2 p-4 bg-muted/30 rounded-b-lg">
            {siteStats.historyLast6Months.map((data, index) => {
              const maxSends = Math.max(...siteStats.historyLast6Months.map(d => d.count), 1); // Avoid division by zero
              const barHeight = (data.count / maxSends) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <motion.div 
                    className="w-full bg-primary rounded-t-md"
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    title={`${data.month} ${data.year}: ${data.count} envois`}
                  ></motion.div>
                  <span className="text-xs mt-1 text-muted-foreground">{data.month}</span>
                </div>
              );
            })}
             {siteStats.historyLast6Months.every(d => d.count === 0) && <p className="w-full text-center text-muted-foreground self-center">Aucun envoi durant les 6 derniers mois.</p>}
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center"><ListOrdered className="mr-2 h-6 w-6 text-primary" /> Historique Détaillé des Envois</CardTitle>
            <CardDescription>Liste de tous les envois de manutentionnaires pour ce site.</CardDescription>
          </CardHeader>
          <CardContent>
            {siteShipmentHistory.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead>Date d'Envoi</TableHead>
                      <TableHead className="text-center">Nombre de Manutentionnaires</TableHead>
                      <TableHead className="text-right">Coût (DH)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siteShipmentHistory.map((shipment) => (
                      <TableRow key={shipment.id} className="hover:bg-muted/30">
                        <TableCell>{new Date(shipment.shipmentDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                        <TableCell className="text-center">{shipment.handlerCount}</TableCell>
                        <TableCell className="text-right">{(shipment.handlerCount * HANDLER_COST).toLocaleString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Aucun envoi enregistré pour ce site.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SiteDetailPage;