
import React, { useState } from 'react';
import { CertificateManager } from '@/components/CertificateManager';
import { TrustHierarchy } from '@/components/TrustHierarchy';
import { WebsiteManager } from '@/components/WebsiteManager';
import { ValidationSimulator } from '@/components/ValidationSimulator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Certificate, CertificateAuthority, Website } from '@/types/pki';

const Index = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateAuthorities, setCertificateAuthorities] = useState<CertificateAuthority[]>([
    {
      id: 'root-ca-1',
      name: 'GlobalSign Root CA',
      isRoot: true,
      parentCAId: null,
      level: 0
    },
    {
      id: 'root-ca-2',
      name: 'VeriSign Root CA',
      isRoot: true,
      parentCAId: null,
      level: 0
    }
  ]);
  const [websites, setWebsites] = useState<Website[]>([]);

  const addCertificate = (certificate: Certificate) => {
    setCertificates([...certificates, certificate]);
  };

  const addCA = (ca: CertificateAuthority) => {
    setCertificateAuthorities([...certificateAuthorities, ca]);
  };

  const deleteCA = (caId: string) => {
    // Remove the CA and update any dependent CAs to become root CAs
    setCertificateAuthorities(cas => {
      const updatedCAs = cas
        .filter(ca => ca.id !== caId)
        .map(ca => {
          if (ca.parentCAId === caId) {
            return {
              ...ca,
              parentCAId: null,
              isRoot: true,
              level: 0
            };
          }
          return ca;
        });
      return updatedCAs;
    });

    // Remove certificates issued by this CA
    setCertificates(certs => certs.filter(cert => cert.issuingCAId !== caId));

    // Remove this CA from website trust stores
    setWebsites(sites => 
      sites.map(site => ({
        ...site,
        trustedCAIds: site.trustedCAIds.filter(id => id !== caId)
      }))
    );
  };

  const updateCAParent = (caId: string, parentCAId: string | null) => {
    setCertificateAuthorities(cas => 
      cas.map(ca => {
        if (ca.id === caId) {
          const parentCA = cas.find(p => p.id === parentCAId);
          return {
            ...ca,
            parentCAId,
            isRoot: !parentCAId,
            level: parentCA ? parentCA.level + 1 : 0
          };
        }
        return ca;
      })
    );
  };

  const addWebsite = (website: Website) => {
    setWebsites([...websites, website]);
  };

  const deleteWebsite = (websiteId: string) => {
    setWebsites(sites => sites.filter(site => site.id !== websiteId));
  };

  const updateWebsiteTrust = (websiteId: string, trustedCAIds: string[]) => {
    setWebsites(sites => 
      sites.map(site => 
        site.id === websiteId 
          ? { ...site, trustedCAIds }
          : site
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            PKI Certificate Authority Simulator
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Build certificate hierarchies, create trust relationships, and simulate certificate validation 
            in an interactive environment. Learn how PKI works through hands-on experimentation.
          </p>
        </header>

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="management">PKI Management</TabsTrigger>
            <TabsTrigger value="validation">Certificate Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="management">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Certificate Manager */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    Certificate Management
                  </h2>
                  <CertificateManager
                    certificates={certificates}
                    certificateAuthorities={certificateAuthorities}
                    onAddCertificate={addCertificate}
                    onAddCA={addCA}
                  />
                </div>

                {/* Website Manager */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    Website Trust Stores
                  </h2>
                  <WebsiteManager
                    websites={websites}
                    certificateAuthorities={certificateAuthorities}
                    onAddWebsite={addWebsite}
                    onDeleteWebsite={deleteWebsite}
                    onUpdateWebsiteTrust={updateWebsiteTrust}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Trust Hierarchy */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    Trust Hierarchy
                  </h2>
                  <TrustHierarchy
                    certificateAuthorities={certificateAuthorities}
                    onUpdateCAParent={updateCAParent}
                    onDeleteCA={deleteCA}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="validation">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                Certificate Validation Simulator
              </h2>
              <ValidationSimulator
                certificates={certificates}
                certificateAuthorities={certificateAuthorities}
                websites={websites}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
