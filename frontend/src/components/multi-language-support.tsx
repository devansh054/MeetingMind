"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Languages, FileText, Volume2, Download } from "lucide-react"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  supported: boolean
  accuracy: number
}

interface TranslationSession {
  id: string
  sourceLanguage: string
  targetLanguages: string[]
  isActive: boolean
  participantCount: number
}

export default function MultiLanguageSupport() {
  const [primaryLanguage, setPrimaryLanguage] = useState("en")
  const [realTimeTranslation, setRealTimeTranslation] = useState(true)
  const [autoDetection, setAutoDetection] = useState(true)
  const [transcriptionLanguages, setTranscriptionLanguages] = useState<string[]>(["en", "es", "fr"])
  const [translationSession, setTranslationSession] = useState<TranslationSession | null>(null)

  const languages: Language[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", supported: true, accuracy: 98 },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", supported: true, accuracy: 96 },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", supported: true, accuracy: 95 },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", supported: true, accuracy: 94 },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", supported: true, accuracy: 93 },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", supported: true, accuracy: 92 },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", supported: true, accuracy: 91 },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", supported: true, accuracy: 90 },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", supported: true, accuracy: 89 },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", supported: true, accuracy: 87 },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", supported: true, accuracy: 86 },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", supported: true, accuracy: 88 },
  ]

  useEffect(() => {
    // Simulate active translation session
    setTranslationSession({
      id: "session-1",
      sourceLanguage: "en",
      targetLanguages: ["es", "fr", "de"],
      isActive: true,
      participantCount: 8,
    })
  }, [])

  const toggleLanguageSupport = (languageCode: string) => {
    setTranscriptionLanguages((prev) =>
      prev.includes(languageCode) ? prev.filter((code) => code !== languageCode) : [...prev, languageCode],
    )
  }

  const startTranslationSession = () => {
    setTranslationSession({
      id: `session-${Date.now()}`,
      sourceLanguage: primaryLanguage,
      targetLanguages: transcriptionLanguages.filter((lang) => lang !== primaryLanguage),
      isActive: true,
      participantCount: 1,
    })
  }

  const stopTranslationSession = () => {
    setTranslationSession(null)
  }

  const exportTranslations = () => {
    console.log("[v0] Exporting translations...")
    // Export translated transcripts
  }

  const getLanguageByCode = (code: string) => languages.find((lang) => lang.code === code)

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Multi-Language Support
          </CardTitle>
          <div className="flex items-center gap-2">
            {translationSession?.isActive && (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                Live Translation
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={translationSession?.isActive ? stopTranslationSession : startTranslationSession}
            >
              {translationSession?.isActive ? "Stop" : "Start"} Translation
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="live">Live Session</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {/* Primary Language */}
            <div className="space-y-3">
              <h4 className="font-medium">Primary Language</h4>
              <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center gap-2">
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                        <span className="text-muted-foreground">({language.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Translation Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Real-time Translation</Label>
                  <p className="text-xs text-muted-foreground">Translate speech and text in real-time</p>
                </div>
                <Switch checked={realTimeTranslation} onCheckedChange={setRealTimeTranslation} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Auto Language Detection</Label>
                  <p className="text-xs text-muted-foreground">Automatically detect speaker languages</p>
                </div>
                <Switch checked={autoDetection} onCheckedChange={setAutoDetection} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Languages className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-sm font-medium">{transcriptionLanguages.length}</div>
                <div className="text-xs text-muted-foreground">Active Languages</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Globe className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-sm font-medium">95%</div>
                <div className="text-xs text-muted-foreground">Avg Accuracy</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Supported Languages</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {languages.map((language) => (
                  <div
                    key={language.code}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language.flag}</span>
                      <div>
                        <div className="font-medium text-sm">{language.name}</div>
                        <div className="text-xs text-muted-foreground">{language.nativeName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{language.accuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <Switch
                        checked={transcriptionLanguages.includes(language.code)}
                        onCheckedChange={() => toggleLanguageSupport(language.code)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            {translationSession?.isActive ? (
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-muted/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Active Translation Session</h4>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Source Language</Label>
                      <div className="flex items-center gap-2">
                        <span>{getLanguageByCode(translationSession.sourceLanguage)?.flag}</span>
                        <span className="text-sm">{getLanguageByCode(translationSession.sourceLanguage)?.name}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Participants</Label>
                      <div className="text-sm">{translationSession.participantCount} active</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Target Languages</Label>
                    <div className="flex flex-wrap gap-2">
                      {translationSession.targetLanguages.map((langCode) => {
                        const lang = getLanguageByCode(langCode)
                        return (
                          <Badge key={langCode} variant="outline" className="bg-primary/10 text-primary">
                            {lang?.flag} {lang?.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Translation Feed */}
                <div className="space-y-3">
                  <h4 className="font-medium">Live Translation Feed</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="p-3 border border-border rounded-lg bg-muted/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🇺🇸</span>
                        <span className="text-sm font-medium">Sarah Chen (English)</span>
                      </div>
                      <p className="text-sm mb-2">
                        "Welcome everyone to our quarterly review meeting. Today we'll discuss our performance metrics."
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span>🇪🇸 ES:</span>{" "}
                          <span className="text-muted-foreground">
                            "Bienvenidos a nuestra reunión de revisión trimestral. Hoy discutiremos nuestras métricas de
                            rendimiento."
                          </span>
                        </div>
                        <div className="text-xs">
                          <span>🇫🇷 FR:</span>{" "}
                          <span className="text-muted-foreground">
                            "Bienvenue à notre réunion de révision trimestrielle. Aujourd'hui, nous discuterons de nos
                            métriques de performance."
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border border-border rounded-lg bg-muted/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span>🇪🇸</span>
                        <span className="text-sm font-medium">Elena Rodriguez (Spanish)</span>
                      </div>
                      <p className="text-sm mb-2">"Gracias Sarah. Tengo algunas preguntas sobre los números de Q4."</p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span>🇺🇸 EN:</span>{" "}
                          <span className="text-muted-foreground">
                            "Thank you Sarah. I have some questions about the Q4 numbers."
                          </span>
                        </div>
                        <div className="text-xs">
                          <span>🇫🇷 FR:</span>{" "}
                          <span className="text-muted-foreground">
                            "Merci Sarah. J'ai quelques questions sur les chiffres du Q4."
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">No active translation session</p>
                <p className="text-xs text-muted-foreground">Start a session to enable real-time translation</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Translation History</h4>
              <Button variant="outline" size="sm" className="bg-transparent" onClick={exportTranslations}>
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>

            <div className="space-y-2">
              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">Quarterly Business Review</h5>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Duration: 45 min</span>
                  <span>Languages: EN, ES, FR</span>
                  <span>Accuracy: 96%</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    <FileText className="h-3 w-3 mr-1" />
                    Transcript
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Audio
                  </Button>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">Product Strategy Session</h5>
                  <span className="text-xs text-muted-foreground">1 day ago</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Duration: 60 min</span>
                  <span>Languages: EN, DE, IT</span>
                  <span>Accuracy: 94%</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    <FileText className="h-3 w-3 mr-1" />
                    Transcript
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Audio
                  </Button>
                </div>
              </div>
            </div>

            {/* Translation Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">127</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">12</div>
                <div className="text-xs text-muted-foreground">Languages</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">94%</div>
                <div className="text-xs text-muted-foreground">Avg Accuracy</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
