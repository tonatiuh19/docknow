import React from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Plus, FileText, ToggleLeft } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import MetaHelmet from "@/components/MetaHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const AdminPreCheckout = () => {
  return (
    <AdminLayout>
      <MetaHelmet
        title="Admin Pre-Checkout"
        description="Configure pre-checkout requirements and arrival preparation steps for guests in DockNow admin."
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
            Pre-Checkout Steps
          </motion.h1>
          <p className="text-navy-600 mb-4">
            Configure required steps before guest arrival
          </p>
          <Button className="bg-gradient-ocean shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add New Step
          </Button>
        </div>

        {/* Pre-checkout Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Example Step */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-navy-900">
                    <FileText className="w-5 h-5 text-ocean-600" />
                    Boat Documentation
                  </CardTitle>
                  <Switch defaultChecked />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-navy-600 mb-4">
                  Guests must upload proof of boat registration and insurance
                  before check-in.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-ocean-100 text-ocean-700 border-ocean-200">
                    Required
                  </Badge>
                  <Badge className="bg-navy-100 text-navy-700 border-navy-200">
                    Document Upload
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Example Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-navy-50 to-ocean-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-navy-900">
                    <ClipboardCheck className="w-5 h-5 text-ocean-600" />
                    Safety Agreement
                  </CardTitle>
                  <Switch defaultChecked />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-navy-600 mb-4">
                  Guests must read and accept marina safety rules and
                  regulations.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-ocean-100 text-ocean-700 border-ocean-200">
                    Required
                  </Badge>
                  <Badge className="bg-ocean-200 text-ocean-800 border-ocean-300">
                    Agreement
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-600"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add Step Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-dashed border-navy-200 hover:border-ocean-300 transition-colors cursor-pointer h-full min-h-[250px] flex items-center justify-center">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-ocean-600" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  Add New Step
                </h3>
                <p className="text-sm text-navy-500">
                  Create a new pre-checkout requirement
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Card */}
        <Card className="border-none shadow-lg bg-ocean-50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-ocean-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900 mb-1">
                  About Pre-Checkout Steps
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed">
                  Pre-checkout steps help ensure guests are prepared before
                  arrival. You can require document uploads, agreements,
                  questionnaires, and more. All steps must be completed before
                  the guest's check-in date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPreCheckout;
