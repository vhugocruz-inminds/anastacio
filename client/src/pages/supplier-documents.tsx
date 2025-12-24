import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Search,
  Download,
  Eye,
  Filter,
  Upload,
  Building2,
  Calendar,
  FileCheck,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import type { SupplierDocument, SupplierDocumentStats, Supplier } from "@shared/schema";
import { useState } from "react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  subtitle
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  subtitle?: string;
}) {
  const variantStyles = {
    default: "bg-card",
    success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    danger: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className={`${variantStyles[variant]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md bg-background/50 ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string, t: (key: string) => string) {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType; label: string }> = {
    VALID: { variant: "default", icon: CheckCircle2, label: t('documents.status.valid') },
    EXPIRING_SOON: { variant: "secondary", icon: Clock, label: t('documents.status.expiringSoon') },
    EXPIRED: { variant: "destructive", icon: XCircle, label: t('documents.status.expired') },
    PENDING_REVIEW: { variant: "outline", icon: AlertTriangle, label: t('documents.status.pendingReview') },
  };
  
  const config = statusConfig[status] || statusConfig.VALID;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function DocumentRow({ 
  document, 
  supplier,
  showSupplier = true,
  i18n,
  t
}: { 
  document: SupplierDocument; 
  supplier?: Supplier;
  showSupplier?: boolean;
  i18n: any;
  t: (key: string) => string;
}) {
  const locale = i18n.language === 'pt' ? ptBR : enUS;
  const daysUntilExpiry = document.expiresAt 
    ? differenceInDays(new Date(document.expiresAt), new Date())
    : null;

  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0 hover-elevate">
      <div className="p-2 rounded-md bg-muted">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">
            {i18n.language === 'pt' 
              ? document.documentTypeName 
              : document.documentTypeNameLocalized?.enUS || document.documentTypeName}
          </p>
          {getStatusBadge(document.status, t)}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
          {showSupplier && supplier && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {supplier.tradeName}
            </span>
          )}
          <span>{document.fileName}</span>
          <span>{formatFileSize(document.fileSize)}</span>
        </div>
        {document.notes && (
          <p className="text-xs text-muted-foreground mt-1 italic">
            {i18n.language === 'pt' 
              ? document.notes 
              : document.notesLocalized?.enUS || document.notes}
          </p>
        )}
      </div>
      
      <div className="text-right min-w-[140px]">
        {document.expiresAt ? (
          <div>
            <p className="text-sm font-medium">
              {format(new Date(document.expiresAt), "dd/MM/yyyy", { locale })}
            </p>
            <p className={`text-xs ${
              daysUntilExpiry !== null && daysUntilExpiry < 0 
                ? "text-red-600 dark:text-red-400" 
                : daysUntilExpiry !== null && daysUntilExpiry <= 30 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-muted-foreground"
            }`}>
              {daysUntilExpiry !== null && daysUntilExpiry < 0 
                ? t('documents.expiredDaysAgo').replace('{days}', String(Math.abs(daysUntilExpiry)))
                : daysUntilExpiry !== null 
                  ? t('documents.expiresInDays').replace('{days}', String(daysUntilExpiry))
                  : ''}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('documents.noExpiry')}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" data-testid={`button-view-doc-${document.id}`}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" data-testid={`button-download-doc-${document.id}`}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SupplierDocumentsPage() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: documents, isLoading: documentsLoading } = useQuery<SupplierDocument[]>({
    queryKey: ["/api/documents"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<SupplierDocumentStats>({
    queryKey: ["/api/documents/stats"],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: expiringDocs } = useQuery<SupplierDocument[]>({
    queryKey: ["/api/documents/expiring"],
  });

  const suppliersMap = new Map(suppliers?.map(s => [s.id, s]) || []);

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = searchTerm === "" || 
      doc.documentTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suppliersMap.get(doc.supplierId)?.tradeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const expiredDocs = documents?.filter(d => d.status === "EXPIRED") || [];
  const expiringDocs30Days = documents?.filter(d => d.status === "EXPIRING_SOON") || [];
  const pendingDocs = documents?.filter(d => d.status === "PENDING_REVIEW") || [];

  if (documentsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{t('documents.title')}</h1>
          <p className="text-muted-foreground">
            {t('documents.subtitle')}
          </p>
        </div>
        <Button className="gap-2" data-testid="button-upload-document">
          <Upload className="h-4 w-4" />
          {t('documents.uploadDocument')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title={t('documents.stats.total')}
          value={stats?.total || 0}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title={t('documents.stats.valid')}
          value={stats?.valid || 0}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title={t('documents.stats.expiringSoon')}
          value={stats?.expiringSoon || 0}
          icon={Clock}
          variant="warning"
          subtitle={t('documents.stats.next30Days')}
        />
        <StatCard
          title={t('documents.stats.expired')}
          value={stats?.expired || 0}
          icon={XCircle}
          variant="danger"
        />
        <StatCard
          title={t('documents.stats.compliance')}
          value={`${stats?.complianceRate.toFixed(0) || 0}%`}
          icon={ShieldCheck}
          variant={stats && stats.complianceRate >= 80 ? "success" : stats && stats.complianceRate >= 60 ? "warning" : "danger"}
        />
      </div>

      {(expiredDocs.length > 0 || expiringDocs30Days.length > 0) && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              {t('documents.attentionRequired')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {expiredDocs.length > 0 && (
                <div className="p-3 rounded-md bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-700 dark:text-red-400">
                      {expiredDocs.length} {t('documents.documentsExpired')}
                    </span>
                  </div>
                  <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                    {expiredDocs.slice(0, 3).map(doc => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <span className="truncate">{suppliersMap.get(doc.supplierId)?.tradeName}: {doc.documentTypeName}</span>
                      </li>
                    ))}
                    {expiredDocs.length > 3 && (
                      <li className="text-xs">+{expiredDocs.length - 3} {t('documents.more')}</li>
                    )}
                  </ul>
                </div>
              )}
              {expiringDocs30Days.length > 0 && (
                <div className="p-3 rounded-md bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      {expiringDocs30Days.length} {t('documents.documentsExpiringSoon')}
                    </span>
                  </div>
                  <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                    {expiringDocs30Days.slice(0, 3).map(doc => (
                      <li key={doc.id} className="flex items-center gap-2">
                        <span className="truncate">{suppliersMap.get(doc.supplierId)?.tradeName}: {doc.documentTypeName}</span>
                      </li>
                    ))}
                    {expiringDocs30Days.length > 3 && (
                      <li className="text-xs">+{expiringDocs30Days.length - 3} {t('documents.more')}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>{t('documents.allDocuments')}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('documents.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search-documents"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <div className="px-4 border-b">
              <TabsList className="bg-transparent h-auto p-0 gap-4">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-3"
                  data-testid="tab-all-documents"
                >
                  {t('documents.tabs.all')} ({documents?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="VALID"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-3"
                  data-testid="tab-valid-documents"
                >
                  {t('documents.tabs.valid')} ({stats?.valid || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="EXPIRING_SOON"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-3"
                  data-testid="tab-expiring-documents"
                >
                  {t('documents.tabs.expiring')} ({stats?.expiringSoon || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="EXPIRED"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-3"
                  data-testid="tab-expired-documents"
                >
                  {t('documents.tabs.expired')} ({stats?.expired || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="PENDING_REVIEW"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none pb-3"
                  data-testid="tab-pending-documents"
                >
                  {t('documents.tabs.pending')} ({stats?.pendingReview || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="divide-y">
              {filteredDocuments?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('documents.noDocumentsFound')}</p>
                </div>
              ) : (
                filteredDocuments?.map(doc => (
                  <DocumentRow 
                    key={doc.id} 
                    document={doc} 
                    supplier={suppliersMap.get(doc.supplierId)}
                    i18n={i18n}
                    t={t}
                  />
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
