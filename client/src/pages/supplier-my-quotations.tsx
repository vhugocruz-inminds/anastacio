import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Send, 
  Trophy, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QuotationWithItems } from "@shared/schema";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  PENDING: { label: "Pendente", variant: "outline", icon: Clock },
  SUBMITTED: { label: "Enviada", variant: "secondary", icon: Send },
  ACCEPTED: { label: "Aceita", variant: "default", icon: Trophy },
  REJECTED: { label: "Rejeitada", variant: "destructive", icon: XCircle },
  EXPIRED: { label: "Expirada", variant: "outline", icon: AlertCircle },
};

export default function SupplierMyQuotationsPage() {
  const { data: quotations, isLoading } = useQuery<QuotationWithItems[]>({
    queryKey: ["/api/supplier/quotations"],
  });

  const [expandedQuotation, setExpandedQuotation] = useState<string | null>(null);

  const toggleExpand = (quotationId: string) => {
    setExpandedQuotation(expandedQuotation === quotationId ? null : quotationId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Minhas Propostas</h1>
        <p className="text-muted-foreground">
          Histórico de cotações enviadas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{quotations?.filter(q => q.status === "SUBMITTED").length || 0}</p>
                <p className="text-xs text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{quotations?.filter(q => q.status === "PENDING").length || 0}</p>
                <p className="text-xs text-muted-foreground">Em Análise</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{quotations?.filter(q => q.status === "ACCEPTED").length || 0}</p>
                <p className="text-xs text-muted-foreground">Ganhas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{quotations?.filter(q => q.status === "REJECTED").length || 0}</p>
                <p className="text-xs text-muted-foreground">Não Selecionadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <h2 className="font-semibold">Histórico de Propostas</h2>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFCI</TableHead>
                <TableHead>Data Envio</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Prazo Entrega</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : quotations && quotations.length > 0 ? (
                quotations.map((quotation) => {
                  const status = statusConfig[quotation.status] || statusConfig.PENDING;
                  const StatusIcon = status.icon;
                  const totalValue = quotation.totalValue ? Number(quotation.totalValue) : 0;
                  const isExpanded = expandedQuotation === quotation.id;

                  return (
                    <>
                      <TableRow key={quotation.id} data-testid={`row-quotation-${quotation.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(quotation.id)}
                              className="h-8 w-8 p-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <p className="font-medium">{quotation.rfci?.title || "RFCI"}</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {quotation.rfci?.code || quotation.rfciId.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {quotation.submittedAt 
                            ? format(new Date(quotation.submittedAt), "dd/MM/yyyy", { locale: ptBR })
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {quotation.deliveryDays ? `${quotation.deliveryDays} dias` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {isExpanded && quotation.items && quotation.items.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/50 p-4">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm">Itens da Cotação</h4>
                              <Table className="bg-background">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="w-20">Quantidade</TableHead>
                                    <TableHead className="w-24">Estoque Atual</TableHead>
                                    <TableHead className="w-28">Preço Unitário</TableHead>
                                    <TableHead className="w-24">Prazo Atual</TableHead>
                                    <TableHead className="w-28">Prazo Qtd Restante</TableHead>
                                    <TableHead className="w-28 text-right">Total (Atual)</TableHead>
                                    <TableHead className="w-32 text-right">Total (Restante)</TableHead>
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
                                          <p className="font-medium">{item.productName}</p>
                                        </TableCell>
                                        <TableCell>
                                          <span className="font-mono">
                                            {Number(qty).toLocaleString('pt-BR')}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="font-mono">
                                            {Number(currentStock).toLocaleString('pt-BR')}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <span className="font-mono">
                                            R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          {item.currentDeliveryDays ? `${item.currentDeliveryDays} d` : "-"}
                                        </TableCell>
                                        <TableCell>
                                          {item.deliveryDays ? `${item.deliveryDays} d` : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          R$ {totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Send className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhuma proposta enviada ainda</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
