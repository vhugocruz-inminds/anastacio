import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft,
  Send,
  FileText,
  Calendar,
  Package,
  Building2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { RfciWithDetails } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuotationFormItem {
  rfciItemId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  currentStock: string;
  currentDeliveryDays: string;
  deliveryDays: string;
}

interface QuotationFormData {
  items: QuotationFormItem[];
  paymentTerms: string;
  validUntil: string;
  notes: string;
}

export default function SupplierQuotationRespondPage() {
  const [, params] = useRoute("/supplier/quotations/:id");
  const [, setLocation] = useLocation();
  const rfciId = params?.id;
  const { toast } = useToast();

  const { data: rfci, isLoading } = useQuery<RfciWithDetails>({
    queryKey: ["/api/rfcis", rfciId],
    enabled: !!rfciId,
  });

  const [formData, setFormData] = useState<QuotationFormData>({
    items: [],
    paymentTerms: "30 DDL",
    validUntil: "",
    notes: "",
  });

  useEffect(() => {
    if (rfci?.items && formData.items.length === 0) {
      setFormData(prev => ({
        ...prev,
        items: rfci.items.map((item) => ({
          rfciItemId: item.id,
          productName: item.productName,
          quantity: String(item.quantity),
          unitPrice: "",
          currentStock: "",
          currentDeliveryDays: "",
          deliveryDays: "",
        })),
      }));
    }
  }, [rfci?.items, formData.items.length]);

  const submitMutation = useMutation({
    mutationFn: async (data: QuotationFormData) => {
      return apiRequest("POST", `/api/rfcis/${rfciId}/quotations`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/quotations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/rfcis/pending"] });
      toast({
        title: "Cotação enviada com sucesso!",
        description: "O comprador foi notificado sobre sua proposta.",
      });
      setLocation("/supplier/my-quotations");
    },
    onError: () => {
      toast({
        title: "Erro ao enviar cotação",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateItemPrice = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const totalValue = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);
  }, [formData.items]);

  const canSubmit = useMemo(() => {
    return formData.items.length > 0 && formData.items.every(item => item.unitPrice && parseFloat(item.unitPrice) > 0);
  }, [formData.items]);

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
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
        <Link href="/supplier/quotations">
          <Button variant="ghost">Voltar para lista</Button>
        </Link>
      </div>
    );
  }

  const deadline = rfci.deadline ? new Date(rfci.deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isUrgent = daysLeft <= 2 && daysLeft >= 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/supplier/quotations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Responder Cotação</h1>
            {isUrgent && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {daysLeft === 0 ? "Expira hoje" : `${daysLeft} dia${daysLeft > 1 ? 's' : ''} restantes`}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-mono">{rfci.code}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{rfci.title}</CardTitle>
          {rfci.description && (
            <CardDescription>{rfci.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
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
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Itens</p>
                <p className="font-medium">{rfci.items?.length || 0} produtos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comprador</p>
                <p className="font-medium">Química Anastácio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Itens para Cotação</CardTitle>
          <CardDescription>Informe o preço unitário e prazo de entrega para cada item</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="w-20">Quantidade</TableHead>
                <TableHead className="w-24">Estoque Atual</TableHead>
                <TableHead className="w-20">Preço Unitário (R$)</TableHead>
                <TableHead className="w-20">Prazo Atual (Dias)</TableHead>
                <TableHead className="w-20">Prazo Qtd Restante (Dias)</TableHead>
                <TableHead className="w-28 text-right">Total (Atual)</TableHead>
                <TableHead className="w-32 text-right">Total (Restante)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.items.map((item, idx) => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.unitPrice) || 0;
                const currentStock = parseFloat(item.currentStock) || 0;
                
                const totalCurrent = currentStock * price;
                const remainingQty = Math.max(0, qty - currentStock);
                const totalRemaining = remainingQty * price;

                return (
                  <TableRow key={item.rfciItemId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {rfci.items?.[idx]?.specifications || "Sem especificações"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {Number(item.quantity).toLocaleString('pt-BR')} {rfci.items?.[idx]?.unitOfMeasure}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.currentStock}
                        onChange={(e) => updateItemPrice(idx, "currentStock", e.target.value)}
                        className="w-20"
                        data-testid={`input-stock-${idx}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={item.unitPrice}
                        onChange={(e) => updateItemPrice(idx, "unitPrice", e.target.value)}
                        className="w-20"
                        data-testid={`input-price-${idx}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.currentDeliveryDays}
                        onChange={(e) => updateItemPrice(idx, "currentDeliveryDays", e.target.value)}
                        className="w-20"
                        data-testid={`input-delivery-current-${idx}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.deliveryDays}
                        onChange={(e) => updateItemPrice(idx, "deliveryDays", e.target.value)}
                        className="w-20"
                        data-testid={`input-delivery-${idx}`}
                      />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Condições Comerciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
              >
                <SelectTrigger data-testid="select-payment-terms">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Vista">À Vista</SelectItem>
                  <SelectItem value="15 DDL">15 DDL</SelectItem>
                  <SelectItem value="30 DDL">30 DDL</SelectItem>
                  <SelectItem value="30/60 DDL">30/60 DDL</SelectItem>
                  <SelectItem value="30/60/90 DDL">30/60/90 DDL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Validade da Proposta</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                data-testid="input-valid-until"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre a proposta..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              data-testid="input-notes"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total da Proposta</p>
              <p className="text-3xl font-bold">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={handleSubmit}
              disabled={!canSubmit || submitMutation.isPending}
              data-testid="button-submit-quotation"
            >
              <Send className="h-4 w-4" />
              Enviar Cotação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

