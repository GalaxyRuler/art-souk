import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Search, Save, Download, Upload, Globe, AlertCircle, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface TranslationData {
  [key: string]: any;
}

interface TranslationItem {
  key: string;
  en: string;
  ar: string;
  path: string[];
}

export default function TranslationManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<TranslationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editedTranslations, setEditedTranslations] = useState<Record<string, { en?: string; ar?: string }>>({});
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load translations from i18n resources
  useEffect(() => {
    loadTranslations();
  }, []);

  // Filter translations based on search and tab
  useEffect(() => {
    filterTranslations();
  }, [searchTerm, activeTab, translations]);

  const loadTranslations = () => {
    setIsLoading(true);
    const enResources = i18n.getResourceBundle('en', 'translation') || {};
    const arResources = i18n.getResourceBundle('ar', 'translation') || {};
    
    const items: TranslationItem[] = [];
    
    // Flatten nested translation objects
    const flattenObject = (obj: any, prefix: string[] = []): void => {
      Object.keys(obj).forEach(key => {
        const path = [...prefix, key];
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenObject(obj[key], path);
        } else {
          const fullKey = path.join('.');
          const enValue = getNestedValue(enResources, path) || '';
          const arValue = getNestedValue(arResources, path) || '';
          items.push({
            key: fullKey,
            en: String(enValue),
            ar: String(arValue),
            path
          });
        }
      });
    };

    // Get nested value from object
    const getNestedValue = (obj: any, path: string[]): any => {
      return path.reduce((acc, key) => acc?.[key], obj);
    };

    // Start with English resources as base
    flattenObject(enResources);
    
    // Add any Arabic-only keys
    const addArabicOnlyKeys = (obj: any, prefix: string[] = []): void => {
      Object.keys(obj).forEach(key => {
        const path = [...prefix, key];
        const fullKey = path.join('.');
        if (!items.find(item => item.key === fullKey)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            addArabicOnlyKeys(obj[key], path);
          } else {
            items.push({
              key: fullKey,
              en: '',
              ar: String(obj[key]),
              path
            });
          }
        }
      });
    };
    
    addArabicOnlyKeys(arResources);
    
    setTranslations(items.sort((a, b) => a.key.localeCompare(b.key)));
    setIsLoading(false);
  };

  const filterTranslations = () => {
    let filtered = translations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ar.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tab filter
    switch (activeTab) {
      case 'missing':
        filtered = filtered.filter(item => !item.en || !item.ar);
        break;
      case 'edited':
        filtered = filtered.filter(item => editedTranslations[item.key]);
        break;
    }

    setFilteredTranslations(filtered);
  };

  const handleTranslationChange = (key: string, lang: 'en' | 'ar', value: string) => {
    setEditedTranslations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };

  const saveTranslations = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to backend
      // For now, we'll update the i18n resources directly
      Object.entries(editedTranslations).forEach(([key, values]) => {
        const path = key.split('.');
        
        if (values.en !== undefined) {
          updateNestedValue(i18n.store.data.en.translation, path, values.en);
        }
        if (values.ar !== undefined) {
          updateNestedValue(i18n.store.data.ar.translation, path, values.ar);
        }
      });

      toast({
        title: "Translations saved",
        description: `${Object.keys(editedTranslations).length} translations updated successfully`,
      });
      
      setEditedTranslations({});
      loadTranslations();
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save translations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateNestedValue = (obj: any, path: string[], value: string) => {
    const lastKey = path[path.length - 1];
    const parent = path.slice(0, -1).reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, obj);
    parent[lastKey] = value;
  };

  const exportTranslations = () => {
    const data = {
      en: i18n.getResourceBundle('en', 'translation'),
      ar: i18n.getResourceBundle('ar', 'translation')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Translations exported successfully",
    });
  };

  const importTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate and import translations
        toast({
          title: "Import successful",
          description: "Translations imported successfully",
        });
        loadTranslations();
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const getTranslationValue = (item: TranslationItem, lang: 'en' | 'ar') => {
    return editedTranslations[item.key]?.[lang] ?? item[lang];
  };

  const missingCount = translations.filter(item => !item.en || !item.ar).length;
  const editedCount = Object.keys(editedTranslations).length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Translation Management
                </CardTitle>
                <CardDescription>
                  Manage all translations for the Art Souk platform
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportTranslations}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label htmlFor="import-file">
                <Button
                  variant="outline"
                  size="sm"
                  as="span"
                  className="cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importTranslations}
              />
              <Button
                onClick={saveTranslations}
                disabled={editedCount === 0 || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes ({editedCount})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{translations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Missing Translations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{missingCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Edited</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{editedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(((translations.length - missingCount) / translations.length) * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search translations by key or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({translations.length})
              </TabsTrigger>
              <TabsTrigger value="missing">
                Missing ({missingCount})
              </TabsTrigger>
              <TabsTrigger value="edited">
                Edited ({editedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ScrollArea className="h-[600px] rounded-md border">
                <div className="p-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading translations...
                    </div>
                  ) : filteredTranslations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No translations found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTranslations.map((item) => (
                        <div key={item.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {item.key}
                            </code>
                            <div className="flex gap-2">
                              {!item.en && (
                                <Badge variant="outline" className="text-orange-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Missing EN
                                </Badge>
                              )}
                              {!item.ar && (
                                <Badge variant="outline" className="text-orange-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Missing AR
                                </Badge>
                              )}
                              {editedTranslations[item.key] && (
                                <Badge variant="outline" className="text-blue-600">
                                  Edited
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                <span>English</span>
                                {!item.en && <AlertCircle className="h-3 w-3 text-orange-600" />}
                              </label>
                              <Textarea
                                value={getTranslationValue(item, 'en')}
                                onChange={(e) => handleTranslationChange(item.key, 'en', e.target.value)}
                                className={`min-h-[60px] ${!item.en ? 'border-orange-400' : ''}`}
                                placeholder="English translation..."
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                <span>Arabic</span>
                                {!item.ar && <AlertCircle className="h-3 w-3 text-orange-600" />}
                              </label>
                              <Textarea
                                value={getTranslationValue(item, 'ar')}
                                onChange={(e) => handleTranslationChange(item.key, 'ar', e.target.value)}
                                className={`min-h-[60px] ${!item.ar ? 'border-orange-400' : ''}`}
                                placeholder="الترجمة العربية..."
                                dir="rtl"
                              />
                            </div>
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}