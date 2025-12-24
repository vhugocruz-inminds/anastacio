import { randomUUID } from "crypto";
import type { 
  User, InsertUser, 
  Supplier, InsertSupplier,
  Product, InsertProduct,
  Rfci, InsertRfci,
  RfciItem, InsertRfciItem,
  RfciSupplier, InsertRfciSupplier,
  Quotation, InsertQuotation,
  QuotationItem, InsertQuotationItem,
  RfciWithDetails,
  QuotationWithItems,
  DashboardStats,
  SupplierDashboardStats
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  
  // RFCIs
  getRfcis(): Promise<Rfci[]>;
  getRfci(id: string): Promise<Rfci | undefined>;
  getRfciWithDetails(id: string): Promise<RfciWithDetails | undefined>;
  createRfci(rfci: InsertRfci, items: InsertRfciItem[], supplierIds: string[]): Promise<Rfci>;
  awardRfci(rfciId: string, quotationId: string): Promise<void>;
  
  // Quotations
  getQuotations(): Promise<Quotation[]>;
  getQuotationsByRfci(rfciId: string): Promise<Quotation[]>;
  getQuotationsBySupplierId(supplierId: string): Promise<QuotationWithItems[]>;
  createQuotation(quotation: InsertQuotation, items: InsertQuotationItem[]): Promise<Quotation>;
  
  // Supplier Portal
  getPendingRfcisForSupplier(supplierId: string): Promise<Rfci[]>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getSupplierDashboardStats(supplierId: string): Promise<SupplierDashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private suppliers: Map<string, Supplier>;
  private products: Map<string, Product>;
  private rfcis: Map<string, Rfci>;
  private rfciItems: Map<string, RfciItem>;
  private rfciSuppliers: Map<string, RfciSupplier>;
  private quotations: Map<string, Quotation>;
  private quotationItems: Map<string, QuotationItem>;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.rfcis = new Map();
    this.rfciItems = new Map();
    this.rfciSuppliers = new Map();
    this.quotations = new Map();
    this.quotationItems = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Seed Users
    const buyerUser: User = {
      id: "user-1",
      email: "maria.silva@anastacio.com",
      password: "123456",
      name: "Maria Silva",
      role: "BUYER",
      phone: "(11) 99999-1234",
      department: "Compras",
      supplierId: null,
      createdAt: new Date(),
    };
    this.users.set(buyerUser.id, buyerUser);

    const supplierUser: User = {
      id: "user-2",
      email: "roberto.costa@quimicabrasil.com",
      password: "123456",
      name: "Roberto Costa",
      role: "SUPPLIER",
      phone: "(11) 98888-5678",
      department: null,
      supplierId: "supplier-1",
      createdAt: new Date(),
    };
    this.users.set(supplierUser.id, supplierUser);

    // Seed Suppliers
    const suppliers: Supplier[] = [
      {
        id: "supplier-1",
        legalName: "Química Brasil Ltda",
        tradeName: "Química Brasil",
        cnpj: "12.345.678/0001-90",
        email: "comercial@quimicabrasil.com",
        phone: "(11) 3333-1234",
        status: "APPROVED",
        addressCity: "São Paulo",
        addressState: "SP",
        mainActivity: "Solventes e Químicos Industriais",
        performanceScore: "4.5",
        qualityScore: "4.6",
        deliveryScore: "4.4",
        priceScore: "4.3",
        createdAt: new Date(),
      },
      {
        id: "supplier-2",
        legalName: "Insumos Químicos S.A.",
        tradeName: "InsuQuim",
        cnpj: "23.456.789/0001-12",
        email: "vendas@insuquim.com.br",
        phone: "(21) 2222-5678",
        status: "APPROVED",
        addressCity: "Rio de Janeiro",
        addressState: "RJ",
        mainActivity: "Resinas e Polímeros",
        performanceScore: "4.2",
        qualityScore: "4.3",
        deliveryScore: "4.0",
        priceScore: "4.4",
        createdAt: new Date(),
      },
      {
        id: "supplier-3",
        legalName: "SolventTech Indústria Química Ltda",
        tradeName: "SolventTech",
        cnpj: "34.567.890/0001-34",
        email: "contato@solventtech.com.br",
        phone: "(19) 3456-7890",
        status: "APPROVED",
        addressCity: "Campinas",
        addressState: "SP",
        mainActivity: "Solventes Especiais",
        performanceScore: "4.8",
        qualityScore: "4.9",
        deliveryScore: "4.7",
        priceScore: "4.6",
        createdAt: new Date(),
      },
      {
        id: "supplier-4",
        legalName: "Pigmentos do Sul S.A.",
        tradeName: "PigSul",
        cnpj: "45.678.901/0001-56",
        email: "comercial@pigsul.com.br",
        phone: "(51) 3210-9876",
        status: "APPROVED",
        addressCity: "Porto Alegre",
        addressState: "RS",
        mainActivity: "Pigmentos e Corantes",
        performanceScore: "3.9",
        qualityScore: "4.1",
        deliveryScore: "3.7",
        priceScore: "4.0",
        createdAt: new Date(),
      },
      {
        id: "supplier-5",
        legalName: "Aditivos Industriais Ltda",
        tradeName: "AditivosPro",
        cnpj: "56.789.012/0001-78",
        email: "vendas@aditivospro.com.br",
        phone: "(31) 2345-6789",
        status: "PENDING_APPROVAL",
        addressCity: "Belo Horizonte",
        addressState: "MG",
        mainActivity: "Aditivos e Catalisadores",
        performanceScore: null,
        qualityScore: null,
        deliveryScore: null,
        priceScore: null,
        createdAt: new Date(),
      },
    ];
    suppliers.forEach(s => this.suppliers.set(s.id, s));

    // Seed Products
    const products: Product[] = [
      {
        id: "prod-1",
        sku: "SOL-001",
        name: "Acetona Industrial",
        description: "Acetona de alta pureza para uso industrial",
        category: "Solventes",
        unitOfMeasure: "KG",
        ncmCode: "2914.11.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-2",
        sku: "SOL-002",
        name: "Tolueno P.A.",
        description: "Tolueno grau analítico",
        category: "Solventes",
        unitOfMeasure: "L",
        ncmCode: "2902.30.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-3",
        sku: "RES-001",
        name: "Resina Epóxi ER-100",
        description: "Resina epóxi de alto desempenho",
        category: "Resinas",
        unitOfMeasure: "KG",
        ncmCode: "3907.30.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-4",
        sku: "ADT-001",
        name: "Agente Dispersante AD-50",
        description: "Dispersante para tintas e revestimentos",
        category: "Aditivos",
        unitOfMeasure: "KG",
        ncmCode: "3402.90.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-5",
        sku: "PIG-001",
        name: "Dióxido de Titânio TiO2",
        description: "Pigmento branco de alta cobertura",
        category: "Pigmentos",
        unitOfMeasure: "KG",
        ncmCode: "2823.00.10",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-6",
        sku: "SOL-003",
        name: "Xileno Misto",
        description: "Mistura de isômeros de xileno",
        category: "Solventes",
        unitOfMeasure: "L",
        ncmCode: "2902.41.00",
        isActive: true,
        createdAt: new Date(),
      },
    ];
    products.forEach(p => this.products.set(p.id, p));

    // Seed RFCIs
    const rfcis: Rfci[] = [
      {
        id: "rfci-1",
        code: "RFCI-2024-001",
        title: "Cotação de Solventes Industriais",
        description: "Solicitação de cotação para solventes utilizados na linha de produção principal",
        status: "IN_QUOTATION",
        priority: "HIGH",
        createdById: "user-1",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "rfci-2",
        code: "RFCI-2024-002",
        title: "Resinas para Revestimentos",
        description: "Cotação para resinas epóxi para nova linha de revestimentos industriais",
        status: "IN_QUOTATION",
        priority: "NORMAL",
        createdById: "user-1",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "rfci-3",
        code: "RFCI-2024-003",
        title: "Pigmentos e Aditivos",
        description: "Cotação urgente para pigmentos e aditivos dispersantes",
        status: "AWARDED",
        priority: "URGENT",
        createdById: "user-1",
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
    rfcis.forEach(r => this.rfcis.set(r.id, r));

    // Seed RFCI Items
    const rfciItems: RfciItem[] = [
      { id: "rfci-item-1", rfciId: "rfci-1", productId: "prod-1", productName: "Acetona Industrial", quantity: "5000", unitOfMeasure: "KG", specifications: "Pureza mínima 99.5%" },
      { id: "rfci-item-2", rfciId: "rfci-1", productId: "prod-2", productName: "Tolueno P.A.", quantity: "2000", unitOfMeasure: "L", specifications: "Grau analítico" },
      { id: "rfci-item-3", rfciId: "rfci-1", productId: "prod-6", productName: "Xileno Misto", quantity: "3000", unitOfMeasure: "L", specifications: null },
      { id: "rfci-item-4", rfciId: "rfci-2", productId: "prod-3", productName: "Resina Epóxi ER-100", quantity: "1000", unitOfMeasure: "KG", specifications: "Viscosidade 500-700 cP" },
      { id: "rfci-item-5", rfciId: "rfci-3", productId: "prod-5", productName: "Dióxido de Titânio TiO2", quantity: "2000", unitOfMeasure: "KG", specifications: "Rutilo, 93% min" },
      { id: "rfci-item-6", rfciId: "rfci-3", productId: "prod-4", productName: "Agente Dispersante AD-50", quantity: "500", unitOfMeasure: "KG", specifications: null },
    ];
    rfciItems.forEach(i => this.rfciItems.set(i.id, i));

    // Seed RFCI Suppliers
    const rfciSuppliers: RfciSupplier[] = [
      { id: "rs-1", rfciId: "rfci-1", supplierId: "supplier-1", invitedAt: new Date() },
      { id: "rs-2", rfciId: "rfci-1", supplierId: "supplier-2", invitedAt: new Date() },
      { id: "rs-3", rfciId: "rfci-1", supplierId: "supplier-3", invitedAt: new Date() },
      { id: "rs-4", rfciId: "rfci-2", supplierId: "supplier-1", invitedAt: new Date() },
      { id: "rs-5", rfciId: "rfci-2", supplierId: "supplier-2", invitedAt: new Date() },
      { id: "rs-6", rfciId: "rfci-3", supplierId: "supplier-1", invitedAt: new Date() },
      { id: "rs-7", rfciId: "rfci-3", supplierId: "supplier-4", invitedAt: new Date() },
    ];
    rfciSuppliers.forEach(rs => this.rfciSuppliers.set(rs.id, rs));

    // Seed Quotations
    const quotations: Quotation[] = [
      {
        id: "quot-1",
        rfciId: "rfci-1",
        supplierId: "supplier-1",
        supplierName: "Química Brasil",
        status: "SUBMITTED",
        totalValue: "85000.00",
        deliveryDays: 15,
        paymentTerms: "30 DDL",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Frete incluso para entregas acima de R$ 50.000",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "quot-2",
        rfciId: "rfci-1",
        supplierId: "supplier-2",
        supplierName: "InsuQuim",
        status: "SUBMITTED",
        totalValue: "92000.00",
        deliveryDays: 12,
        paymentTerms: "30/60 DDL",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Entrega parcelada disponível",
        submittedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "quot-3",
        rfciId: "rfci-1",
        supplierId: "supplier-3",
        supplierName: "SolventTech",
        status: "SUBMITTED",
        totalValue: "78500.00",
        deliveryDays: 18,
        paymentTerms: "30 DDL",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Preço especial para pedido em grandes volumes",
        submittedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "quot-4",
        rfciId: "rfci-3",
        supplierId: "supplier-1",
        supplierName: "Química Brasil",
        status: "ACCEPTED",
        totalValue: "125000.00",
        deliveryDays: 10,
        paymentTerms: "30 DDL",
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: null,
        submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: "quot-5",
        rfciId: "rfci-3",
        supplierId: "supplier-4",
        supplierName: "PigSul",
        status: "REJECTED",
        totalValue: "138000.00",
        deliveryDays: 14,
        paymentTerms: "30/60 DDL",
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: null,
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
    quotations.forEach(q => this.quotations.set(q.id, q));

    // Seed Quotation Items
    const quotationItems: QuotationItem[] = [
      { id: "qi-1", quotationId: "quot-1", rfciItemId: "rfci-item-1", productName: "Acetona Industrial", quantity: "5000", unitPrice: "8.50", totalPrice: "42500.00", deliveryDays: 15 },
      { id: "qi-2", quotationId: "quot-1", rfciItemId: "rfci-item-2", productName: "Tolueno P.A.", quantity: "2000", unitPrice: "12.00", totalPrice: "24000.00", deliveryDays: 15 },
      { id: "qi-3", quotationId: "quot-1", rfciItemId: "rfci-item-3", productName: "Xileno Misto", quantity: "3000", unitPrice: "6.17", totalPrice: "18500.00", deliveryDays: 15 },
      { id: "qi-4", quotationId: "quot-2", rfciItemId: "rfci-item-1", productName: "Acetona Industrial", quantity: "5000", unitPrice: "9.20", totalPrice: "46000.00", deliveryDays: 12 },
      { id: "qi-5", quotationId: "quot-2", rfciItemId: "rfci-item-2", productName: "Tolueno P.A.", quantity: "2000", unitPrice: "13.50", totalPrice: "27000.00", deliveryDays: 12 },
      { id: "qi-6", quotationId: "quot-2", rfciItemId: "rfci-item-3", productName: "Xileno Misto", quantity: "3000", unitPrice: "6.33", totalPrice: "19000.00", deliveryDays: 12 },
      { id: "qi-7", quotationId: "quot-3", rfciItemId: "rfci-item-1", productName: "Acetona Industrial", quantity: "5000", unitPrice: "7.90", totalPrice: "39500.00", deliveryDays: 18 },
      { id: "qi-8", quotationId: "quot-3", rfciItemId: "rfci-item-2", productName: "Tolueno P.A.", quantity: "2000", unitPrice: "11.25", totalPrice: "22500.00", deliveryDays: 18 },
      { id: "qi-9", quotationId: "quot-3", rfciItemId: "rfci-item-3", productName: "Xileno Misto", quantity: "3000", unitPrice: "5.50", totalPrice: "16500.00", deliveryDays: 18 },
    ];
    quotationItems.forEach(qi => this.quotationItems.set(qi.id, qi));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).sort((a, b) => {
      const scoreA = a.performanceScore ? parseFloat(a.performanceScore) : 0;
      const scoreB = b.performanceScore ? parseFloat(b.performanceScore) : 0;
      return scoreB - scoreA;
    });
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = { ...insertSupplier, id, createdAt: new Date() };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  // RFCIs
  async getRfcis(): Promise<Rfci[]> {
    return Array.from(this.rfcis.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getRfci(id: string): Promise<Rfci | undefined> {
    return this.rfcis.get(id);
  }

  async getRfciWithDetails(id: string): Promise<RfciWithDetails | undefined> {
    const rfci = this.rfcis.get(id);
    if (!rfci) return undefined;

    const items = Array.from(this.rfciItems.values()).filter(i => i.rfciId === id);
    const rfciSuppliers = Array.from(this.rfciSuppliers.values())
      .filter(rs => rs.rfciId === id)
      .map(rs => ({
        ...rs,
        supplier: this.suppliers.get(rs.supplierId),
      }));
    const quotations = Array.from(this.quotations.values()).filter(q => q.rfciId === id);
    const createdBy = this.users.get(rfci.createdById);

    return {
      ...rfci,
      items,
      suppliers: rfciSuppliers,
      quotations,
      createdBy,
    };
  }

  async createRfci(rfciData: InsertRfci, items: InsertRfciItem[], supplierIds: string[]): Promise<Rfci> {
    const id = randomUUID();
    const code = `RFCI-2024-${String(this.rfcis.size + 1).padStart(3, '0')}`;
    
    const rfci: Rfci = {
      ...rfciData,
      id,
      code,
      status: "SENT",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rfcis.set(id, rfci);

    // Create items
    items.forEach((item, idx) => {
      const itemId = randomUUID();
      const rfciItem: RfciItem = {
        id: itemId,
        rfciId: id,
        productId: item.productId || `prod-${idx}`,
        productName: item.productName,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
        specifications: item.specifications || null,
      };
      this.rfciItems.set(itemId, rfciItem);
    });

    // Create supplier invitations
    supplierIds.forEach(supplierId => {
      const rsId = randomUUID();
      const rfciSupplier: RfciSupplier = {
        id: rsId,
        rfciId: id,
        supplierId,
        invitedAt: new Date(),
      };
      this.rfciSuppliers.set(rsId, rfciSupplier);

      // Create pending quotation for each supplier
      const quotId = randomUUID();
      const supplier = this.suppliers.get(supplierId);
      const quotation: Quotation = {
        id: quotId,
        rfciId: id,
        supplierId,
        supplierName: supplier?.tradeName || "Fornecedor",
        status: "PENDING",
        totalValue: null,
        deliveryDays: null,
        paymentTerms: null,
        validUntil: null,
        notes: null,
        submittedAt: null,
        createdAt: new Date(),
      };
      this.quotations.set(quotId, quotation);
    });

    return rfci;
  }

  async awardRfci(rfciId: string, quotationId: string): Promise<void> {
    const rfci = this.rfcis.get(rfciId);
    if (rfci) {
      rfci.status = "AWARDED";
      rfci.updatedAt = new Date();
      this.rfcis.set(rfciId, rfci);
    }

    // Update quotations
    Array.from(this.quotations.values())
      .filter(q => q.rfciId === rfciId)
      .forEach(q => {
        if (q.id === quotationId) {
          q.status = "ACCEPTED";
        } else if (q.status === "SUBMITTED") {
          q.status = "REJECTED";
        }
        this.quotations.set(q.id, q);
      });
  }

  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    return Array.from(this.quotations.values());
  }

  async getQuotationsByRfci(rfciId: string): Promise<Quotation[]> {
    return Array.from(this.quotations.values()).filter(q => q.rfciId === rfciId);
  }

  async getQuotationsBySupplierId(supplierId: string): Promise<QuotationWithItems[]> {
    const quotations = Array.from(this.quotations.values())
      .filter(q => q.supplierId === supplierId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    return quotations.map(q => ({
      ...q,
      items: Array.from(this.quotationItems.values()).filter(qi => qi.quotationId === q.id),
      supplier: this.suppliers.get(q.supplierId),
      rfci: this.rfcis.get(q.rfciId),
    }));
  }

  async createQuotation(quotationData: InsertQuotation, items: InsertQuotationItem[]): Promise<Quotation> {
    // Find existing pending quotation or create new
    let quotation = Array.from(this.quotations.values())
      .find(q => q.rfciId === quotationData.rfciId && q.supplierId === quotationData.supplierId && q.status === "PENDING");

    if (quotation) {
      quotation.status = "SUBMITTED";
      quotation.totalValue = quotationData.totalValue || null;
      quotation.deliveryDays = quotationData.deliveryDays || null;
      quotation.paymentTerms = quotationData.paymentTerms || null;
      quotation.validUntil = quotationData.validUntil || null;
      quotation.notes = quotationData.notes || null;
      quotation.submittedAt = new Date();
      this.quotations.set(quotation.id, quotation);
    } else {
      const id = randomUUID();
      quotation = {
        ...quotationData,
        id,
        status: "SUBMITTED",
        submittedAt: new Date(),
        createdAt: new Date(),
      };
      this.quotations.set(id, quotation);
    }

    // Create quotation items
    items.forEach(item => {
      const itemId = randomUUID();
      const quotationItem: QuotationItem = {
        id: itemId,
        quotationId: quotation!.id,
        rfciItemId: item.rfciItemId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        deliveryDays: item.deliveryDays || null,
      };
      this.quotationItems.set(itemId, quotationItem);
    });

    // Update RFCI status if needed
    const rfci = this.rfcis.get(quotationData.rfciId);
    if (rfci && rfci.status === "SENT") {
      rfci.status = "IN_QUOTATION";
      this.rfcis.set(rfci.id, rfci);
    }

    return quotation;
  }

  // Supplier Portal
  async getPendingRfcisForSupplier(supplierId: string): Promise<Rfci[]> {
    const supplierRfciIds = Array.from(this.rfciSuppliers.values())
      .filter(rs => rs.supplierId === supplierId)
      .map(rs => rs.rfciId);

    const pendingQuotations = Array.from(this.quotations.values())
      .filter(q => q.supplierId === supplierId && q.status === "PENDING")
      .map(q => q.rfciId);

    return Array.from(this.rfcis.values())
      .filter(r => 
        supplierRfciIds.includes(r.id) && 
        pendingQuotations.includes(r.id) &&
        (r.status === "SENT" || r.status === "IN_QUOTATION")
      )
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const suppliers = Array.from(this.suppliers.values());
    const rfcis = Array.from(this.rfcis.values());
    const quotations = Array.from(this.quotations.values());

    return {
      totalSuppliers: suppliers.length,
      approvedSuppliers: suppliers.filter(s => s.status === "APPROVED").length,
      activeRfcis: rfcis.filter(r => r.status === "SENT" || r.status === "IN_QUOTATION").length,
      pendingQuotations: quotations.filter(q => q.status === "SUBMITTED").length,
      totalSavings: 358000,
      avgLeadTime: 12,
    };
  }

  async getSupplierDashboardStats(supplierId: string): Promise<SupplierDashboardStats> {
    const quotations = Array.from(this.quotations.values()).filter(q => q.supplierId === supplierId);
    const pendingRfcis = await this.getPendingRfcisForSupplier(supplierId);

    const submitted = quotations.filter(q => q.status === "SUBMITTED").length;
    const won = quotations.filter(q => q.status === "ACCEPTED").length;
    const total = quotations.filter(q => q.status !== "PENDING").length;

    return {
      activeRfcis: pendingRfcis.length,
      pendingQuotations: pendingRfcis.length,
      submittedQuotations: submitted,
      wonQuotations: won,
      winRate: total > 0 ? (won / total) * 100 : 0,
      avgResponseTime: 2.3,
    };
  }
}

export const storage = new MemStorage();
