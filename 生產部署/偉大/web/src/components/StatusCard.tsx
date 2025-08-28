'use client';

interface StatusCardProps {
  title: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  description: string;
  details?: string;
}

const statusConfig = {
  online: {
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    dotColor: 'bg-green-500',
    icon: '✅'
  },
  warning: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    dotColor: 'bg-yellow-500',
    icon: '⚠️'
  },
  error: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    dotColor: 'bg-red-500',
    icon: '❌'
  },
  offline: {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-gray-500',
    icon: '⭕'
  }
};

export default function StatusCard({ title, status, description, details }: StatusCardProps) {
  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${config.bgColor} ${config.color}`}>
          <span className={`w-2 h-2 ${config.dotColor} rounded-full mr-2`}></span>
          {config.icon} {status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{description}</p>
      {details && (
        <p className="text-gray-500 text-xs">{details}</p>
      )}
    </div>
  );
}
