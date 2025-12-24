import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string; // text color class like 'text-green-600', 'text-red-600'
  iconColor?: string; // icon color class
  description?: string; // optional description below the stat
}

interface StatsCardsProps {
  stats: StatCard[];
  columns?: number; // number of columns in grid (default: 4)
  className?: string;
}

const StatsCards = ({
  stats,
  columns = 4,
  className = ""
}: StatsCardsProps) => {

  // Generate grid class based on columns
  const getGridClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-4";
      case 5:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
      default:
        return "grid-cols-1 md:grid-cols-4";
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-6 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card key={index} className="shadow-card border border-border hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-2xl font-bold ${stat.color || ''}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {stat.description}
                    </p>
                  )}
                </div>
                {Icon && (
                  <div className={`ml-2 ${stat.iconColor || stat.color || 'text-primary'} opacity-80`}>
                    <Icon className="h-5 w-5" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
