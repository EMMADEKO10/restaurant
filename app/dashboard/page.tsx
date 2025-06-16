import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserMenu } from '@/components/auth/UserMenu';
import { Utensils, Users, Calendar, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Utensils className="h-8 w-8 text-restaurant-500 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Restaurant Manager
                </h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tableau de bord
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue dans votre espace de gestion restaurant
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-restaurant-100 dark:bg-restaurant-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-restaurant-600 dark:text-restaurant-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clients aujourd'hui
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    24
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-business-100 dark:bg-business-900/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-business-600 dark:text-business-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Réservations
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    8
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Chiffre d'affaires
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    €1,250
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Utensils className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Commandes en cours
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    12
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Nouvelle réservation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ajouter une réservation</p>
              </button>
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Gérer le menu</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Modifier les plats</p>
              </button>
              <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Voir les rapports</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyser les performances</p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 