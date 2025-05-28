import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import ApiService from '@/services/api';
import { DollarSign, Users, TrendingUp, AlertTriangle, BarChartBig } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, description, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
    className="flex-1 min-w-[280px]"
  >
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${colorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.cloneElement(icon, { className: "h-5 w-5 text-muted-foreground"})}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalHandlersMonth: 0,
    totalRevenueMonth: 0,
    totalHandlersYear: 0,
    totalRevenueYear: 0,
    monthlySends: [],
    topClients: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Récupérer les sites et les envois
        const sites = await ApiService.getSites();
        const shipmentsResponse = await ApiService.getShipments();
        const shipments = shipmentsResponse?.data || [];
        const currentYear = new Date().getFullYear();

        // Formater les données mensuelles
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyData = monthNames.map(month => ({ month, count: 0 }));

        // Calculer les totaux par site et par mois
        const siteStats = {};
        
        shipments.forEach(ship => {
          const shipDate = new Date(ship.shipment_date);
          if (shipDate.getFullYear() === currentYear) {
            const monthIndex = shipDate.getMonth();
            const handlerCount = parseInt(ship.handler_count) || 0;
            monthlyData[monthIndex].count += handlerCount;

            // Accumuler les totaux par site
            if (!siteStats[ship.site_id]) {
              siteStats[ship.site_id] = 0;
            }
            siteStats[ship.site_id] += handlerCount;
          }
        });

        // Créer le top 5 des sites
        const topClients = Object.entries(siteStats)
          .map(([id, sends]) => ({ id, sends }))
          .sort((a, b) => b.sends - a.sends)
          .slice(0, 5);

        // Calculer les totaux pour le mois en cours
        const currentMonth = new Date().getMonth();
        const totalHandlersMonth = monthlyData[currentMonth].count;
        const totalRevenueMonth = totalHandlersMonth * 150; // 150 DH par manutentionnaire

        // Calculer les totaux pour l'année
        const totalHandlersYear = monthlyData.reduce((sum, month) => sum + month.count, 0);
        const totalRevenueYear = totalHandlersYear * 150;

        setDashboardData({
          totalHandlersMonth,
          totalRevenueMonth,
          totalHandlersYear,
          totalRevenueYear,
          monthlySends: monthlyData,
          topClients
        });
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 p-1">
      <motion.h1 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold tracking-tight text-primary mb-8"
      >
        Tableau de Bord Principal
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Manutentionnaires (Mois)" 
          value={dashboardData.totalHandlersMonth.toLocaleString('fr-FR')}
          icon={<Users />} 
          description="Total envoyés ce mois-ci"
          colorClass="border-primary"
        />
        <StatCard 
          title="Chiffre d'Affaires (Mois)" 
          value={`${dashboardData.totalRevenueMonth.toLocaleString('fr-FR')} DH`}
          icon={<DollarSign />} 
          description="CA généré ce mois-ci"
          colorClass="border-green-500"
        />
        <StatCard 
          title="Manutentionnaires (Année)" 
          value={dashboardData.totalHandlersYear.toLocaleString('fr-FR')}
          icon={<Users />} 
          description="Total envoyés cette année"
          colorClass="border-purple-500"
        />
        <StatCard 
          title="Chiffre d'Affaires (Année)" 
          value={`${dashboardData.totalRevenueYear.toLocaleString('fr-FR')} DH`}
          icon={<DollarSign />} 
          description="CA généré cette année"
          colorClass="border-yellow-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><BarChartBig className="mr-2 h-6 w-6 text-primary" /> Envois Mensuels (Année en cours)</CardTitle>
              <CardDescription>Nombre de manutentionnaires envoyés chaque mois.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-end space-x-2 p-4 bg-muted/30 rounded-b-lg relative">
              {/* Axe Y avec valeurs */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((value) => (
                  <span key={value} className="text-xs text-muted-foreground">
                    {Math.round(value * Math.max(...dashboardData.monthlySends.map(d => d.count)) / 100)}
                  </span>
                ))}
              </div>

              {/* Lignes de la grille */}
              {[75, 50, 25].map((value) => (
                <div 
                  key={value}
                  className="absolute left-8 right-4 border-t border-dashed border-muted-foreground/20"
                  style={{ bottom: `${value}%` }}
                ></div>
              ))}

              {/* Barres du graphique */}
              <div className="flex-1 flex items-end space-x-2 pl-8">
                {dashboardData.monthlySends.map((data, index) => {
                  const maxSends = Math.max(...dashboardData.monthlySends.map(d => d.count), 1);
                  const barHeight = (data.count / maxSends) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full">
                        <motion.div 
                          className="w-full bg-primary rounded-t-md"
                          initial={{ height: 0 }}
                          animate={{ height: `${barHeight}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        ></motion.div>
                        {data.count > 0 && (
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium">
                            {data.count}
                          </span>
                        )}
                      </div>
                      <span className="text-xs mt-2 text-muted-foreground">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-6 w-6 text-primary" /> Top 5 Sites Clients Actifs</CardTitle>
              <CardDescription>Sites avec le plus grand nombre d'envois cette année.</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.topClients.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.topClients.map((client, index) => (
                    <motion.li 
                      key={client.id} 
                      className="flex justify-between items-center p-3 bg-muted/30 rounded-md hover:bg-primary/10 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="font-medium text-foreground">{client.id}</span>
                      <span className="text-primary font-semibold">{client.sends} envois</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucune donnée d'envoi pour le moment.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        <Card className="shadow-lg border-l-4 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-orange-500" /> Alertes et Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune alerte importante pour le moment.</p>
            {/* Future: Display alerts like low activity sites, contract renewals, etc. */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;