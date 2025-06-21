import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/shared/Card";
import Input from "../../../components/shared/Input";
import Button from "../../../components/shared/Button";
import Badge from "../../../components/shared/Badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/shared/Tabs";
import { Switch } from "../../../components/shared/Switch";
import LoadingOverlay from "../../../components/shared/LoadingOverlay";
import { BarsSpinner } from "../../../components/shared/Spinner";

export default function SettingsPage() {
  // Page-level loading spinner (simulates async fetch)
  const [loading, setLoading] = useState(true);

  // Per-tab saving spinner state
  const [saving, setSaving] = useState({
    company: false,
    notifications: false,
    security: false,
  });

  // Company, notification, and security settings state
  const [companySettings, setCompanySettings] = useState({
    name: "StockPro Inc.",
    email: "contact@stockpro.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, Suite 100, New York, NY 10001",
    taxId: "12-3456789",
    currency: "USD",
    logo: "/placeholder.svg?height=100&width=200",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderConfirmations: true,
    salesReports: true,
    newCustomerAlerts: false,
    systemUpdates: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAttempts: 5,
  });

  // Simulate initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // Toast notification (replace with your own if needed)
  const toast = ({ title, description }) => alert(`${title}\n${description}`);

  // Save handlers for each tab (simulate async save)
  const saveCompanySettings = () => {
    setSaving((s) => ({ ...s, company: true }));
    setTimeout(() => {
      setSaving((s) => ({ ...s, company: false }));
      toast({
        title: "Settings saved",
        description: "Your company settings have been updated successfully.",
      });
    }, 700);
  };
  const saveNotificationSettings = () => {
    setSaving((s) => ({ ...s, notifications: true }));
    setTimeout(() => {
      setSaving((s) => ({ ...s, notifications: false }));
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      });
    }, 700);
  };
  const saveSecuritySettings = () => {
    setSaving((s) => ({ ...s, security: true }));
    setTimeout(() => {
      setSaving((s) => ({ ...s, security: false }));
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved.",
      });
    }, 700);
  };

  // Show full-page spinner while loading
  if (loading) {
    return (
      <LoadingOverlay title="Settings" description="Loading settings..." />
    );
  }

  // Main settings page structure
  return (
    <div className="space-y-6 min-h-screen bg-white text-gray-900 dark:bg-background dark:text-text">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      {/* Tabs navigation */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">Users & Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company">
          {/* Spinner overlay for saving */}
          <div className="relative">
            {saving.company && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10 rounded-lg">
                <BarsSpinner />
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details and branding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company info form */}
                <Input
                  label="Company Name"
                  value={companySettings.name}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      name: e.target.value,
                    })
                  }
                />
                <Input
                  label="Email"
                  value={companySettings.email}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      email: e.target.value,
                    })
                  }
                />
                <Input
                  label="Phone"
                  value={companySettings.phone}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      phone: e.target.value,
                    })
                  }
                />
                <Input
                  label="Address"
                  value={companySettings.address}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      address: e.target.value,
                    })
                  }
                />
                <Input
                  label="Tax ID"
                  value={companySettings.taxId}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      taxId: e.target.value,
                    })
                  }
                />
                <Input
                  label="Currency"
                  value={companySettings.currency}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      currency: e.target.value,
                    })
                  }
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <input
                    type="file"
                    className="block w-full text-sm"
                    onChange={() => {}}
                  />
                  {companySettings.logo && (
                    <img
                      src={companySettings.logo}
                      alt="Logo"
                      className="mt-2 h-16"
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveCompanySettings}
                  isLoading={saving.company}
                >
                  Save
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="relative">
            {saving.notifications && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10 rounded-lg">
                <BarsSpinner />
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notification toggles */}
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((ns) => ({
                          ...ns,
                          [key]: checked,
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveNotificationSettings}
                  isLoading={saving.notifications}
                >
                  Save
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="relative">
            {saving.security && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 dark:bg-white/10 rounded-lg">
                <BarsSpinner />
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage authentication and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Security settings form */}
                <div className="flex items-center justify-between">
                  <span>Two-Factor Authentication</span>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((ss) => ({
                        ...ss,
                        twoFactorAuth: checked,
                      }))
                    }
                  />
                </div>
                <Input
                  label="Password Expiry (days)"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) =>
                    setSecuritySettings((ss) => ({
                      ...ss,
                      passwordExpiry: Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings((ss) => ({
                      ...ss,
                      sessionTimeout: Number(e.target.value),
                    }))
                  }
                />
                <Input
                  label="Max Login Attempts"
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={(e) =>
                    setSecuritySettings((ss) => ({
                      ...ss,
                      loginAttempts: Number(e.target.value),
                    }))
                  }
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveSecuritySettings}
                  isLoading={saving.security}
                >
                  Save
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Users & Permissions Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users & Permissions</CardTitle>
              <CardDescription>
                Manage user roles and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* User management info */}
              <div className="flex items-center gap-2 mb-4">
                <Button variant="primary" size="sm">
                  <span className="mr-2">Add User</span>
                </Button>
                <Badge variant="secondary">Admin</Badge>
                <Badge variant="secondary">Staff</Badge>
              </div>
              <div className="text-gray-500 text-sm">
                User management is available in the <b>Users</b> section.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect with third-party services and APIs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 text-sm">
                Integration options coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
