
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Globe, Shield, Trash2 } from 'lucide-react';
import { Website, CertificateAuthority } from '@/types/pki';
import { toast } from '@/hooks/use-toast';

interface WebsiteManagerProps {
  websites: Website[];
  certificateAuthorities: CertificateAuthority[];
  onAddWebsite: (website: Website) => void;
  onDeleteWebsite: (websiteId: string) => void;
  onUpdateWebsiteTrust: (websiteId: string, trustedCAIds: string[]) => void;
}

export const WebsiteManager: React.FC<WebsiteManagerProps> = ({
  websites,
  certificateAuthorities,
  onAddWebsite,
  onDeleteWebsite,
  onUpdateWebsiteTrust,
}) => {
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<string | null>(null);

  const handleAddWebsite = () => {
    if (!newWebsiteName || !newWebsiteDomain) {
      toast({
        title: "Missing Information",
        description: "Please fill in all website fields",
        variant: "destructive",
      });
      return;
    }

    const website: Website = {
      id: `website-${Date.now()}`,
      name: newWebsiteName,
      domain: newWebsiteDomain,
      trustedCAIds: [],
    };

    onAddWebsite(website);
    setNewWebsiteName('');
    setNewWebsiteDomain('');
    setShowWebsiteForm(false);
    
    toast({
      title: "Website Created",
      description: `${website.name} has been added`,
    });
  };

  const handleDeleteWebsite = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId);
    onDeleteWebsite(websiteId);
    
    toast({
      title: "Website Deleted",
      description: `${website?.name} has been removed`,
    });
  };

  const handleTrustChange = (websiteId: string, caId: string, trusted: boolean) => {
    const website = websites.find(w => w.id === websiteId);
    if (!website) return;

    const newTrustedCAIds = trusted
      ? [...website.trustedCAIds, caId]
      : website.trustedCAIds.filter(id => id !== caId);

    onUpdateWebsiteTrust(websiteId, newTrustedCAIds);
  };

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <Button
        onClick={() => setShowWebsiteForm(!showWebsiteForm)}
        className="bg-green-600 hover:bg-green-700"
      >
        <Globe className="w-4 h-4 mr-2" />
        New Website
      </Button>

      {/* Website Creation Form */}
      {showWebsiteForm && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Create New Website</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="website-name">Website Name</Label>
              <Input
                id="website-name"
                placeholder="e.g., My E-commerce Site"
                value={newWebsiteName}
                onChange={(e) => setNewWebsiteName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website-domain">Domain</Label>
              <Input
                id="website-domain"
                placeholder="e.g., shop.example.com"
                value={newWebsiteDomain}
                onChange={(e) => setNewWebsiteDomain(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddWebsite} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Website
              </Button>
              <Button variant="outline" onClick={() => setShowWebsiteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Website List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Websites ({websites.length})</h3>
        <div className="space-y-4">
          {websites.map((website) => (
            <Card key={website.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-slate-800 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-green-600" />
                      {website.name}
                    </h4>
                    <p className="text-sm text-slate-600">Domain: {website.domain}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWebsite(
                        editingWebsite === website.id ? null : website.id
                      )}
                      className="text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Trust Store
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWebsite(website.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Trust Store Configuration */}
                {editingWebsite === website.id && (
                  <div className="border-t pt-4 mt-4">
                    <h5 className="font-medium text-slate-700 mb-3">
                      Trusted Certificate Authorities
                    </h5>
                    {certificateAuthorities.length === 0 ? (
                      <p className="text-slate-500 italic">No certificate authorities available</p>
                    ) : (
                      <div className="space-y-2">
                        {certificateAuthorities.map((ca) => (
                          <div key={ca.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`trust-${website.id}-${ca.id}`}
                              checked={website.trustedCAIds.includes(ca.id)}
                              onCheckedChange={(checked) =>
                                handleTrustChange(website.id, ca.id, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`trust-${website.id}-${ca.id}`}
                              className="flex items-center cursor-pointer"
                            >
                              <Shield className={`w-4 h-4 mr-2 ${
                                ca.isRoot ? 'text-green-600' : 'text-blue-600'
                              }`} />
                              {ca.name}
                              <Badge 
                                variant="outline" 
                                className={`ml-2 text-xs ${
                                  ca.isRoot 
                                    ? 'bg-green-100 text-green-700 border-green-300' 
                                    : 'bg-blue-100 text-blue-700 border-blue-300'
                                }`}
                              >
                                {ca.isRoot ? 'Root' : 'Intermediate'}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Trust Summary */}
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Trusted CAs:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {website.trustedCAIds.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {websites.length === 0 && (
            <p className="text-slate-500 text-center py-4 italic">No websites created yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
