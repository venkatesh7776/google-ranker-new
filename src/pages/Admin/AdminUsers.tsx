import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, UserCog, Ban, CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const AdminUsers = () => {
  const { users, fetchUsers, updateUserRole, toggleUserStatus, cancelUserSubscription, adminLevel } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'role' | 'status' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      await fetchUsers({ search: searchQuery, status: statusFilter });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchQuery, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const openDialog = (user: any, type: 'role' | 'status') => {
    setSelectedUser(user);
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    await updateUserRole(selectedUser.uid, 'admin', 'moderator');
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    await toggleUserStatus(selectedUser.uid, !selectedUser.disabled);
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const getStatusBadge = (subscription: any) => {
    if (!subscription) return <Badge variant="secondary">No Subscription</Badge>;

    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  const getPlanDetails = (subscription: any) => {
    if (!subscription) return '-';

    if (subscription.status === 'trial') {
      const trialEnd = subscription.trialEndDate ? new Date(subscription.trialEndDate) : null;
      if (trialEnd) {
        const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <div className="text-sm">
            <span className="font-medium text-blue-600">Free Trial</span>
            <br />
            <span className="text-gray-500 text-xs">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
            </span>
          </div>
        );
      }
      return <span className="text-blue-600">Free Trial</span>;
    }

    if (subscription.status === 'active') {
      const planId = subscription.planId || 'yearly_plan';
      const planName = planId.includes('monthly') ? 'Monthly Plan' :
                      planId.includes('six_month') ? '6-Month Plan' :
                      planId.includes('yearly') ? 'Yearly Plan' : planId;

      const profiles = subscription.profileCount || subscription.paidSlots || 1;
      const endDate = subscription.subscriptionEndDate ? new Date(subscription.subscriptionEndDate) : null;

      return (
        <div className="text-sm">
          <span className="font-medium text-green-600">{planName}</span>
          <br />
          <span className="text-gray-500 text-xs">
            {profiles} profile{profiles > 1 ? 's' : ''}
            {endDate && ` • Expires ${format(endDate, 'MMM dd, yyyy')}`}
          </span>
        </div>
      );
    }

    return <span className="text-gray-500">-</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage users, subscriptions, and permissions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find users by email, name, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>Complete list of registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Plan Details</TableHead>
                  <TableHead>GBP Connected</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>
                        {user.disabled ? (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.subscription)}</TableCell>
                      <TableCell>{getPlanDetails(user.subscription)}</TableCell>
                      <TableCell>
                        {user.gbpAccountId ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50">
                            <XCircle className="h-3 w-3 mr-1 text-gray-400" />
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {adminLevel === 'super' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog(user, 'role')}
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Role
                            </Button>
                          )}
                          {(adminLevel === 'super' || adminLevel === 'moderator') && (
                            <Button
                              variant={user.disabled ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => openDialog(user, 'status')}
                            >
                              {user.disabled ? 'Activate' : 'Suspend'}
                            </Button>
                          )}
                          {user.gbpAccountId && user.subscription?.status === 'active' && (adminLevel === 'super' || adminLevel === 'moderator') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to cancel the subscription for ${user.email}?`)) {
                                  try {
                                    await cancelUserSubscription(user.gbpAccountId);
                                  } catch (error) {
                                    console.error('Error cancelling subscription:', error);
                                  }
                                }
                              }}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel Sub
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for actions */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'role' ? 'Update User Role' : 'Toggle User Status'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'role'
                ? `Make ${selectedUser?.email} an admin`
                : `${selectedUser?.disabled ? 'Activate' : 'Suspend'} ${selectedUser?.email}'s account`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={dialogType === 'role' ? handleUpdateRole : handleToggleStatus}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
