import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Send, 
  Trophy, 
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SupplierDashboardStats, Rfci, Quotation } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";

function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  isLoading 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PendingRfciCard({ rfci }: { rfci: Rfci }) {
  const deadline = rfci.deadline ? new Date(rfci.deadline) : null;
  const isUrgent = deadline && (deadline.getTime() - Date.now()) < 2 * 24 * 60 * 60 * 1000;

  return (
    <Card className={isUrgent ? "border-orange-500/50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-medium">{rfci.title}</h3>
            <p className="text-sm text-muted-foreground font-mono">{rfci.code}</p>
          </div>
          {isUrgent && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Urgente
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {deadline ? format(deadline, "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
          </div>
        </div>

        <Link href={`/supplier/quotations/${rfci.id}`}>
          <Button className="w-full gap-2" data-testid={`button-respond-rfci-${rfci.id}`}>
            <Send className="h-4 w-4" />
            Responder Cotação
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function RecentQuotationItem({ quotation }: { quotation: Quotation }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
    PENDING: { label: "Pendente", variant: "outline", icon: Clock },
    SUBMITTED: { label: "Enviada", variant: "secondary", icon: Send },
    ACCEPTED: { label: "Aceita", variant: "default", icon: Trophy },
    REJECTED: { label: "Rejeitada", variant: "destructive", icon: AlertCircle },
    EXPIRED: { label: "Expirada", variant: "outline", icon: Clock },
  };

  const status = statusConfig[quotation.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const totalValue = quotation.totalValue ? Number(quotation.totalValue) : 0;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover-elevate">
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
        <StatusIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">RFCI #{quotation.rfciId.slice(0, 8)}</p>
        <p className="text-sm text-muted-foreground">
          R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <Badge variant={status.variant} className="gap-1">
        {status.label}
      </Badge>
    </div>
  );
}

export default function SupplierDashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<SupplierDashboardStats>({
    queryKey: ["/api/supplier/dashboard/stats"],
  });

  const { data: pendingRfcis, isLoading: rfcisLoading } = useQuery<Rfci[]>({
    queryKey: ["/api/supplier/rfcis/pending"],
  });

  const { data: recentQuotations, isLoading: quotationsLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/supplier/quotations/recent"],
  });

  const supplierScore = 4.5;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Olá, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Portal do Fornecedor
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary fill-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seu Score de Performance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{supplierScore.toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 5.0</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4 w-full md:w-auto">
              <div className="text-center">
                <p className="text-2xl font-semibold">4.6</p>
                <p className="text-xs text-muted-foreground">Qualidade</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">4.4</p>
                <p className="text-xs text-muted-foreground">Entrega</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">4.3</p>
                <p className="text-xs text-muted-foreground">Preço</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">4.7</p>
                <p className="text-xs text-muted-foreground">Atendimento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Cotações Pendentes"
          value={stats?.pendingQuotations ?? 2}
          subtitle="Aguardando sua resposta"
          icon={FileText}
          isLoading={statsLoading}
        />
        <StatCard
          title="Propostas Enviadas"
          value={stats?.submittedQuotations ?? 8}
          subtitle="Nos últimos 30 dias"
          icon={Send}
          isLoading={statsLoading}
        />
        <StatCard
          title="Cotações Ganhas"
          value={stats?.wonQuotations ?? 5}
          subtitle="Este mês"
          icon={Trophy}
          isLoading={statsLoading}
        />
        <StatCard
          title="Taxa de Sucesso"
          value={stats ? `${stats.winRate.toFixed(0)}%` : "62%"}
          subtitle="Win rate geral"
          icon={TrendingUp}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cotações Pendentes</h2>
            <Link href="/supplier/quotations">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          
          {rfcisLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingRfcis && pendingRfcis.length > 0 ? (
            <div className="space-y-4">
              {pendingRfcis.map((rfci) => (
                <PendingRfciCard key={rfci.id} rfci={rfci} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                <p className="font-medium">Tudo em dia!</p>
                <p className="text-sm text-muted-foreground">
                  Não há cotações pendentes no momento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Minhas Propostas Recentes</CardTitle>
            <Link href="/supplier/my-quotations">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-2">
            {quotationsLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentQuotations && recentQuotations.length > 0 ? (
              <div className="space-y-1">
                {recentQuotations.map((quotation) => (
                  <RecentQuotationItem key={quotation.id} quotation={quotation} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Send className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma proposta enviada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Dicas para Melhorar seu Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Responda Rápido</p>
                <p className="text-sm text-muted-foreground">
                  Cotações respondidas em até 24h têm maior chance de sucesso.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Seja Competitivo</p>
                <p className="text-sm text-muted-foreground">
                  Preços justos e condições flexíveis aumentam suas chances.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Mantenha a Qualidade</p>
                <p className="text-sm text-muted-foreground">
                  Entregas no prazo e produtos conforme especificação.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
