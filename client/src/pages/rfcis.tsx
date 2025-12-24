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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Send
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

  const filteredRfcis = rfcis?.filter((rfci) => {
    const matchesSearch = 
      rfci.title.toLowerCase().includes(search.toLowerCase()) ||
      rfci.code.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || rfci.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFCI</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Fornecedores</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredRfcis && filteredRfcis.length > 0 ? (
                filteredRfcis.map((rfci) => {
                  const status = statusConfig[rfci.status] || statusConfig.DRAFT;
                  const priority = priorityConfig[rfci.priority] || priorityConfig.NORMAL;
                  const StatusIcon = status.icon;
                  const deadline = rfci.deadline ? new Date(rfci.deadline) : null;
                  const isOverdue = deadline && deadline < new Date() && rfci.status !== "AWARDED" && rfci.status !== "CANCELLED";

                  return (
                    <TableRow key={rfci.id} data-testid={`row-rfci-${rfci.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rfci.title}</p>
                          <p className="text-sm text-muted-foreground font-mono">{rfci.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className={`h-4 w-4 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
                          <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                            {deadline ? format(deadline, "dd/MM/yyyy", { locale: ptBR }) : "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>3</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/rfcis/${rfci.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-view-rfci-${rfci.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhuma RFCI encontrada</p>
                      <Link href="/rfcis/new">
                        <Button variant="link" size="sm" className="mt-2">
                          Criar primeira RFCI
                        </Button>
                      </Link>
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
