import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Crown, 
  Eye, 
  Filter, 
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  lifecycleStage: string;
  profileCompleteness: number;
  isActive: boolean;
  isVerified: boolean;
  lastActiveAt: string;
  createdAt: string;
  profileImageUrl?: string;
  riskLevel: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  usersByRole: Record<string, number>;
  usersByStage: Record<string, number>;
}

export function AdvancedUserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: true,
  });

  // Fetch users with filters
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/admin/users', {
      search: searchTerm,
      role: filterRole,
      stage: filterStage,
      status: filterStatus,
      page: currentPage,
      sortBy,
      sortOrder
    }],
    enabled: true,
  });

  // User action mutations
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: t('admin.success'),
        description: t('admin.roleUpdated'),
      });
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'activate' | 'suspend' }) => {
      return apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: { action },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: t('admin.success'),
        description: t('admin.userStatusUpdated'),
      });
    },
  });

  const verifyUser = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('admin.success'),
        description: t('admin.userVerified'),
      });
    },
  });

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const getStageColor = (stage: string) => {
    const colors = {
      aware: 'bg-gray-100 text-gray-800',
      join: 'bg-blue-100 text-blue-800',
      explore: 'bg-yellow-100 text-yellow-800',
      transact: 'bg-green-100 text-green-800',
      retain: 'bg-purple-100 text-purple-800',
      advocate: 'bg-pink-100 text-pink-800',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredUsers = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / (usersData?.perPage || 20));

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{userStats?.newUsersThisMonth || 0} {t('admin.thisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.totalUsers ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0}% {t('admin.ofTotal')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.verifiedUsers')}</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.verifiedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.totalUsers ? Math.round((userStats.verifiedUsers / userStats.totalUsers) * 100) : 0}% {t('admin.verified')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.riskAlerts')}</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredUsers.filter((u: User) => u.riskLevel === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.highRiskUsers')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>{t('admin.userManagement')}</CardTitle>
              <CardDescription>{t('admin.manageUsersDescription')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('admin.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.filterByRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
                <SelectItem value="artist">{t('admin.artists')}</SelectItem>
                <SelectItem value="gallery">{t('admin.galleries')}</SelectItem>
                <SelectItem value="collector">{t('admin.collectors')}</SelectItem>
                <SelectItem value="admin">{t('admin.admins')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.filterByStage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allStages')}</SelectItem>
                <SelectItem value="aware">{t('lifecycle.stages.aware')}</SelectItem>
                <SelectItem value="join">{t('lifecycle.stages.join')}</SelectItem>
                <SelectItem value="explore">{t('lifecycle.stages.explore')}</SelectItem>
                <SelectItem value="transact">{t('lifecycle.stages.transact')}</SelectItem>
                <SelectItem value="retain">{t('lifecycle.stages.retain')}</SelectItem>
                <SelectItem value="advocate">{t('lifecycle.stages.advocate')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('admin.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('admin.active')}</SelectItem>
                <SelectItem value="suspended">{t('admin.suspended')}</SelectItem>
                <SelectItem value="verified">{t('admin.verified')}</SelectItem>
                <SelectItem value="unverified">{t('admin.unverified')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.user')}</TableHead>
                    <TableHead>{t('admin.roles')}</TableHead>
                    <TableHead>{t('admin.stage')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead>{t('admin.risk')}</TableHead>
                    <TableHead>{t('admin.lastActive')}</TableHead>
                    <TableHead className="text-right">{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell onClick={() => openUserDetail(user)}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.profileImageUrl ? (
                              <img 
                                src={user.profileImageUrl} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStageColor(user.lifecycleStage)}`}>
                          {t(`lifecycle.stages.${user.lifecycleStage}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                            {user.isActive ? t('admin.active') : t('admin.suspended')}
                          </Badge>
                          {user.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              {t('admin.verified')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getRiskColor(user.riskLevel)}`}>
                          {t(`admin.risk.${user.riskLevel}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(user.lastActiveAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openUserDetail(user);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyUser.mutate(user.id);
                              }}
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUserStatus.mutate({
                                userId: user.id,
                                action: user.isActive ? 'suspend' : 'activate'
                              });
                            }}
                          >
                            {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {t('admin.showingUsers', { 
                  start: (currentPage - 1) * 20 + 1,
                  end: Math.min(currentPage * 20, totalUsers),
                  total: totalUsers
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  {t('admin.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('admin.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.userDetails')}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedUser.profileImageUrl ? (
                    <img 
                      src={selectedUser.profileImageUrl} 
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium">
                      {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedUser.roles.map(role => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Information Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
                  <TabsTrigger value="activity">{t('admin.activity')}</TabsTrigger>
                  <TabsTrigger value="actions">{t('admin.actions')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.joinDate')}</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.lastActive')}</label>
                      <div className="text-sm">
                        {new Date(selectedUser.lastActiveAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.lifecycleStage')}</label>
                      <Badge className={getStageColor(selectedUser.lifecycleStage)}>
                        {t(`lifecycle.stages.${selectedUser.lifecycleStage}`)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.riskLevel')}</label>
                      <Badge className={getRiskColor(selectedUser.riskLevel)}>
                        {t(`admin.risk.${selectedUser.riskLevel}`)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('admin.profileCompleteness')}</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${selectedUser.profileCompleteness}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{selectedUser.profileCompleteness}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity">
                  <div className="text-center py-8 text-gray-500">
                    {t('admin.activityHistoryComingSoon')}
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <div className="grid gap-4">
                    <Button
                      variant="outline"
                      onClick={() => verifyUser.mutate(selectedUser.id)}
                      disabled={selectedUser.isVerified}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      {selectedUser.isVerified ? t('admin.verified') : t('admin.verifyUser')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => toggleUserStatus.mutate({
                        userId: selectedUser.id,
                        action: selectedUser.isActive ? 'suspend' : 'activate'
                      })}
                    >
                      {selectedUser.isActive ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          {t('admin.suspendUser')}
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          {t('admin.activateUser')}
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      {t('admin.sendMessage')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}