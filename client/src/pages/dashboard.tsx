import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  FileText, 
  TrendingDown, 
  Clock, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Timer
} from "lucide-react";
import { Link } from "wouter";
import type { DashboardStats, Rfci, Supplier } from "@shared/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const savingsData = [
  { month: "Jul", savings: 45000 },
  { month: "Ago", savings: 52000 },
  { month: "Set", savings: 38000 },
  { month: "Out", savings: 67000 },
  { month: "Nov", savings: 71000 },
  { month: "Dez", savings: 85000 },
];

const spendByCategory = [
  { category: "Solventes", value: 450000 },
  { category: "Resinas", value: 320000 },
  { category: "Aditivos", value: 280000 },
  { category: "Pigmentos", value: 180000 },
  { category: "Catalisadores", value: 120000 },
];

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  isLoading 
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
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
            {change && (
              <div className="flex items-center gap-1 text-xs">
                {changeType === "positive" && (
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                )}
                {changeType === "negative" && (
                  <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
                <span className={
                  changeType === "positive" ? "text-green-600 dark:text-green-400" :
                  changeType === "negative" ? "text-red-600 dark:text-red-400" :
                  "text-muted-foreground"
                }>
                  {change}
                </span>
              </div>
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

function RecentRfciItem({ rfci }: { rfci: Rfci }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    DRAFT: { label: "Rascunho", variant: "outline" },
    SENT: { label: "Enviada", variant: "secondary" },
    IN_QUOTATION: { label: "Em Cotação", variant: "default" },
    QUOTATION_CLOSED: { label: "Encerrada", variant: "secondary" },
    AWARDED: { label: "Adjudicada", variant: "default" },
    CANCELLED: { label: "Cancelada", variant: "destructive" },
  };

  const priorityConfig: Record<string, { icon: React.ElementType; color: string }> = {
    LOW: { icon: Clock, color: "text-muted-foreground" },
    NORMAL: { icon: Timer, color: "text-blue-600 dark:text-blue-400" },
    HIGH: { icon: AlertCircle, color: "text-orange-600 dark:text-orange-400" },
    URGENT: { icon: AlertCircle, color: "text-red-600 dark:text-red-400" },
  };

  const status = statusConfig[rfci.status] || statusConfig.DRAFT;
  const priority = priorityConfig[rfci.priority] || priorityConfig.NORMAL;
  const PriorityIcon = priority.icon;

  return (
    <Link href={`/rfcis/${rfci.id}`}>
      <div className="flex items-center gap-4 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer">
        <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${priority.color}`}>
          <PriorityIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{rfci.title}</p>
          <p className="text-sm text-muted-foreground">{rfci.code}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
    </Link>
  );
}

function TopSupplierItem({ supplier, rank }: { supplier: Supplier; rank: number }) {
  const score = supplier.performanceScore ? Number(supplier.performanceScore) : 0;

  return (
    <div className="flex items-center gap-4 p-3">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{supplier.tradeName}</p>
        <p className="text-sm text-muted-foreground">{supplier.mainActivity}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${score * 20}%` }}
          />
        </div>
        <span className="text-sm font-medium w-8">{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: allRfcis, isLoading: rfcisLoading } = useQuery<Rfci[]>({
    queryKey: ["/api/rfcis"],
  });
  const recentRfcis = allRfcis?.slice(0, 5);

  const { data: allSuppliers, isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });
  const topSuppliers = allSuppliers?.filter(s => s.status === "APPROVED").slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu procurement
          </p>
        </div>
        <Link href="/rfcis/new">
          <Button className="gap-2" data-testid="button-new-rfci">
            <Plus className="h-4 w-4" />
            Nova RFCI
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Fornecedores Ativos"
          value={stats?.approvedSuppliers ?? 0}
          change="+12% este mês"
          changeType="positive"
          icon={Users}
          isLoading={statsLoading}
        />
        <StatCard
          title="RFCIs Ativas"
          value={stats?.activeRfcis ?? 0}
          change="3 aguardando resposta"
          changeType="neutral"
          icon={FileText}
          isLoading={statsLoading}
        />
        <StatCard
          title="Savings Acumulado"
          value={stats ? `R$ ${(stats.totalSavings / 1000).toFixed(0)}k` : "R$ 0"}
          change="+18% vs. ano anterior"
          changeType="positive"
          icon={TrendingDown}
          isLoading={statsLoading}
        />
        <StatCard
          title="Lead Time Médio"
          value={stats ? `${stats.avgLeadTime} dias` : "0 dias"}
          change="-2 dias vs. meta"
          changeType="positive"
          icon={Clock}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Savings Mensal</CardTitle>
            <Badge variant="secondary">Últimos 6 meses</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={savingsData}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  className="text-xs" 
                  tickFormatter={(value) => `R$${value/1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">
                            R$ {(payload[0].value as number).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Spend por Categoria</CardTitle>
            <Badge variant="secondary">Este ano</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={spendByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis 
                  type="number" 
                  className="text-xs"
                  tickFormatter={(value) => `R$${value/1000}k`}
                />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  className="text-xs"
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-medium">
                            R$ {(payload[0].value as number).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">RFCIs Recentes</CardTitle>
            <Link href="/rfcis">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-2">
            {rfcisLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentRfcis && recentRfcis.length > 0 ? (
              <div className="space-y-1">
                {recentRfcis.map((rfci) => (
                  <RecentRfciItem key={rfci.id} rfci={rfci} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma RFCI encontrada</p>
                <Link href="/rfcis/new">
                  <Button variant="link" size="sm" className="mt-2">
                    Criar primeira RFCI
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Top Fornecedores</CardTitle>
            <Link href="/suppliers">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todos
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-2">
            {suppliersLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : topSuppliers && topSuppliers.length > 0 ? (
              <div className="space-y-1">
                {topSuppliers.map((supplier, idx) => (
                  <TopSupplierItem key={supplier.id} supplier={supplier} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum fornecedor encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Ações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium">3 RFCIs</p>
                <p className="text-sm text-muted-foreground">Aguardando cotação</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">5 Cotações</p>
                <p className="text-sm text-muted-foreground">Para análise</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">2 Aprovações</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
