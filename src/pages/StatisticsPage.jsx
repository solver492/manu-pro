
import React, { useEffect, useState } from 'react';
import ApiService from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, BarChartHorizontalBig, LineChart, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const StatisticsPage = () => {
  const [statsData, setStatsData] = useState([]);
  const [overallMonthlyEvolution, setOverallMonthlyEvolution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const HANDLER_COST = 150;

  useEffect(() => {
    document.title = "Statistiques | MonAuxiliaire Manu-Pro";
    fetchStatisticsData();
  }, []);

  const fetchStatisticsData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les sites et leurs statistiques
      const sites = await ApiService.getSites();
      const dashboardStats = await ApiService.getDashboardStats();
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const prevMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
      const prevMonthYear = (currentMonth === 0) ? currentYear - 1 : currentYear;

      // Traiter les statistiques par site
      const siteStatsPromises = sites.map(async (site) => {
        try {
          const siteDetail = await ApiService.getSite(site.id);
          const siteShipments = await ApiService.getSiteShipments(site.id);
          
          let handlersThisMonth = 0;
          let handlersThisYear = 0;
          let handlersPrevMonth = 0;

          if (siteShipments && siteShipments.data) {
            siteShipments.data.forEach(ship => {
              const shipDate = new Date(ship.shipment_date);
              if (shipDate.getFullYear() === currentYear) {
                handlersThisYear += ship.handler_count;
                if (shipDate.getMonth() === currentMonth) {
                  handlersThisMonth += ship.handler_count;
                }
              }
              if (shipDate.getFullYear() === prevMonthYear && shipDate.getMonth() === prevMonth) {
                handlersPrevMonth += ship.handler_count;
              }
            });
          }
          
          const evolution = handlersThisMonth - handlersPrevMonth;
          return {
            id: site.id,
            name: site.name,
            handlersThisMonth,
            handlersThisYear,
            revenueGenerated: handlersThisYear * HANDLER_COST,
            evolution,
          };
        } catch (error) {
          console.error(`Erreur pour le site ${site.id}:`, error);
          return {
            id: site.id,
            name: site.name,
            handlersThisMonth: 0,
            handlersThisYear: 0,
            revenueGenerated: 0,
            evolution: 0,
          };
        }
      });

      const siteStats = await Promise.all(siteStatsPromises);
      setStatsData(siteStats.sort((a, b) => b.revenueGenerated - a.revenueGenerated));

      // Traiter l'évolution mensuelle
      const monthlyEvolutionData = Array(12).fill(0).map((_, i) => ({
        month: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
        count: 0,
      }));

      if (dashboardStats && dashboardStats.monthlySends) {
        dashboardStats.monthlySends.forEach(item => {
          const monthIndex = parseInt(item.month) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyEvolutionData[monthIndex].count = item.count || 0;
          }
        });
      }

      setOverallMonthlyEvolution(monthlyEvolutionData);

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les statistiques.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (statsData.length === 0) {
      toast({ title: "Exportation impossible", description: "Aucune donnée à exporter.", variant: "destructive" });
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nom du Site;Manutentionnaires ce Mois;Manutentionnaires cette Année;Chiffre d'Affaires Généré (DH);Évolution vs Mois Précédent\n";
    statsData.forEach(site => {
      const evolutionStr = `${site.evolution > 0 ? '+' : ''}${site.evolution}`;
      csvContent += `${site.name};${site.handlersThisMonth};${site.handlersThisYear};${site.revenueGenerated};${evolutionStr}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "statistiques_sites_clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportation CSV Réussie", description: "Le fichier a été téléchargé." });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-1">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 print:p-0">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden"
      >
        <h1 className="text-4xl font-bold tracking-tight text-primary">Statistiques Détaillées</h1>
        <div className="space-x-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exporter CSV
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-xl print:shadow-none print:border-none">
          <CardHeader className="print:px-0">
            <CardTitle>Récapitulatif par Site Client</CardTitle>
            <CardDescription>Performance des sites pour l'année en cours.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto print:overflow-visible print:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du Site</TableHead>
                  <TableHead className="text-center">Manut. ce Mois</TableHead>
                  <TableHead className="text-center">Manut. cette Année</TableHead>
                  <TableHead className="text-right">CA Généré (Année)</TableHead>
                  <TableHead className="text-center">Évolution (vs Mois Préc.)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsData.map((site) => (
                  <TableRow key={site.id} className="hover:bg-muted/30 print:hover:bg-transparent">
                    <TableCell className="font-medium text-foreground">{site.name}</TableCell>
                    <TableCell className="text-center">{site.handlersThisMonth}</TableCell>
                    <TableCell className="text-center">{site.handlersThisYear}</TableCell>
                    <TableCell className="text-right">{site.revenueGenerated.toLocaleString('fr-FR')} DH</TableCell>
                    <TableCell className={`text-center font-semibold ${site.evolution > 0 ? 'text-green-600' : site.evolution < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {site.evolution > 0 && <TrendingUp className="inline mr-1 h-4 w-4" />}
                      {site.evolution < 0 && <TrendingDown className="inline mr-1 h-4 w-4" />}
                      {site.evolution > 0 ? '+' : ''}{site.evolution}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {statsData.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune donnée statistique disponible.</p>}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 print:hidden">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><BarChartHorizontalBig className="mr-2 h-6 w-6 text-primary" /> Envois par Site (Année)</CardTitle>
              <CardDescription>Classement des sites par nombre total d'envois cette année (Top 10).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {statsData.sort((a,b) => b.handlersThisYear - a.handlersThisYear).slice(0,10).map((site, index) => {
                const maxSiteSends = Math.max(...statsData.map(s => s.handlersThisYear), 1);
                const barWidth = maxSiteSends > 0 ? (site.handlersThisYear / maxSiteSends) * 100 : 0;
                return (
                  <div key={site.id} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-foreground">{site.name}</span>
                      <span className="text-primary font-semibold">{site.handlersThisYear}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <motion.div 
                        className="bg-primary h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
              {statsData.length === 0 && <p className="text-center py-4 text-muted-foreground">Aucune donnée.</p>}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><LineChart className="mr-2 h-6 w-6 text-primary" /> Évolution Mensuelle Globale (Année)</CardTitle>
              <CardDescription>Total des manutentionnaires envoyés chaque mois.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] p-4">
              <svg viewBox="0 0 300 150" className="w-full h-full">
                <line x1="20" y1="130" x2="280" y2="130" stroke="hsl(var(--border))" strokeWidth="1"/>
                <line x1="20" y1="20" x2="20" y2="130" stroke="hsl(var(--border))" strokeWidth="1"/>
                {overallMonthlyEvolution.map((data, index) => (
                  <text key={`label-${index}`} x={25 + index * (250/11)} y="145" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="middle">{data.month}</text>
                ))}
                {(() => {
                  const maxCount = Math.max(...overallMonthlyEvolution.map(d => d.count), 1);
                  const points = overallMonthlyEvolution.map((data, index) => 
                    `${25 + index * (250/11)},${130 - (data.count / maxCount * 100)}`
                  ).join(' ');
                  return (
                    <>
                      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="2"/>
                      {overallMonthlyEvolution.map((data, index) => (
                         data.count > 0 && <circle key={`dot-${index}`} cx={25 + index * (250/11)} cy={130 - (data.count / maxCount * 100)} r="2" fill="hsl(var(--primary))" />
                      ))}
                    </>
                  );
                })()}
              </svg>
              {overallMonthlyEvolution.every(d => d.count === 0) && <p className="text-center py-4 text-muted-foreground">Aucune donnée pour le graphique.</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StatisticsPage;
