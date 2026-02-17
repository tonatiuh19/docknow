import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  UserCheck,
  UserX,
  Settings,
  Mail,
  Phone,
  Crown,
  User,
  Shield,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminLayout from "@/components/admin/AdminLayout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchManagedHosts,
  createHost,
  assignHost,
  updateHostRole,
  removeHost,
  clearError,
  setMarinaId,
} from "@/store/slices/adminHostsSlice";

// Validation schemas
const createHostSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  fullName: Yup.string().required("Full name is required"),
  phone: Yup.string().optional(),
});

const AdminHosts = () => {
  const dispatch = useAppDispatch();
  const {
    assignedHosts,
    availableHosts,
    marinaId,
    loading,
    creating,
    assigning,
    updating,
    error,
  } = useAppSelector((state) => state.adminHosts);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMarina, setSelectedMarina] = useState<number | null>(null);
  const [selectedHostForAssign, setSelectedHostForAssign] = useState<number>(0);

  // Mock marina data - replace with actual fetch from marinas slice
  const marinas = [
    { id: 10, name: "Golden Gate Harbor Marina" },
    { id: 11, name: "Sunset Bay Marina" },
    { id: 12, name: "Miami Beach Yacht Club" },
  ];

  const createHostFormik = useFormik({
    initialValues: {
      email: "",
      fullName: "",
      phone: "",
    },
    validationSchema: createHostSchema,
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(createHost(values));
      if (createHost.fulfilled.match(result)) {
        setCreateDialogOpen(false);
        resetForm();
        // Refresh the hosts list
        dispatch(fetchManagedHosts(selectedMarina || undefined));
      }
    },
  });

  useEffect(() => {
    dispatch(fetchManagedHosts(selectedMarina || undefined));
  }, [dispatch, selectedMarina]);

  const handleAssignHost = async () => {
    if (!selectedMarina || !selectedHostForAssign) {
      return;
    }

    const result = await dispatch(
      assignHost({
        marinaId: selectedMarina,
        hostId: selectedHostForAssign,
        role: "manager",
      }),
    );

    if (assignHost.fulfilled.match(result)) {
      setAssignDialogOpen(false);
      setSelectedHostForAssign(0);
      // Refresh the hosts list
      dispatch(fetchManagedHosts(selectedMarina));
    }
  };

  const handleUpdateRole = async (
    hostId: number,
    role: "primary" | "manager" | "staff",
  ) => {
    await dispatch(updateHostRole({ hostId, role }));
    // Refresh to get updated data
    dispatch(fetchManagedHosts(selectedMarina || undefined));
  };

  const handleRemoveHost = async (hostId: number) => {
    if (confirm("Are you sure you want to remove this host from the marina?")) {
      await dispatch(removeHost({ hostId }));
      // Refresh the list
      dispatch(fetchManagedHosts(selectedMarina || undefined));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "primary":
        return <Crown className="w-4 h-4" />;
      case "manager":
        return <Shield className="w-4 h-4" />;
      case "staff":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: string, isActive: boolean) => {
    const colors = {
      primary: "bg-yellow-100 text-yellow-700 border-yellow-200",
      manager: "bg-blue-100 text-blue-700 border-blue-200",
      staff: "bg-green-100 text-green-700 border-green-200",
    };

    const color = colors[role as keyof typeof colors] || colors.staff;
    const opacity = isActive ? "" : "opacity-50";

    return (
      <Badge
        variant="outline"
        className={`${color} ${opacity} flex items-center gap-1 capitalize`}
      >
        {getRoleIcon(role)}
        {role}
        {!isActive && <span className="ml-1 text-xs">(Inactive)</span>}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <MetaHelmet
        title="Admin Hosts"
        description="Manage host accounts, roles, and marina assignments in the DockNow admin panel."
        noindex
      />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-navy-900 mb-2"
          >
            Host Management
          </motion.h1>
          <p className="text-navy-600 mb-4">
            Manage hosts and their marina assignments with different roles and
            permissions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {/* Create Host Dialog */}
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-ocean shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Host
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={createHostFormik.handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Create New Host</DialogTitle>
                      <DialogDescription>
                        Create a new host account that can be assigned to
                        marinas with different roles.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...createHostFormik.getFieldProps("email")}
                          className="mt-1"
                        />
                        {createHostFormik.touched.email &&
                          createHostFormik.errors.email && (
                            <p className="text-sm text-red-500 mt-1">
                              {createHostFormik.errors.email}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          {...createHostFormik.getFieldProps("fullName")}
                          className="mt-1"
                        />
                        {createHostFormik.touched.fullName &&
                          createHostFormik.errors.fullName && (
                            <p className="text-sm text-red-500 mt-1">
                              {createHostFormik.errors.fullName}
                            </p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...createHostFormik.getFieldProps("phone")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={creating || !createHostFormik.isValid}
                      >
                        {creating ? "Creating..." : "Create Host"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Assign Host Dialog */}
              {selectedMarina && availableHosts.length > 0 && (
                <Dialog
                  open={assignDialogOpen}
                  onOpenChange={setAssignDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Assign Host
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Host to Marina</DialogTitle>
                      <DialogDescription>
                        Assign an available host to manage this marina.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Select Host</Label>
                        <Select
                          value={selectedHostForAssign.toString()}
                          onValueChange={(value) =>
                            setSelectedHostForAssign(parseInt(value))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a host" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableHosts.map((host) => (
                              <SelectItem
                                key={host.id}
                                value={host.id.toString()}
                              >
                                {host.full_name} ({host.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleAssignHost}
                        disabled={assigning || !selectedHostForAssign}
                      >
                        {assigning ? "Assigning..." : "Assign Host"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Marina Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="marina-select" className="text-sm text-navy-600">
                Marina:
              </Label>
              <Select
                value={selectedMarina?.toString() || "all"}
                onValueChange={(value) => {
                  const marinaId = value === "all" ? null : parseInt(value);
                  setSelectedMarina(marinaId);
                  dispatch(setMarinaId(marinaId));
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Marinas</SelectItem>
                  {marinas.map((marina) => (
                    <SelectItem key={marina.id} value={marina.id.toString()}>
                      {marina.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearError())}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-navy-500">Assigned Hosts</p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {assignedHosts.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-navy-500 to-navy-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-navy-500">Available Hosts</p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {availableHosts.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-navy-500">Active Assignments</p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {assignedHosts.filter((h) => h.is_active).length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Hosts Table */}
        {selectedMarina && (
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <UserCheck className="w-5 h-5 text-ocean-600" />
                Assigned Hosts -{" "}
                {marinas.find((m) => m.id === selectedMarina)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-navy-500">Loading assigned hosts...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-ocean-50">
                        <TableHead className="font-semibold text-navy-700">
                          Host
                        </TableHead>
                        <TableHead className="font-semibold text-navy-700">
                          Contact
                        </TableHead>
                        <TableHead className="font-semibold text-navy-700">
                          Role
                        </TableHead>
                        <TableHead className="font-semibold text-navy-700">
                          Assigned
                        </TableHead>
                        <TableHead className="font-semibold text-navy-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedHosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <Users className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                            <p className="text-navy-500">
                              No hosts assigned to this marina
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignedHosts.map((host) => (
                          <TableRow key={host.id} className="hover:bg-ocean-25">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {host.full_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-navy-900">
                                    {host.full_name}
                                  </p>
                                  <p className="text-sm text-navy-500">
                                    ID: {host.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-navy-700">
                                  <Mail className="w-4 h-4" />
                                  {host.email}
                                </div>
                                {host.phone && (
                                  <div className="flex items-center gap-2 text-sm text-navy-700">
                                    <Phone className="w-4 h-4" />
                                    {host.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(host.role, host.is_active)}
                            </TableCell>
                            <TableCell className="text-navy-700">
                              {formatDate(host.assigned_at)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={updating}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(host.id, "primary")
                                    }
                                  >
                                    {getRoleIcon("primary")} Set as Primary
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(host.id, "manager")
                                    }
                                  >
                                    {getRoleIcon("manager")} Set as Manager
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(host.id, "staff")
                                    }
                                  >
                                    {getRoleIcon("staff")} Set as Staff
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveHost(host.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Remove Host
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Hosts Table */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
            <CardTitle className="flex items-center gap-2 text-navy-900">
              <Users className="w-5 h-5 text-ocean-600" />
              Available Hosts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-navy-500">Loading available hosts...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ocean-50">
                      <TableHead className="font-semibold text-navy-700">
                        Host
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Contact
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Marina Count
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Joined
                      </TableHead>
                      <TableHead className="font-semibold text-navy-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableHosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Users className="w-12 h-12 text-navy-300 mx-auto mb-3" />
                          <p className="text-navy-500">
                            {selectedMarina
                              ? "All available hosts have been assigned to this marina"
                              : "No available hosts found"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      availableHosts.map((host) => (
                        <TableRow key={host.id} className="hover:bg-ocean-25">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-ocean rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {host.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-navy-900">
                                  {host.full_name}
                                </p>
                                <p className="text-sm text-navy-500">
                                  ID: {host.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-navy-700">
                                <Mail className="w-4 h-4" />
                                {host.email}
                              </div>
                              {host.phone && (
                                <div className="flex items-center gap-2 text-sm text-navy-700">
                                  <Phone className="w-4 h-4" />
                                  {host.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-navy-600 border-navy-200"
                            >
                              {host.marina_count || 0} marinas
                            </Badge>
                          </TableCell>
                          <TableCell className="text-navy-700">
                            {formatDate(host.created_at)}
                          </TableCell>
                          <TableCell>
                            {selectedMarina && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                                onClick={() => {
                                  setSelectedHostForAssign(host.id);
                                  setAssignDialogOpen(true);
                                }}
                                disabled={assigning}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Assign
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHosts;
