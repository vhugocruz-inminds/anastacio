import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Package,
  Users,
  Send,
  Plus,
  Trash2,
  Calendar,
  Star
} from "lucide-react";
import type { Supplier, Product } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

interface RfciFormData {
  title: string;
  description: string;
  priority: string;
  deadline: string;
  requestDate: string;
  requestedBy: string;
  items: {
    agrupador: string;
    productId: string;
    productName: string;
    itemId: string;
    qualidade: string;
    valorTributario: string;
    origem: string;
    quantity: string;
    unitOfMeasure: string;
    specifications: string;
  }[];
  supplierIds: string[];
}

// Mapeamento de Agrupadores e seus produtos
const agrupadorMapping = {
  "99561BR1A": { label: "99561BR1A", produtos: [] },
  "99561CK1A": { 
    label: "99561CK1A", 
    produtos: [
      {
        id: "prod-1",
        name: "Acetona Industrial",
        itemId: "45",
        qualidade: "1",
        valorTributario: "1",
        origem: "0",
      },
      {
        id: "prod-2",
        name: "Tolueno P.A.",
        itemId: "48",
        qualidade: "1",
        valorTributario: "2",
        origem: "1",
      },
      {
        id: "prod-3",
        name: "Resina Epóxi ER-100",
        itemId: "83",
        qualidade: "G",
        valorTributario: "2",
        origem: "1",
      },
    ] 
  },
  "99561CK1J": { label: "99561CK1J", produtos: [] },
};

const steps = [
  { id: 1, title: "Informações", icon: FileText },
  { id: 2, title: "Itens", icon: Package },
  { id: 3, title: "Fornecedores", icon: Users },
  { id: 4, title: "Revisar", icon: Check },
];

export default function RfciNewPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<RfciFormData>({
    title: "",
    description: "",
    priority: "NORMAL",
    deadline: "",
    requestDate: getCurrentDate(),
    requestedBy: user?.name || "Maria Silva",
    items: [],
    supplierIds: [],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const approvedSuppliers = suppliers?.filter(s => s.status === "APPROVED") || [];

  const createRfciMutation = useMutation({
    mutationFn: async (data: RfciFormData) => {
      return apiRequest("POST", "/api/rfcis", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfcis"] });
      toast({
        title: "RFCI criada com sucesso!",
        description: "Os fornecedores foram notificados.",
      });
      setLocation("/rfcis");
    },
    onError: () => {
      toast({
        title: "Erro ao criar RFCI",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { 
          agrupador: "", 
          productId: "", 
          productName: "", 
          itemId: "",
          qualidade: "",
          valorTributario: "",
          origem: "",
          quantity: "", 
          unitOfMeasure: "KG", 
          specifications: "" 
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Quando agrupador é alterado, limpar produto e itens
    if (field === "agrupador") {
      newItems[index].productId = "";
      newItems[index].productName = "";
      newItems[index].itemId = "";
      newItems[index].qualidade = "";
      newItems[index].valorTributario = "";
      newItems[index].origem = "";
    }
    
    // Quando produto é selecionado, preencher automaticamente ID e outros campos
    if (field === "productId") {
      const agrupador = newItems[index].agrupador;
      const agrupadorData = agrupadorMapping[agrupador as keyof typeof agrupadorMapping];
      const product = agrupadorData?.produtos?.find(p => p.id === value);
      
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitOfMeasure = "KG";
        newItems[index].itemId = product.itemId;
        newItems[index].qualidade = product.qualidade;
        newItems[index].valorTributario = product.valorTributario;
        newItems[index].origem = product.origem;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const getAvailableProdutos = (agrupador: string) => {
    const agrupadorData = agrupadorMapping[agrupador as keyof typeof agrupadorMapping];
    return agrupadorData?.produtos || [];
  };

  const toggleSupplier = (supplierId: string) => {
    const newIds = formData.supplierIds.includes(supplierId)
      ? formData.supplierIds.filter(id => id !== supplierId)
      : [...formData.supplierIds, supplierId];
    setFormData({ ...formData, supplierIds: newIds });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== "" && formData.deadline !== "";
      case 2:
        return formData.items.length > 0 && formData.items.every(i => 
          i.agrupador && i.productId && i.quantity
        );
      case 3:
        return formData.supplierIds.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    createRfciMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/rfcis">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Nova RFCI</h1>
          <p className="text-muted-foreground">
            Solicitação de Informação Comercial
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-8">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" :
                    isCompleted ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Defina o título, descrição e prazo da RFCI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Título da RFCI *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Cotação de Solventes Industriais"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-rfci-title"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os requisitos e especificações gerais..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  data-testid="input-rfci-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedBy">Solicitante</Label>
                <Select
                  value={formData.requestedBy}
                  onValueChange={(value) => setFormData({ ...formData, requestedBy: value })}
                >
                  <SelectTrigger data-testid="select-requested-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maria Silva">Maria Silva</SelectItem>
                    <SelectItem value="João Silva">João Silva</SelectItem>
                    <SelectItem value="Carlos Lima">Carlos Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDate">Data de Solicitação</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="requestDate"
                    type="date"
                    className="pl-10"
                    value={formData.requestDate}
                    onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                    data-testid="input-request-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo para Cotação *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="deadline"
                    type="date"
                    className="pl-10"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    data-testid="input-deadline"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Itens da Cotação</CardTitle>
                <CardDescription>Adicione os produtos que deseja cotar</CardDescription>
              </div>
              <Button onClick={addItem} className="gap-2" data-testid="button-add-item">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                <Package className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">Nenhum item adicionado</p>
                <Button onClick={addItem} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Primeiro Item
                </Button>
              </div>
            ) : (
              formData.items.map((item, idx) => {
                const availableProdutos = getAvailableProdutos(item.agrupador);
                
                return (
                  <div key={idx} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    {/* Primeira linha: Agrupador e Produto */}
                    <div className="grid gap-3 sm:grid-cols-6">
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs">Agrupador</Label>
                        <Select
                          value={item.agrupador}
                          onValueChange={(value) => updateItem(idx, "agrupador", value)}
                        >
                          <SelectTrigger data-testid={`select-agrupador-${idx}`} className="h-9">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="99561BR1A">99561BR1A</SelectItem>
                            <SelectItem value="99561CK1A">99561CK1A</SelectItem>
                            <SelectItem value="99561CK1J">99561CK1J</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:col-span-4">
                        <Label className="text-xs">Produto</Label>
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateItem(idx, "productId", value)}
                          disabled={!item.agrupador || availableProdutos.length === 0}
                        >
                          <SelectTrigger data-testid={`select-product-${idx}`} className="h-9">
                            <SelectValue placeholder={availableProdutos.length === 0 ? "Sem produtos" : "Selecione"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProdutos.map((produto) => (
                              <SelectItem key={produto.id} value={produto.id}>
                                {produto.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Segunda linha: ID, Qualidade, Var. Trib, Origem */}
                    <div className="grid gap-3 sm:grid-cols-6">
                      <div className="space-y-2">
                        <Label className="text-xs">ID</Label>
                        <Input
                          type="text"
                          placeholder="-"
                          value={item.itemId}
                          readOnly
                          className="bg-gray-100 h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Qualidade</Label>
                        <Input
                          type="text"
                          placeholder="-"
                          value={item.qualidade}
                          readOnly
                          className="bg-gray-100 h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Var. Trib</Label>
                        <Input
                          type="text"
                          placeholder="-"
                          value={item.valorTributario}
                          readOnly
                          className="bg-gray-100 h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Origem</Label>
                        <Input
                          type="text"
                          placeholder="-"
                          value={item.origem}
                          readOnly
                          className="bg-gray-100 h-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Qtd.</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          data-testid={`input-quantity-${idx}`}
                          className="h-9"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(idx)}
                          className="text-destructive w-full"
                          data-testid={`button-remove-item-${idx}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Terceira linha: Unidade e Especificações */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Unidade</Label>
                        <Select
                          value={item.unitOfMeasure}
                          onValueChange={(value) => updateItem(idx, "unitOfMeasure", value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="L">Litro</SelectItem>
                            <SelectItem value="UN">Unidade</SelectItem>
                            <SelectItem value="TON">Tonelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Especificações</Label>
                        <Input
                          placeholder="Opcional"
                          value={item.specifications}
                          onChange={(e) => updateItem(idx, "specifications", e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Fornecedores</CardTitle>
            <CardDescription>
              Escolha os fornecedores que receberão esta RFCI ({formData.supplierIds.length} selecionados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {approvedSuppliers.map((supplier) => {
                const isSelected = formData.supplierIds.includes(supplier.id);
                const score = supplier.performanceScore ? Number(supplier.performanceScore) : 0;

                return (
                  <div
                    key={supplier.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => toggleSupplier(supplier.id)}
                    data-testid={`supplier-card-${supplier.id}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSupplier(supplier.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{supplier.tradeName}</p>
                          <p className="text-sm text-muted-foreground">{supplier.mainActivity}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{score.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {supplier.addressCity}, {supplier.addressState}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar e Enviar</CardTitle>
            <CardDescription>Confira os dados antes de enviar a RFCI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Título</p>
                <p className="font-medium">{formData.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prioridade</p>
                <Badge variant="secondary">{formData.priority}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prazo</p>
                <p className="font-medium">{formData.deadline}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Solicitação</p>
                <p className="font-medium">{formData.requestDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solicitante</p>
                <p className="font-medium">{formData.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="text-sm">{formData.description || "-"}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Itens ({formData.items.length})</p>
              <div className="space-y-2">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.productName} - ID: {item.itemId}</span>
                      <span className="text-muted-foreground">{item.quantity}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>Agrupador: {item.agrupador}</div>
                      <div>Qualidade: {item.qualidade}</div>
                      <div>Var. Trib: {item.valorTributario}</div>
                      <div>Origem: {item.origem}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Fornecedores ({formData.supplierIds.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.supplierIds.map((id) => {
                  const supplier = suppliers?.find(s => s.id === id);
                  return (
                    <Badge key={id} variant="secondary">
                      {supplier?.tradeName || id}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            data-testid="button-next-step"
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createRfciMutation.isPending}
            className="gap-2"
            data-testid="button-submit-rfci"
          >
            <Send className="h-4 w-4" />
            Enviar RFCI
          </Button>
        )}
      </div>
    </div>
  );
}
