"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Palette, Upload, Download, Globe, Mail, Save, RotateCcw } from "lucide-react"

interface BrandingConfig {
  companyName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  customDomain: string
  emailFooter: string
  supportContact: string
  privacyPolicy: string
  termsOfService: string
}

export default function CustomBranding() {
  const [config, setConfig] = useState<BrandingConfig>({
    companyName: "Acme Corporation",
    logo: "/company-logo.png",
    primaryColor: "#1a365d",
    secondaryColor: "#2d3748",
    accentColor: "#3182ce",
    customDomain: "meetings.acme.com",
    emailFooter: "Powered by Acme Corporation Meeting Platform",
    supportContact: "support@acme.com",
    privacyPolicy: "https://acme.com/privacy",
    termsOfService: "https://acme.com/terms",
  })

  const [whiteLabel, setWhiteLabel] = useState(true)
  const [customEmails, setCustomEmails] = useState(true)
  const [customLogin, setCustomLogin] = useState(true)

  const updateConfig = (key: keyof BrandingConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const saveConfiguration = () => {
    console.log("[v0] Saving branding configuration:", config)
    // Save branding configuration
  }

  const resetToDefaults = () => {
    setConfig({
      companyName: "Meeting Mind",
      logo: "/default-logo.png",
      primaryColor: "#00bcd4",
      secondaryColor: "#1f2a44",
      accentColor: "#00bcd4",
      customDomain: "",
      emailFooter: "Powered by Meeting Mind",
      supportContact: "support@meetingmind.com",
      privacyPolicy: "",
      termsOfService: "",
    })
  }

  const exportBrandingPackage = () => {
    console.log("[v0] Exporting branding package...")
    // Export complete branding configuration
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Custom Branding & White Label
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/20 text-primary">
              Enterprise
            </Badge>
            <Button variant="outline" size="sm" className="bg-transparent" onClick={exportBrandingPackage}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            {/* Company Information */}
            <div className="space-y-3">
              <h4 className="font-medium">Company Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={config.companyName}
                    onChange={(e) => updateConfig("companyName", e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
              <h4 className="font-medium">Logo & Assets</h4>
              <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Upload your company logo</p>
                <Button variant="outline" size="sm" className="bg-transparent">
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Recommended: PNG or SVG, max 2MB, 200x60px</p>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="space-y-3">
              <h4 className="font-medium">Color Scheme</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig("primaryColor", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => updateConfig("primaryColor", e.target.value)}
                      placeholder="#1a365d"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={config.secondaryColor}
                      onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                      placeholder="#2d3748"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => updateConfig("accentColor", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={config.accentColor}
                      onChange={(e) => updateConfig("accentColor", e.target.value)}
                      placeholder="#3182ce"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="domain" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain</Label>
                <Input
                  id="custom-domain"
                  value={config.customDomain}
                  onChange={(e) => updateConfig("customDomain", e.target.value)}
                  placeholder="meetings.yourcompany.com"
                />
                <p className="text-xs text-muted-foreground">Configure your custom domain for white-label deployment</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium">White Label Mode</Label>
                    <p className="text-xs text-muted-foreground">Remove all Meeting Mind branding</p>
                  </div>
                  <Switch checked={whiteLabel} onCheckedChange={setWhiteLabel} />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium">Custom Email Templates</Label>
                    <p className="text-xs text-muted-foreground">Use branded email notifications</p>
                  </div>
                  <Switch checked={customEmails} onCheckedChange={setCustomEmails} />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium">Custom Login Page</Label>
                    <p className="text-xs text-muted-foreground">Branded authentication experience</p>
                  </div>
                  <Switch checked={customLogin} onCheckedChange={setCustomLogin} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-footer">Email Footer</Label>
                <Textarea
                  id="email-footer"
                  value={config.emailFooter}
                  onChange={(e) => updateConfig("emailFooter", e.target.value)}
                  placeholder="Custom footer text for email notifications"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-contact">Support Contact</Label>
                <Input
                  id="support-contact"
                  value={config.supportContact}
                  onChange={(e) => updateConfig("supportContact", e.target.value)}
                  placeholder="support@yourcompany.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
                  <Input
                    id="privacy-policy"
                    value={config.privacyPolicy}
                    onChange={(e) => updateConfig("privacyPolicy", e.target.value)}
                    placeholder="https://yourcompany.com/privacy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms-service">Terms of Service URL</Label>
                  <Input
                    id="terms-service"
                    value={config.termsOfService}
                    onChange={(e) => updateConfig("termsOfService", e.target.value)}
                    placeholder="https://yourcompany.com/terms"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-muted/10">
              <h4 className="font-medium mb-3">Preview</h4>
              <div className="space-y-4">
                {/* Header Preview */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: config.primaryColor,
                    color: "white",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold">{config.companyName}</h3>
                  </div>
                </div>

                {/* Button Preview */}
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: config.accentColor }} className="text-white">
                    Primary Button
                  </Button>
                  <Button
                    variant="outline"
                    style={{
                      borderColor: config.accentColor,
                      color: config.accentColor,
                    }}
                  >
                    Secondary Button
                  </Button>
                </div>

                {/* Email Footer Preview */}
                <div className="p-3 bg-gray-100 rounded text-sm text-gray-600">
                  <p>{config.emailFooter}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {config.supportContact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {config.customDomain || "your-domain.com"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button onClick={saveConfiguration} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button variant="outline" onClick={resetToDefaults} className="bg-transparent">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
