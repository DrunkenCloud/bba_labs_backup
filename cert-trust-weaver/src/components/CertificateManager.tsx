
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, Award } from 'lucide-react';
import { Certificate, CertificateAuthority } from '@/types/pki';
import { toast } from '@/hooks/use-toast';

interface CertificateManagerProps {
  certificates: Certificate[];
  certificateAuthorities: CertificateAuthority[];
  onAddCertificate: (certificate: Certificate) => void;
  onAddCA: (ca: CertificateAuthority) => void;
}

export const CertificateManager: React.FC<CertificateManagerProps> = ({
  certificates,
  certificateAuthorities,
  onAddCertificate,
  onAddCA,
}) => {
  const [newCertName, setNewCertName] = useState('');
  const [newCertDomain, setNewCertDomain] = useState('');
  const [selectedCAId, setSelectedCAId] = useState('');
  const [newCAName, setNewCAName] = useState('');
  const [showCertForm, setShowCertForm] = useState(false);
  const [showCAForm, setShowCAForm] = useState(false);

  const handleAddCertificate = () => {
    if (!newCertName || !newCertDomain || !selectedCAId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all certificate fields",
        variant: "destructive",
      });
      return;
    }

    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      name: newCertName,
      domain: newCertDomain,
      issuingCAId: selectedCAId,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };

    onAddCertificate(certificate);
    setNewCertName('');
    setNewCertDomain('');
    setSelectedCAId('');
    setShowCertForm(false);
    
    toast({
      title: "Certificate Created",
      description: `${certificate.name} has been issued by ${certificateAuthorities.find(ca => ca.id === selectedCAId)?.name}`,
    });
  };

  const handleAddCA = () => {
    if (!newCAName) {
      toast({
        title: "Missing Information",
        description: "Please enter a CA name",
        variant: "destructive",
      });
      return;
    }

    const ca: CertificateAuthority = {
      id: `ca-${Date.now()}`,
      name: newCAName,
      isRoot: true,
      parentCAId: null,
      level: 0,
    };

    onAddCA(ca);
    setNewCAName('');
    setShowCAForm(false);
    
    toast({
      title: "Certificate Authority Created",
      description: `${ca.name} has been added as a root CA`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowCertForm(!showCertForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Award className="w-4 h-4 mr-2" />
          New Certificate
        </Button>
        <Button
          onClick={() => setShowCAForm(!showCAForm)}
          variant="outline"
          className="border-purple-200 hover:bg-purple-50"
        >
          <Shield className="w-4 h-4 mr-2" />
          New CA
        </Button>
      </div>

      {/* Certificate Creation Form */}
      {showCertForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Create New Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cert-name">Certificate Name</Label>
              <Input
                id="cert-name"
                placeholder="e.g., Example.com SSL Certificate"
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cert-domain">Domain</Label>
              <Input
                id="cert-domain"
                placeholder="e.g., example.com"
                value={newCertDomain}
                onChange={(e) => setNewCertDomain(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="issuing-ca">Issuing Certificate Authority</Label>
              <Select value={selectedCAId} onValueChange={setSelectedCAId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a CA to issue this certificate" />
                </SelectTrigger>
                <SelectContent>
                  {certificateAuthorities.map((ca) => (
                    <SelectItem key={ca.id} value={ca.id}>
                      {ca.name} {ca.isRoot ? '(Root)' : '(Intermediate)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCertificate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Certificate
              </Button>
              <Button variant="outline" onClick={() => setShowCertForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CA Creation Form */}
      {showCAForm && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-800">Create New Certificate Authority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ca-name">CA Name</Label>
              <Input
                id="ca-name"
                placeholder="e.g., My Company Root CA"
                value={newCAName}
                onChange={(e) => setNewCAName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCA} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create CA
              </Button>
              <Button variant="outline" onClick={() => setShowCAForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Certificates ({certificates.length})</h3>
        <div className="space-y-2">
          {certificates.map((cert) => {
            const issuingCA = certificateAuthorities.find(ca => ca.id === cert.issuingCAId);
            return (
              <Card key={cert.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-800">{cert.name}</h4>
                      <p className="text-sm text-slate-600">Domain: {cert.domain}</p>
                      <p className="text-sm text-slate-500">
                        Issued by: {issuingCA?.name || 'Unknown CA'}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Valid
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {certificates.length === 0 && (
            <p className="text-slate-500 text-center py-4 italic">No certificates created yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
