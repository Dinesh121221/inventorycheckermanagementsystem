import { useEffect, useState } from 'react';
import { supabase, ActivityLog, Profile } from '../lib/supabase';
import { FileText, Activity } from 'lucide-react';

type ActivityLogWithProfile = ActivityLog & {
  profiles?: Profile;
};

export default function Reports() {
  const [logs, setLogs] = useState<ActivityLogWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  async function loadActivityLogs() {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Activity Reports</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No activity logs yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action.toUpperCase()}
                      </span>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {log.item_name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>
                        by {log.profiles?.full_name || 'Unknown'} ({log.profiles?.role || 'N/A'})
                      </span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
