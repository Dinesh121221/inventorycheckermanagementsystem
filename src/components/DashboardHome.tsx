import { useEffect, useState } from 'react';
import { supabase, InventoryItem } from '../lib/supabase';
import { Package, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data: items } = await supabase
        .from('inventory_items')
        .select('*');

      if (items) {
        const totalItems = items.length;
        const lowStock = items.filter(item => item.quantity <= item.min_quantity).length;
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

        setStats({
          totalItems,
          lowStock,
          totalValue,
          recentActivity: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Inventory Value',
      value: `$${stats.totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Categories',
      value: stats.totalItems > 0 ? '1+' : '0',
      icon: TrendingDown,
      color: 'bg-gray-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <p className="text-gray-600">
          Navigate to Inventory to manage items, Reports to view activity logs, or Settings to manage users.
        </p>
      </div>
    </div>
  );
}
