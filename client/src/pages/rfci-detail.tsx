import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Trophy,
  TrendingDown,
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { RfciWithDetails, QuotationWithItems } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  DRAFT: { label: "Rascunho", variant: "outline", icon: FileText },
  SENT: { label: "Enviada", variant: "secondary", icon: Send },
  IN_QUOTATION: { label: "Em Cotação", variant: "default", icon: Clock },
  QUOTATION_CLOSED: { label: "Encerrada", variant: "secondary", icon: CheckCircle2 },
  AWARDED: { label: "Adjudicada", variant: "default", icon: Trophy },
  CANCELLED: { label: "Cancelada", variant: "destructive", icon: XCircle },
};

const quotationStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendente", variant: "outline" },
  SUBMITTED: { label: "Enviada", variant: "secondary" },
  ACCEPTED: { label: "Aceita", variant: "default" },
  REJECTED: { label: "Rejeitada", variant: "destructive" },
  EXPIRED: { label: "Expirada", variant: "outline" },
};

function ComparativeMap({ quotations, rfciId }: { quotations: QuotationWithItems[]; rfciId: string }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [expandedQuotation, setExpandedQuotation] = useState<string | null>(null);
  
  const awardMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      return apiRequest("POST", `/api/rfcis/${rfciId}/award`, { quotationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfcis", rfciId] });
      toast({
        title: "Cotação adjudicada!",
        description: "O fornecedor foi notificado sobre a decisão.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao adjudicar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleExpand = (quotationId: string) => {
    setExpandedQuotation(expandedQuotation === quotationId ? null : quotationId);
  };

  const submittedQuotations = quotations.filter(q => q.status === "SUBMITTED" || q.status === "ACCEPTED");
  
  if (submittedQuotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">Aguardando Cotações</h3>
        <p className="text-muted-foreground max-w-md">
          Os fornecedores ainda não enviaram suas propostas. Você será notificado quando as cotações forem recebidas.
        </p>
      </div>
    );
  }

  const sortedQuotations = [...submittedQuotations].sort((a, b) => {
    const aValue = a.totalValue ? Number(a.totalValue) : Infinity;
    const bValue = b.totalValue ? Number(b.totalValue) : Infinity;
    return aValue - bValue;
  });

  const lowestPrice = sortedQuotations[0]?.totalValue ? Number(sortedQuotations[0].totalValue) : 0;
  const hasWinner = quotations.some(q => q.status === "ACCEPTED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-600" />
          <span className="text-sm text-muted-foreground">
            Menor preço: <span className="font-semibold text-foreground">R$ {lowestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </span>
        </div>
        {hasWinner && (
          <Badge variant="default" className="gap-1">
            <Trophy className="h-3 w-3" />
            Adjudicada
          </Badge>
        )}
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedQuotations.map((quotation, idx) => {
          const totalValue = quotation.totalValue ? Number(quotation.totalValue) : 0;
          const isBest = idx === 0;
          const isWinner = quotation.status === "ACCEPTED";
          const savings = lowestPrice > 0 ? ((totalValue - lowestPrice) / lowestPrice) * 100 : 0;
          const quotationKey = `${quotation.id ?? quotation.supplierId ?? quotation.supplierName ?? "quotation"}-${idx}`;

          return (
            <Card 
              key={quotationKey} 
              className={`relative flex flex-col ${isWinner ? "ring-2 ring-green-500" : isBest ? "ring-2 ring-primary" : ""}`}
            >
              {isWinner && (
                <div className="absolute -top-3 left-4">
                  <Badge className="gap-1 bg-green-500">
                    <Trophy className="h-3 w-3" />
                    Vencedor
                  </Badge>
                </div>
              )}
              {!isWinner && isBest && (
                <div className="absolute -top-3 left-4">
                  <Badge className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Melhor Preço
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{quotation.supplierName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Enviada em {quotation.submittedAt ? format(new Date(quotation.submittedAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(quotationKey)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedQuotation === quotationKey ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor Total</span>
                    <span className="text-xl font-semibold">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-red-500 min-h-[16px]">
                    {savings > 0 ? (
                      <span>+{savings.toFixed(1)}% vs. menor</span>
                    ) : (
                      <span className="opacity-0">+0.0% vs. menor</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Prazo Entrega</p>
                    <p className="font-medium">{quotation.deliveryDays || "-"} dias</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="font-medium text-sm">{quotation.paymentTerms || "-"}</p>
                  </div>
                </div>

                {quotation.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{quotation.notes}</p>
                  </div>
                )}

                {expandedQuotation === quotationKey && quotation.items && (
                  <div className="pt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">Detalhes dos Itens</h4>
                    <div className="overflow-x-auto -mx-4 px-4">
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="w-16">Qtd</TableHead>
                            <TableHead className="w-20">Est. Atual</TableHead>
                            <TableHead className="w-20">Preço Unit</TableHead>
                            <TableHead className="w-16">Prazo Atu</TableHead>
                            <TableHead className="w-20">Prazo Rest</TableHead>
                            <TableHead className="w-20 text-right">Total Atu</TableHead>
                            <TableHead className="w-20 text-right">Total Rest</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quotation.items.map((item) => {
                            const qty = parseFloat(item.quantity.toString()) || 0;
                            const price = parseFloat(item.unitPrice.toString()) || 0;
                            const currentStock = parseFloat(item.currentStock?.toString() || "0") || 0;
                            const totalCurrent = currentStock * price;
                            const remainingQty = Math.max(0, qty - currentStock);
                            const totalRemaining = remainingQty * price;

                            return (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <span className="font-medium">{item.productName}</span>
                                </TableCell>
                                <TableCell>{Number(qty).toLocaleString('pt-BR')}</TableCell>
                                <TableCell>{Number(currentStock).toLocaleString('pt-BR')}</TableCell>
                                <TableCell>R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell>{item.currentDeliveryDays || "-"}</TableCell>
                                <TableCell>{item.deliveryDays || "-"}</TableCell>
                                <TableCell className="text-right">
                                  R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right">
                                  R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {!hasWinner && (
                  <Button 
                    className="mt-auto w-full gap-2" 
                    onClick={() => awardMutation.mutate(quotation.id)}
                    disabled={awardMutation.isPending}
                    data-testid={`button-award-${quotationKey}`}
                  >
                    <Trophy className="h-4 w-4" />
                    Adjudicar
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function RfciDetailPage() {
  const [, params] = useRoute("/rfcis/:id");
  const rfciId = params?.id;

  const { data: rfci, isLoading } = useQuery<RfciWithDetails>({
    queryKey: ["/api/rfcis", rfciId],
    enabled: !!rfciId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!rfci) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">RFQ não encontrada</h2>
        <Link href="/rfcis">
          <Button variant="ghost">Voltar para lista</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[rfci.status] || statusConfig.DRAFT;
  const StatusIcon = status.icon;
  const deadline = rfci.deadline ? new Date(rfci.deadline) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rfcis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">{rfci.title}</h1>
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">{rfci.code}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prazo</p>
                <p className="font-medium">
                  {deadline ? format(deadline, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fornecedores</p>
                <p className="font-medium">{rfci.suppliers?.length || 0} convidados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Itens</p>
                <p className="font-medium">{rfci.items?.length || 0} produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cotações</p>
                <p className="font-medium">
                  {rfci.quotations?.filter(q => q.status === "SUBMITTED").length || 0} recebidas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparative" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparative">Mapa Comparativo</TabsTrigger>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="comparative">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparativo de Cotações</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativeMap quotations={rfci.quotations || []} rfciId={rfci.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens Solicitados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Especificações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfci.items && rfci.items.length > 0 ? (
                    rfci.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{Number(item.quantity).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>{item.unitOfMeasure}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.specifications || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum item adicionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fornecedores Convidados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Convidado em</TableHead>
                    <TableHead>Status da Cotação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfci.suppliers && rfci.suppliers.length > 0 ? (
                    rfci.suppliers.map((rs) => {
                      const quotation = rfci.quotations?.find(q => q.supplierId === rs.supplierId);
                      const qStatus = quotation ? quotationStatusConfig[quotation.status] : null;

                      return (
                        <TableRow key={rs.id}>
                          <TableCell className="font-medium">
                            {rs.supplier?.tradeName || "Fornecedor"}
                          </TableCell>
                          <TableCell>
                            {rs.invitedAt ? format(new Date(rs.invitedAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                          </TableCell>
                          <TableCell>
                            {qStatus ? (
                              <Badge variant={qStatus.variant}>{qStatus.label}</Badge>
                            ) : (
                              <Badge variant="outline">Aguardando</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Nenhum fornecedor convidado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

