
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { Certificate, CertificateAuthority, Website, ValidationStep } from '@/types/pki';
import { toast } from '@/hooks/use-toast';

interface ValidationSimulatorProps {
  certificates: Certificate[];
  certificateAuthorities: CertificateAuthority[];
  websites: Website[];
}

export const ValidationSimulator: React.FC<ValidationSimulatorProps> = ({
  certificates,
  certificateAuthorities,
  websites,
}) => {
  const [selectedCertId, setSelectedCertId] = useState('');
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([]);
  const [validationResult, setValidationResult] = useState<'pending' | 'valid' | 'invalid' | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const findCAById = (id: string) => certificateAuthorities.find(ca => ca.id === id);

  const buildCAChain = (caId: string): string[] => {
    const chain: string[] = [];
    let currentCAId: string | null = caId;

    while (currentCAId && !chain.includes(currentCAId)) {
      chain.push(currentCAId);
      const ca = findCAById(currentCAId);
      currentCAId = ca?.parentCAId || null;
    }

    return chain;
  };

  const simulateValidation = async () => {
    if (!selectedCertId || !selectedWebsiteId) {
      toast({
        title: "Missing Selection",
        description: "Please select both a certificate and a website",
        variant: "destructive",
      });
      return;
    }

    const certificate = certificates.find(c => c.id === selectedCertId);
    const website = websites.find(w => w.id === selectedWebsiteId);
    
    if (!certificate || !website) return;

    setIsValidating(true);
    setValidationResult('pending');
    setValidationSteps([]);

    // Build the certificate's CA chain
    const caChain = buildCAChain(certificate.issuingCAId);
    const steps: ValidationStep[] = [];

    // Add delay for visualization
    for (let i = 0; i < caChain.length; i++) {
      const caId = caChain[i];
      const ca = findCAById(caId);
      if (!ca) continue;

      // Check if this CA is directly trusted
      if (website.trustedCAIds.includes(caId)) {
        steps.push({
          caId,
          caName: ca.name,
          action: 'trusted',
          description: `${ca.name} is directly trusted by ${website.name}`,
        });
        
        setValidationSteps([...steps]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setValidationResult('valid');
        setIsValidating(false);
        
        toast({
          title: "Certificate Valid",
          description: `Certificate accepted via trusted CA: ${ca.name}`,
        });
        return;
      } else {
        steps.push({
          caId,
          caName: ca.name,
          action: i === caChain.length - 1 ? 'not_trusted' : 'following_chain',
          description: i === caChain.length - 1
            ? `${ca.name} is not trusted by ${website.name}`
            : `${ca.name} not directly trusted, checking parent CA...`,
        });
      }

      setValidationSteps([...steps]);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // If we get here, no trusted CA was found
    setValidationResult('invalid');
    setIsValidating(false);
    
    toast({
      title: "Certificate Invalid",
      description: "No trusted CA found in certificate chain",
      variant: "destructive",
    });
  };

  const resetValidation = () => {
    setValidationSteps([]);
    setValidationResult(null);
    setIsValidating(false);
  };

  const selectedCert = certificates.find(c => c.id === selectedCertId);
  const selectedWebsite = websites.find(w => w.id === selectedWebsiteId);

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Select Certificate
          </label>
          <Select value={selectedCertId} onValueChange={setSelectedCertId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a certificate" />
            </SelectTrigger>
            <SelectContent>
              {certificates.map((cert) => (
                <SelectItem key={cert.id} value={cert.id}>
                  {cert.name} ({cert.domain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Select Website
          </label>
          <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.name} ({website.domain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={simulateValidation}
          disabled={!selectedCertId || !selectedWebsiteId || isValidating}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Play className="w-4 h-4 mr-2" />
          {isValidating ? 'Validating...' : 'Start Validation'}
        </Button>
        
        {(validationSteps.length > 0 || validationResult) && (
          <Button
            onClick={resetValidation}
            variant="outline"
            disabled={isValidating}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Validation Overview */}
      {(selectedCert && selectedWebsite) && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <h4 className="font-medium text-amber-800 mb-2">Validation Scenario</h4>
            <div className="text-sm text-slate-700">
              <p><strong>Certificate:</strong> {selectedCert.name} (for {selectedCert.domain})</p>
              <p><strong>Issued by:</strong> {findCAById(selectedCert.issuingCAId)?.name}</p>
              <p><strong>Presented to:</strong> {selectedWebsite.name} ({selectedWebsite.domain})</p>
              <p><strong>Website trusts:</strong> {
                selectedWebsite.trustedCAIds.length === 0 
                  ? 'No CAs'
                  : selectedWebsite.trustedCAIds
                      .map(id => findCAById(id)?.name)
                      .filter(Boolean)
                      .join(', ')
              }</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Steps Visualization */}
      {validationSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validation Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationSteps.map((step, index) => (
              <div key={`${step.caId}-${index}`} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {step.action === 'trusted' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : step.action === 'not_trusted' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-800">{step.caName}</span>
                    <Badge 
                      variant="outline"
                      className={
                        step.action === 'trusted' 
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : step.action === 'not_trusted'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }
                    >
                      {step.action === 'trusted' ? 'Trusted' : 
                       step.action === 'not_trusted' ? 'Not Trusted' : 'Checking'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Final Result */}
      {validationResult && validationResult !== 'pending' && (
        <Alert className={validationResult === 'valid' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center">
            {validationResult === 'valid' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <AlertDescription className={validationResult === 'valid' ? 'text-green-800' : 'text-red-800'}>
              <strong>
                {validationResult === 'valid' ? 'Certificate Accepted' : 'Certificate Rejected'}
              </strong>
              <br />
              {validationResult === 'valid' 
                ? 'The certificate was validated through a trusted certificate authority in the chain.'
                : 'No trusted certificate authority was found in the certificate chain.'
              }
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Help Text */}
      {certificates.length === 0 || websites.length === 0 ? (
        <Alert>
          <AlertDescription>
            To simulate certificate validation, you need to create at least one certificate and one website. 
            Use the forms above to set up your PKI environment.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
