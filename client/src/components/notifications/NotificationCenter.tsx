import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bell, 
  BellOff, 
  Heart, 
  MessageSquare, 
  ShoppingCart, 
  Gavel, 
  UserPlus, 
  Calendar,
  Trash2,
  Settings,
  DollarSign,
  Eye,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'purchase' | 'bid' | 'message' | 'event' | 'system';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  purchases: boolean;
  bids: boolean;
  messages: boolean;
  events: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function NotificationCenter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch notification settings
  const { data: settings } = useQuery({
    queryKey: ['/api/notifications/settings'],
    enabled: true,
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/mark-all-read', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: t('notifications.success'),
        description: t('notifications.allMarkedRead'),
      });
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Update notification settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      return apiRequest('/api/notifications/settings', {
        method: 'PATCH',
        body: newSettings,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
      toast({
        title: t('notifications.success'),
        description: t('notifications.settingsUpdated'),
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    const icons = {
      like: Heart,
      comment: MessageSquare,
      follow: UserPlus,
      purchase: ShoppingCart,
      bid: Gavel,
      message: MessageSquare,
      event: Calendar,
      system: Bell,
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-orange-600';
    
    const colors = {
      like: 'text-pink-600',
      comment: 'text-blue-600',
      follow: 'text-green-600',
      purchase: 'text-purple-600',
      bid: 'text-yellow-600',
      message: 'text-blue-600',
      event: 'text-indigo-600',
      system: 'text-gray-600',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to related content if actionUrl exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const filteredNotifications = notifications?.filter((notification: Notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  }) || [];

  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Panel Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('notifications.title')}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead.mutate()}
                  >
                    <BellOff className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <Tabs value={filter} onValueChange={setFilter} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                {t('notifications.all')}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                {t('notifications.unread')}
              </TabsTrigger>
              <TabsTrigger value="like" className="text-xs">
                <Heart className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="message" className="text-xs">
                <MessageSquare className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="flex-1 mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-sm">
                      {filter === 'unread' 
                        ? t('notifications.noUnread')
                        : t('notifications.noNotifications')
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification: Notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      const iconColor = getNotificationColor(notification.type, notification.priority);
                      
                      return (
                        <Card 
                          key={notification.id}
                          className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                            !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-1.5 rounded-full bg-gray-100 ${iconColor}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={`text-sm ${
                                    !notification.isRead ? 'font-medium' : 'font-normal'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {notification.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs px-1">
                                      {t('notifications.urgent')}
                                    </Badge>
                                  )}
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification.mutate(notification.id);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('notifications.settings')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">{t('notifications.typeSettings')}</h4>
              <div className="space-y-3">
                {[
                  { key: 'likes', icon: Heart, label: t('notifications.types.likes') },
                  { key: 'comments', icon: MessageSquare, label: t('notifications.types.comments') },
                  { key: 'follows', icon: UserPlus, label: t('notifications.types.follows') },
                  { key: 'purchases', icon: ShoppingCart, label: t('notifications.types.purchases') },
                  { key: 'bids', icon: Gavel, label: t('notifications.types.bids') },
                  { key: 'events', icon: Calendar, label: t('notifications.types.events') },
                ].map(({ key, icon: Icon, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateSettings.mutate({
                        [key]: !settings?.[key]
                      })}
                      className="h-6 w-12 p-0"
                    >
                      <div className={`w-8 h-4 rounded-full transition-colors ${
                        settings?.[key] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${
                          settings?.[key] ? 'ml-4' : 'ml-0.5'
                        }`} />
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">{t('notifications.deliverySettings')}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('notifications.emailNotifications')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSettings.mutate({
                      emailNotifications: !settings?.emailNotifications
                    })}
                    className="h-6 w-12 p-0"
                  >
                    <div className={`w-8 h-4 rounded-full transition-colors ${
                      settings?.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${
                        settings?.emailNotifications ? 'ml-4' : 'ml-0.5'
                      }`} />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}