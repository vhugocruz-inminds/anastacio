import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
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

                  return (
                    <TableRow key={quotation.id} data-testid={`row-quotation-${quotation.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quotation.rfci?.title || "RFCI"}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {quotation.rfci?.code || quotation.rfciId.slice(0, 8)}
                          </p>
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
