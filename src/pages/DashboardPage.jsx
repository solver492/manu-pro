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
        const data = await ApiService.getDashboardStats();

        // Formater les données mensuelles
        const monthlyData = Array(12).fill(0).map((_, i) => ({
          month: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
          count: 0,
        }));

        data.monthlySends.forEach(item => {
          const monthIndex = parseInt(item.month) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex].count = item.count;
          }
        });

        setDashboardData({
          ...data,
          monthlySends: monthlyData,
          topClients: data.topClients.map(client => ({
            name: client.name,
            sends: client.total_handlers || 0
          }))
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
            <CardContent className="h-[300px] flex items-end space-x-2 p-4 bg-muted/30 rounded-b-lg">
              {dashboardData.monthlySends.map((data, index) => {
                const maxSends = Math.max(...dashboardData.monthlySends.map(d => d.count), 1); // Avoid division by zero
                const barHeight = (data.count / maxSends) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <motion.div 
                      className="w-full bg-primary rounded-t-md"
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      title={`${data.month}: ${data.count} envois`}
                    ></motion.div>
                    <span className="text-xs mt-1 text-muted-foreground">{data.month}</span>
                  </div>
                );
              })}
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
                      key={client.name} 
                      className="flex justify-between items-center p-3 bg-muted/30 rounded-md hover:bg-primary/10 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="font-medium text-foreground">{index + 1}. {client.name}</span>
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