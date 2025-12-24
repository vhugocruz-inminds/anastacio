import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Send, 
  Calendar,
  Package,
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Rfci } from "@shared/schema";

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Baixa", color: "text-muted-foreground" },
  NORMAL: { label: "Normal", color: "text-blue-600 dark:text-blue-400" },
  HIGH: { label: "Alta", color: "text-orange-600 dark:text-orange-400" },
  URGENT: { label: "Urgente", color: "text-red-600 dark:text-red-400" },
};

function RfciCard({ rfci }: { rfci: Rfci }) {
  const deadline = rfci.deadline ? new Date(rfci.deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isUrgent = daysLeft <= 2;
  const isOverdue = daysLeft < 0;
  const priority = priorityConfig[rfci.priority] || priorityConfig.NORMAL;

  return (
    <Card className={isUrgent && !isOverdue ? "border-orange-500/50" : isOverdue ? "border-red-500/50" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-lg">{rfci.title}</h3>
            <p className="text-sm text-muted-foreground font-mono">{rfci.code}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-sm font-medium ${priority.color}`}>
              {priority.label}
            </span>
            {isOverdue ? (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Expirada
              </Badge>
            ) : isUrgent ? (
              <Badge variant="destructive" className="gap-1">
                <Clock className="h-3 w-3" />
                {daysLeft === 0 ? "Hoje" : `${daysLeft} dia${daysLeft > 1 ? 's' : ''}`}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {daysLeft} dias
              </Badge>
            )}
          </div>
        </div>

        {rfci.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {rfci.description}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {deadline ? format(deadline, "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>3 itens</span>
          </div>
        </div>

        <Link href={`/supplier/quotations/${rfci.id}`}>
          <Button className="w-full gap-2" disabled={isOverdue} data-testid={`button-respond-${rfci.id}`}>
            <Send className="h-4 w-4" />
            {isOverdue ? "Prazo Expirado" : "Responder Cotação"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function SupplierQuotationsPage() {
  const { data: rfcis, isLoading } = useQuery<Rfci[]>({
    queryKey: ["/api/supplier/rfcis/pending"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cotações Pendentes</h1>
        <p className="text-muted-foreground">
          RFCIs aguardando sua resposta
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rfcis && rfcis.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rfcis.map((rfci) => (
            <RfciCard key={rfci.id} rfci={rfci} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">Nenhuma cotação pendente</h3>
            <p className="text-muted-foreground max-w-md">
              Você está em dia! Quando novos pedidos de cotação chegarem, eles aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
