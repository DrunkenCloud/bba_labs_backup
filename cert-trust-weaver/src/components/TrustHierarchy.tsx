
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, ArrowDown, Link, Trash2 } from 'lucide-react';
import { CertificateAuthority } from '@/types/pki';
import { toast } from '@/hooks/use-toast';

interface TrustHierarchyProps {
  certificateAuthorities: CertificateAuthority[];
  onUpdateCAParent: (caId: string, parentCAId: string | null) => void;
  onDeleteCA: (caId: string) => void;
}

export const TrustHierarchy: React.FC<TrustHierarchyProps> = ({
  certificateAuthorities,
  onUpdateCAParent,
  onDeleteCA,
}) => {
  const [selectedCA, setSelectedCA] = useState('');
  const [selectedParent, setSelectedParent] = useState('');

  const handleUpdateParent = () => {
    if (!selectedCA) return;
    
    const parentCAId = selectedParent === 'root' ? null : selectedParent;
    onUpdateCAParent(selectedCA, parentCAId);
    
    const ca = certificateAuthorities.find(c => c.id === selectedCA);
    const parent = parentCAId ? certificateAuthorities.find(c => c.id === parentCAId) : null;
    
    toast({
      title: "Trust Relationship Updated",
      description: parentCAId 
        ? `${ca?.name} is now signed by ${parent?.name}`
        : `${ca?.name} is now a root CA`,
    });
    
    setSelectedCA('');
    setSelectedParent('');
  };

  const handleDeleteCA = (caId: string) => {
    const ca = certificateAuthorities.find(c => c.id === caId);
    const dependentCAs = certificateAuthorities.filter(c => c.parentCAId === caId);
    
    if (dependentCAs.length > 0) {
      toast({
        title: "CA Deleted",
        description: `${ca?.name} deleted. ${dependentCAs.length} dependent CA(s) converted to root CAs.`,
      });
    } else {
      toast({
        title: "CA Deleted",
        description: `${ca?.name} has been removed from the hierarchy.`,
      });
    }
    
    onDeleteCA(caId);
  };

  // Group CAs by level for hierarchical display
  const casByLevel = certificateAuthorities.reduce((acc, ca) => {
    if (!acc[ca.level]) acc[ca.level] = [];
    acc[ca.level].push(ca);
    return acc;
  }, {} as Record<number, CertificateAuthority[]>);

  const maxLevel = Math.max(...Object.keys(casByLevel).map(Number));

  return (
    <div className="space-y-6">
      {/* Trust Relationship Editor */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-purple-800">Modify Trust Relationships</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Select CA to modify
              </label>
              <Select value={selectedCA} onValueChange={setSelectedCA}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a CA" />
                </SelectTrigger>
                <SelectContent>
                  {certificateAuthorities.map((ca) => (
                    <SelectItem key={ca.id} value={ca.id}>
                      {ca.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Set parent CA
              </label>
              <Select 
                value={selectedParent} 
                onValueChange={setSelectedParent}
                disabled={!selectedCA}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose parent CA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Make Root CA</SelectItem>
                  {certificateAuthorities
                    .filter(ca => ca.id !== selectedCA)
                    .map((ca) => (
                      <SelectItem key={ca.id} value={ca.id}>
                        {ca.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleUpdateParent}
            disabled={!selectedCA || !selectedParent}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Link className="w-4 h-4 mr-2" />
            Update Relationship
          </Button>
        </CardContent>
      </Card>

      {/* Hierarchy Visualization */}
      <div className="space-y-6">
        <h4 className="font-medium text-slate-700">Certificate Authority Hierarchy</h4>
        
        {Object.keys(casByLevel).length === 0 ? (
          <p className="text-slate-500 text-center py-8 italic">No certificate authorities created yet</p>
        ) : (
          <div className="space-y-6">
            {Array.from({ length: maxLevel + 1 }, (_, level) => {
              const casAtLevel = casByLevel[level] || [];
              if (casAtLevel.length === 0) return null;

              return (
                <div key={level} className="relative">
                  {/* Level Header */}
                  <div className="flex items-center mb-3">
                    <Badge 
                      variant="outline" 
                      className={`mr-3 ${
                        level === 0 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {level === 0 ? 'Root Level' : `Level ${level}`}
                    </Badge>
                    {level > 0 && (
                      <ArrowDown className="w-4 h-4 text-slate-400 mr-2" />
                    )}
                  </div>

                  {/* CAs at this level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {casAtLevel.map((ca) => {
                      const parentCA = ca.parentCAId 
                        ? certificateAuthorities.find(p => p.id === ca.parentCAId)
                        : null;

                      return (
                        <Card 
                          key={ca.id} 
                          className={`border-2 transition-all hover:shadow-md ${
                            ca.isRoot 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-blue-300 bg-blue-50'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <Shield className={`w-5 h-5 mr-2 ${
                                    ca.isRoot ? 'text-green-600' : 'text-blue-600'
                                  }`} />
                                  <h5 className="font-medium text-slate-800">{ca.name}</h5>
                                </div>
                                
                                {parentCA ? (
                                  <p className="text-sm text-slate-600">
                                    Signed by: <span className="font-medium">{parentCA.name}</span>
                                  </p>
                                ) : (
                                  <p className="text-sm text-green-700 font-medium">
                                    Self-signed root
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary"
                                  className={ca.isRoot ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                                >
                                  {ca.isRoot ? 'Root' : 'Intermediate'}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCA(ca.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
