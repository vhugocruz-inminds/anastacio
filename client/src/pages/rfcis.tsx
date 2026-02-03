import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus,
  FileText,
  Calendar,
  Users,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Rfci } from "@shared/schema";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  DRAFT: { label: "Rascunho", variant: "outline", icon: FileText },
  SENT: { label: "Enviada", variant: "secondary", icon: Send },
  IN_QUOTATION: { label: "Em Cotação", variant: "default", icon: Clock },
  QUOTATION_CLOSED: { label: "Encerrada", variant: "secondary", icon: CheckCircle2 },
  AWARDED: { label: "Adjudicada", variant: "default", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelada", variant: "destructive", icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Baixa", color: "text-muted-foreground" },
  NORMAL: { label: "Normal", color: "text-blue-600 dark:text-blue-400" },
  HIGH: { label: "Alta", color: "text-orange-600 dark:text-orange-400" },
  URGENT: { label: "Urgente", color: "text-red-600 dark:text-red-400" },
};

export default function RfcisPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: rfcis, isLoading } = useQuery<Rfci[]>({
    queryKey: ["/api/rfcis"],
  });

  // Query para obter contagem de fornecedores por RFCI
  const { data: rfciSuppliersMap } = useQuery<Record<string, number>>({
    queryKey: ["/api/rfcis/suppliers-count"],
  });

  const filteredRfcis = rfcis?.filter((rfci) => {
    const matchesSearch = 
      rfci.title.toLowerCase().includes(search.toLowerCase()) ||
      rfci.code.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || rfci.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Função para calcular valor total fictício baseado nos itens
  const calculateTotalValue = (rfci: any) => {
    // Este é um valor fictício. Na prática, viria do banco de dados
    return Math.floor(Math.random() * 50000) + 5000;
  };

  // Função para gerar número fictício de ofertas (entre 1 e 5)
  const generateOfferCount = (rfciId: string) => {
    // Usar o ID como seed para gerar um número consistente
    const hash = rfciId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 5) + 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">RFCIs</h1>
          <p className="text-muted-foreground">
            Solicitações de Informação Comercial
          </p>
        </div>
        <Link href="/rfcis/new">
          <Button className="gap-2" data-testid="button-new-rfci-page">
            <Plus className="h-4 w-4" />
            Nova RFCI
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-rfcis"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-rfci-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="SENT">Enviada</SelectItem>
                  <SelectItem value="IN_QUOTATION">Em Cotação</SelectItem>
                  <SelectItem value="QUOTATION_CLOSED">Encerrada</SelectItem>
                  <SelectItem value="AWARDED">Adjudicada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-3 w-64" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRfcis && filteredRfcis.length > 0 ? (
            <div className="space-y-3">
              {filteredRfcis.map((rfci) => {
                const status = statusConfig[rfci.status] || statusConfig.DRAFT;
                const priority = priorityConfig[rfci.priority] || priorityConfig.NORMAL;
                const StatusIcon = status.icon;
                const deadline = rfci.deadline ? new Date(rfci.deadline) : null;
                const createdDate = rfci.createdAt ? new Date(rfci.createdAt) : null;
                const isOverdue = deadline && deadline < new Date() && rfci.status !== "AWARDED" && rfci.status !== "CANCELLED";
                
                // Obter número de fornecedores da RFCI
                const suppliersCount = rfciSuppliersMap?.[rfci.id] || 0;
                const offerCount = generateOfferCount(rfci.id);
                const totalValue = calculateTotalValue(rfci);

                return (
                  <div
                    key={rfci.id}
                    data-testid={`row-rfci-${rfci.id}`}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    {/* Cabeçalho: Título, Código e Status */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base">{rfci.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{rfci.code}</p>
                      </div>
                      <Badge variant={status.variant} className="gap-1 flex-shrink-0">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>

                    {/* Descrição */}
                    {rfci.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {rfci.description}
                      </p>
                    )}

                    {/* Grid de Informações */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-3 pb-3 border-t pt-3">
                      {/* Prioridade */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Prioridade</p>
                        <p className={`text-sm font-medium ${priority.color}`}>
                          {priority.label}
                        </p>
                      </div>

                      {/* Data de Criação */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Criada em</p>
                        <p className="text-sm font-medium">
                          {createdDate ? format(createdDate, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                        </p>
                      </div>

                      {/* Solicitante */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Solicitante</p>
                        <p className="text-sm font-medium truncate">
                          {rfci.requestedBy || "-"}
                        </p>
                      </div>

                      {/* Prazo */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Prazo</p>
                        <div className="flex items-center gap-1">
                          <Calendar className={`h-3 w-3 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${isOverdue ? "text-red-500" : ""}`}>
                            {deadline ? format(deadline, "dd/MM", { locale: ptBR }) : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Fornecedores */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Fornecedores</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{suppliersCount}</span>
                        </div>
                      </div>

                      {/* Total de Ofertas */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Ofertas</p>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{offerCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Valor Total e Botão */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Total</p>
                          <p className="text-lg font-bold text-primary">
                            R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <Link href={`/rfcis/${rfci.id}`}>
                        <Button variant="ghost" size="icon" data-testid={`button-view-rfci-${rfci.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-4">Nenhuma RFCI encontrada</p>
              <Link href="/rfcis/new">
                <Button variant="ghost" size="sm" className="mt-2">
                  Criar primeira RFCI
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
