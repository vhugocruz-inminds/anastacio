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
  SupplierDashboardStats,
  SupplierDocument,
  SupplierDocumentStats,
  LocalizedSupplier,
  LocalizedProduct,
  LocalizedRfci,
  LocalizedRfciItem,
  LocalizedQuotation
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

  // Quotations
  getQuotationItems(): Promise<QuotationItem[]>;

  // RFCIs
  getRfcis(): Promise<Rfci[]>;
  getRfci(id: string): Promise<Rfci | undefined>;
  getRfciWithDetails(id: string): Promise<RfciWithDetails | undefined>;
  createRfci(
    rfci: InsertRfci,
    items: Array<
      InsertRfciItem & {
        preco?: number | string;
        proposta?: number | string;
        unitPrice?: number | string;
        totalPrice?: number | string;
      }
    >,
    supplierIds: string[]
  ): Promise<Rfci>;
  awardRfci(rfciId: string, quotationId: string): Promise<void>;

  // Quotations
  getQuotations(): Promise<Quotation[]>;
  getQuotationsByRfci(rfciId: string): Promise<Quotation[]>;
  getQuotationsBySupplierId(supplierId: string): Promise<QuotationWithItems[]>;
  createQuotation(quotation: InsertQuotation, items: InsertQuotationItem[]): Promise<Quotation>;

  // Supplier Portal
  getPendingRfcisForSupplier(supplierId: string): Promise<Rfci[]>;
  getRfciTotalValues(): Promise<Record<string, number>>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getSupplierDashboardStats(supplierId: string): Promise<SupplierDashboardStats>;

  // Supplier Documents
  getSupplierDocuments(supplierId: string): Promise<SupplierDocument[]>;
  getAllSupplierDocuments(): Promise<SupplierDocument[]>;
  getSupplierDocumentStats(supplierId?: string): Promise<SupplierDocumentStats>;
  getExpiringDocuments(days: number): Promise<SupplierDocument[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private suppliers: Map<string, LocalizedSupplier>;
  private products: Map<string, LocalizedProduct>;
  private rfcis: Map<string, LocalizedRfci>;
  private rfciItems: Map<string, LocalizedRfciItem>;
  private rfciSuppliers: Map<string, RfciSupplier>;
  private quotations: Map<string, LocalizedQuotation>;
  private quotationItems: Map<string, QuotationItem>;
  private supplierDocuments: Map<string, SupplierDocument>;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.rfcis = new Map();
    this.rfciItems = new Map();
    this.rfciSuppliers = new Map();
    this.quotations = new Map();
    this.quotationItems = new Map();
    this.supplierDocuments = new Map();

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

    // Seed Suppliers (with localization)
    const suppliers: LocalizedSupplier[] = [
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
        mainActivityLocalized: { ptBR: "Solventes e Químicos Industriais", enUS: "Solvents and Industrial Chemicals" },
        performanceScore: "4.5",
        qualityScore: "4.6",
        deliveryScore: "4.4",
        priceScore: "4.3",
        createdAt: new Date(),
        providers: JSON.stringify([
          { name: "Fornecedor A", status: "Qualificado" },
          { name: "Fornecedor B", status: "Bloqueado" }
        ]),
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
        mainActivityLocalized: { ptBR: "Resinas e Polímeros", enUS: "Resins and Polymers" },
        performanceScore: "4.2",
        qualityScore: "4.3",
        deliveryScore: "4.0",
        priceScore: "4.4",
        createdAt: new Date(),
        providers: JSON.stringify([
          { name: "Fornecedor B", status: "Qualificado" },
          { name: "Fornecedor C", status: "Restrito" }
        ]),
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
        mainActivityLocalized: { ptBR: "Solventes Especiais", enUS: "Specialty Solvents" },
        performanceScore: "4.8",
        qualityScore: "4.9",
        deliveryScore: "4.7",
        priceScore: "4.6",
        createdAt: new Date(),
        providers: JSON.stringify([
          { name: "Fornecedor D", status: "Qualificado" }
        ]),
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
        mainActivityLocalized: { ptBR: "Pigmentos e Corantes", enUS: "Pigments and Dyes" },
        performanceScore: "3.9",
        qualityScore: "4.1",
        deliveryScore: "3.7",
        priceScore: "4.0",
        createdAt: new Date(),
        providers: JSON.stringify([
          { name: "Fornecedor C", status: "Qualificado" }
        ]),
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
        mainActivityLocalized: { ptBR: "Aditivos e Catalisadores", enUS: "Additives and Catalysts" },
        performanceScore: null,
        qualityScore: null,
        deliveryScore: null,
        priceScore: null,
        createdAt: new Date(),
        providers: JSON.stringify([
          { name: "Fornecedor A", status: "Restrito" },
          { name: "Fornecedor D", status: "Bloqueado" }
        ]),
      },
    ];
    suppliers.forEach(s => {
      this.suppliers.set(s.id, s);
    });

    // Seed Products (with localization)
    const products: LocalizedProduct[] = [
      {
        id: "prod-1",
        sku: "SOL-001",
        name: "Acetona Industrial",
        nameLocalized: { ptBR: "Acetona Industrial", enUS: "Industrial Acetone" },
        description: "Acetona de alta pureza para uso industrial",
        descriptionLocalized: { ptBR: "Acetona de alta pureza para uso industrial", enUS: "High purity acetone for industrial use" },
        category: "Solventes",
        categoryLocalized: { ptBR: "Solventes", enUS: "Solvents" },
        unitOfMeasure: "KG",
        ncmCode: "2914.11.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-2",
        sku: "SOL-002",
        name: "Tolueno P.A.",
        nameLocalized: { ptBR: "Tolueno P.A.", enUS: "Analytical Grade Toluene" },
        description: "Tolueno grau analítico",
        descriptionLocalized: { ptBR: "Tolueno grau analítico", enUS: "Analytical grade toluene" },
        category: "Solventes",
        categoryLocalized: { ptBR: "Solventes", enUS: "Solvents" },
        unitOfMeasure: "L",
        ncmCode: "2902.30.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-3",
        sku: "RES-001",
        name: "Resina Epóxi ER-100",
        nameLocalized: { ptBR: "Resina Epóxi ER-100", enUS: "Epoxy Resin ER-100" },
        description: "Resina epóxi de alto desempenho",
        descriptionLocalized: { ptBR: "Resina epóxi de alto desempenho", enUS: "High performance epoxy resin" },
        category: "Resinas",
        categoryLocalized: { ptBR: "Resinas", enUS: "Resins" },
        unitOfMeasure: "KG",
        ncmCode: "3907.30.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-4",
        sku: "ADT-001",
        name: "Agente Dispersante AD-50",
        nameLocalized: { ptBR: "Agente Dispersante AD-50", enUS: "Dispersing Agent AD-50" },
        description: "Dispersante para tintas e revestimentos",
        descriptionLocalized: { ptBR: "Dispersante para tintas e revestimentos", enUS: "Dispersant for paints and coatings" },
        category: "Aditivos",
        categoryLocalized: { ptBR: "Aditivos", enUS: "Additives" },
        unitOfMeasure: "KG",
        ncmCode: "3402.90.00",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-5",
        sku: "PIG-001",
        name: "Dióxido de Titânio TiO2",
        nameLocalized: { ptBR: "Dióxido de Titânio TiO2", enUS: "Titanium Dioxide TiO2" },
        description: "Pigmento branco de alta cobertura",
        descriptionLocalized: { ptBR: "Pigmento branco de alta cobertura", enUS: "High coverage white pigment" },
        category: "Pigmentos",
        categoryLocalized: { ptBR: "Pigmentos", enUS: "Pigments" },
        unitOfMeasure: "KG",
        ncmCode: "2823.00.10",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prod-6",
        sku: "SOL-003",
        name: "Xileno Misto",
        nameLocalized: { ptBR: "Xileno Misto", enUS: "Mixed Xylene" },
        description: "Mistura de isômeros de xileno",
        descriptionLocalized: { ptBR: "Mistura de isômeros de xileno", enUS: "Mixture of xylene isomers" },
        category: "Solventes",
        categoryLocalized: { ptBR: "Solventes", enUS: "Solvents" },
        unitOfMeasure: "L",
        ncmCode: "2902.41.00",
        isActive: true,
        createdAt: new Date(),
      },
    ];
    products.forEach(p => this.products.set(p.id, p));

    // Seed RFCIs (with localization)
    const rfcis: LocalizedRfci[] = [
      {
        id: "rfci-1",
        code: "RFCI-2024-001",
        title: "Cotação de Solventes Industriais",
        titleLocalized: { ptBR: "Cotação de Solventes Industriais", enUS: "Industrial Solvents Quotation" },
        description: "Solicitação de cotação para solventes utilizados na linha de produção principal",
        descriptionLocalized: { ptBR: "Solicitação de cotação para solventes utilizados na linha de produção principal", enUS: "Quotation request for solvents used in the main production line" },
        status: "IN_QUOTATION",
        priority: "HIGH",
        createdById: "user-1",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        requestedBy: "Maria Silva",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "rfci-2",
        code: "RFCI-2024-002",
        title: "Resinas para Revestimentos",
        titleLocalized: { ptBR: "Resinas para Revestimentos", enUS: "Resins for Coatings" },
        description: "Cotação para resinas epóxi para nova linha de revestimentos industriais",
        descriptionLocalized: { ptBR: "Cotação para resinas epóxi para nova linha de revestimentos industriais", enUS: "Quotation for epoxy resins for new industrial coatings line" },
        status: "IN_QUOTATION",
        priority: "NORMAL",
        createdById: "user-1",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        requestedBy: "João Silva",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "rfci-3",
        code: "RFCI-2024-003",
        title: "Pigmentos e Aditivos",
        titleLocalized: { ptBR: "Pigmentos e Aditivos", enUS: "Pigments and Additives" },
        description: "Cotação urgente para pigmentos e aditivos dispersantes",
        descriptionLocalized: { ptBR: "Cotação urgente para pigmentos e aditivos dispersantes", enUS: "Urgent quotation for pigments and dispersing additives" },
        status: "AWARDED",
        priority: "URGENT",
        createdById: "user-1",
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        requestedBy: "Carlos Lima",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "rfci-4",
        code: "RFCI-2024-004",
        title: "Catalisadores para Polimerização",
        titleLocalized: { ptBR: "Catalisadores para Polimerização", enUS: "Polymerization Catalysts" },
        description: "Solicitação de cotação para catalisadores utilizados no processo de polimerização",
        descriptionLocalized: { ptBR: "Solicitação de cotação para catalisadores utilizados no processo de polimerização", enUS: "Quotation request for catalysts used in the polymerization process" },
        status: "SENT",
        priority: "NORMAL",
        createdById: "user-1",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        requestedBy: "Maria Silva",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: "rfci-5",
        code: "RFCI-2024-005",
        title: "Aditivos para Tintas Automotivas",
        titleLocalized: { ptBR: "Aditivos para Tintas Automotivas", enUS: "Automotive Paint Additives" },
        description: "Cotação para linha premium de aditivos para tintas automotivas",
        descriptionLocalized: { ptBR: "Cotação para linha premium de aditivos para tintas automotivas", enUS: "Quotation for premium line of automotive paint additives" },
        status: "DRAFT",
        priority: "LOW",
        createdById: "user-1",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        requestDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
        requestedBy: "João Silva",
        createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
    rfcis.forEach(r => this.rfcis.set(r.id, r));

    // Seed RFCI Items (with localization)
    const rfciItems: LocalizedRfciItem[] = [
      { id: "rfci-item-1", rfciId: "rfci-1", productId: "prod-1", productName: "Acetona Industrial", productNameLocalized: { ptBR: "Acetona Industrial", enUS: "Industrial Acetone" }, quantity: "5000", unitPrice: "8.50", totalPrice: "42500.00", unitOfMeasure: "KG", specifications: "Pureza mínima 99.5%", specificationsLocalized: { ptBR: "Pureza mínima 99.5%", enUS: "Minimum purity 99.5%" } },
      { id: "rfci-item-2", rfciId: "rfci-1", productId: "prod-2", productName: "Tolueno P.A.", productNameLocalized: { ptBR: "Tolueno P.A.", enUS: "Analytical Grade Toluene" }, quantity: "2000", unitPrice: "12.00", totalPrice: "24000.00", unitOfMeasure: "L", specifications: "Grau analítico", specificationsLocalized: { ptBR: "Grau analítico", enUS: "Analytical grade" } },
      { id: "rfci-item-3", rfciId: "rfci-1", productId: "prod-6", productName: "Xileno Misto", productNameLocalized: { ptBR: "Xileno Misto", enUS: "Mixed Xylene" }, quantity: "3000", unitPrice: "6.17", totalPrice: "18500.00", unitOfMeasure: "L", specifications: null },
      { id: "rfci-item-4", rfciId: "rfci-2", productId: "prod-3", productName: "Resina Epóxi ER-100", productNameLocalized: { ptBR: "Resina Epóxi ER-100", enUS: "Epoxy Resin ER-100" }, quantity: "1000", unitPrice: "289.50", totalPrice: "289500.00", unitOfMeasure: "KG", specifications: "Viscosidade 500-700 cP", specificationsLocalized: { ptBR: "Viscosidade 500-700 cP", enUS: "Viscosity 500-700 cP" } },
      { id: "rfci-item-5", rfciId: "rfci-3", productId: "prod-5", productName: "Dióxido de Titânio TiO2", productNameLocalized: { ptBR: "Dióxido de Titânio TiO2", enUS: "Titanium Dioxide TiO2" }, quantity: "2000", unitPrice: "156.80", totalPrice: "313600.00", unitOfMeasure: "KG", specifications: "Rutilo, 93% min", specificationsLocalized: { ptBR: "Rutilo, 93% min", enUS: "Rutile, 93% min" } },
      { id: "rfci-item-6", rfciId: "rfci-3", productId: "prod-4", productName: "Agente Dispersante AD-50", productNameLocalized: { ptBR: "Agente Dispersante AD-50", enUS: "Dispersing Agent AD-50" }, quantity: "500", unitPrice: "152.75", totalPrice: "76375.00", unitOfMeasure: "KG", specifications: null },
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

    // Seed Quotations (with localization)
    const quotations: LocalizedQuotation[] = [
      {
        id: "quot-rfci-1-supplier-1",
        rfciId: "rfci-1",
        supplierId: "supplier-1",
        supplierName: "Química Brasil",
        status: "SUBMITTED",
        totalValue: "85000.00",
        deliveryDays: 15,
        paymentTerms: "30 DDL",
        paymentTermsLocalized: { ptBR: "30 DDL", enUS: "Net 30 Days" },
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Frete incluso para entregas acima de R$ 50.000",
        notesLocalized: { ptBR: "Frete incluso para entregas acima de R$ 50.000", enUS: "Freight included for deliveries over R$ 50,000" },
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "quot-rfci-1-supplier-2",
        rfciId: "rfci-1",
        supplierId: "supplier-2",
        supplierName: "InsuQuim",
        status: "SUBMITTED",
        totalValue: "92000.00",
        deliveryDays: 12,
        paymentTerms: "30/60 DDL",
        paymentTermsLocalized: { ptBR: "30/60 DDL", enUS: "Net 30/60 Days" },
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Entrega parcelada disponível",
        notesLocalized: { ptBR: "Entrega parcelada disponível", enUS: "Partial delivery available" },
        submittedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "quot-rfci-1-supplier-3",
        rfciId: "rfci-1",
        supplierId: "supplier-3",
        supplierName: "SolventTech",
        status: "SUBMITTED",
        totalValue: "78500.00",
        deliveryDays: 18,
        paymentTerms: "30 DDL",
        paymentTermsLocalized: { ptBR: "30 DDL", enUS: "Net 30 Days" },
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: "Preço especial para pedido em grandes volumes",
        notesLocalized: { ptBR: "Preço especial para pedido em grandes volumes", enUS: "Special price for large volume orders" },
        submittedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "quot-rfci-3-supplier-1",
        rfciId: "rfci-3",
        supplierId: "supplier-1",
        supplierName: "Química Brasil",
        status: "ACCEPTED",
        totalValue: "125000.00",
        deliveryDays: 10,
        paymentTerms: "30 DDL",
        paymentTermsLocalized: { ptBR: "30 DDL", enUS: "Net 30 Days" },
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: null,
        submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: "quot-rfci-3-supplier-4",
        rfciId: "rfci-3",
        supplierId: "supplier-4",
        supplierName: "PigSul",
        status: "REJECTED",
        totalValue: "138000.00",
        deliveryDays: 14,
        paymentTerms: "30/60 DDL",
        paymentTermsLocalized: { ptBR: "30/60 DDL", enUS: "Net 30/60 Days" },
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: null,
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
    quotations.forEach(q => this.quotations.set(q.id, q));

    // Seed Quotation Items
    const quotationItems: QuotationItem[] = [
      { id: "qi-1", quotationId: "quot-rfci-1-supplier-1", rfciItemId: "rfci-item-1", productName: "Acetona Industrial", quantity: "5000", currentStock: "3000", unitPrice: "8.50", totalPrice: "42500.00", currentDeliveryDays: 7, deliveryDays: 15 },
      { id: "qi-2", quotationId: "quot-rfci-1-supplier-1", rfciItemId: "rfci-item-2", productName: "Tolueno P.A.", quantity: "2000", currentStock: "1500", unitPrice: "12.00", totalPrice: "24000.00", currentDeliveryDays: 7, deliveryDays: 15 },
      { id: "qi-3", quotationId: "quot-rfci-1-supplier-1", rfciItemId: "rfci-item-3", productName: "Xileno Misto", quantity: "3000", currentStock: "2000", unitPrice: "6.17", totalPrice: "18500.00", currentDeliveryDays: 7, deliveryDays: 15 },
      { id: "qi-4", quotationId: "quot-rfci-1-supplier-2", rfciItemId: "rfci-item-1", productName: "Acetona Industrial", quantity: "5000", currentStock: "5000", unitPrice: "9.20", totalPrice: "46000.00", currentDeliveryDays: 0, deliveryDays: 12 },
      { id: "qi-5", quotationId: "quot-rfci-1-supplier-2", rfciItemId: "rfci-item-2", productName: "Tolueno P.A.", quantity: "2000", currentStock: "1800", unitPrice: "13.50", totalPrice: "27000.00", currentDeliveryDays: 5, deliveryDays: 12 },
      { id: "qi-6", quotationId: "quot-rfci-1-supplier-2", rfciItemId: "rfci-item-3", productName: "Xileno Misto", quantity: "3000", currentStock: "2500", unitPrice: "6.33", totalPrice: "19000.00", currentDeliveryDays: 5, deliveryDays: 12 },
      { id: "qi-7", quotationId: "quot-rfci-1-supplier-3", rfciItemId: "rfci-item-1", productName: "Acetona Industrial", quantity: "5000", currentStock: "2500", unitPrice: "7.90", totalPrice: "39500.00", currentDeliveryDays: 10, deliveryDays: 18 },
      { id: "qi-8", quotationId: "quot-rfci-1-supplier-3", rfciItemId: "rfci-item-2", productName: "Tolueno P.A.", quantity: "2000", currentStock: "1200", unitPrice: "11.25", totalPrice: "22500.00", currentDeliveryDays: 10, deliveryDays: 18 },
      { id: "qi-9", quotationId: "quot-rfci-1-supplier-3", rfciItemId: "rfci-item-3", productName: "Xileno Misto", quantity: "3000", currentStock: "1800", unitPrice: "5.50", totalPrice: "16500.00", currentDeliveryDays: 10, deliveryDays: 18 },
    ];
    quotationItems.forEach(qi => this.quotationItems.set(qi.id, qi));

    // Seed Supplier Documents (impressive demo data with various statuses)
    const now = new Date();
    const supplierDocuments: SupplierDocument[] = [
      // Química Brasil - mostly compliant
      {
        id: "doc-1",
        supplierId: "supplier-1",
        documentType: "CNPJ_CARD",
        documentTypeName: "Cartão CNPJ",
        documentTypeNameLocalized: { ptBR: "Cartão CNPJ", enUS: "CNPJ Card" },
        fileName: "cartao_cnpj_quimica_brasil.pdf",
        fileSize: 245000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        expiresAt: null,
        status: "VALID",
        notes: "Documento sem validade",
        notesLocalized: { ptBR: "Documento sem validade", enUS: "Document does not expire" },
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: true,
      },
      {
        id: "doc-2",
        supplierId: "supplier-1",
        documentType: "ISO_CERTIFICATE",
        documentTypeName: "Certificado ISO 9001",
        documentTypeNameLocalized: { ptBR: "Certificado ISO 9001", enUS: "ISO 9001 Certificate" },
        fileName: "iso_9001_quimica_brasil.pdf",
        fileSize: 1240000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: "Certificação válida até setembro/2025",
        notesLocalized: { ptBR: "Certificação válida até setembro/2025", enUS: "Certification valid until September/2025" },
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: true,
      },
      {
        id: "doc-3",
        supplierId: "supplier-1",
        documentType: "ENVIRONMENTAL_LICENSE",
        documentTypeName: "Licença Ambiental",
        documentTypeNameLocalized: { ptBR: "Licença Ambiental", enUS: "Environmental License" },
        fileName: "licenca_ambiental_2024.pdf",
        fileSize: 3450000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        status: "EXPIRING_SOON",
        notes: "Renovação em andamento junto à CETESB",
        notesLocalized: { ptBR: "Renovação em andamento junto à CETESB", enUS: "Renewal in progress with CETESB" },
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: true,
      },
      {
        id: "doc-4",
        supplierId: "supplier-1",
        documentType: "TAX_CLEARANCE_FEDERAL",
        documentTypeName: "CND Federal",
        documentTypeNameLocalized: { ptBR: "CND Federal", enUS: "Federal Tax Clearance" },
        fileName: "cnd_federal_dez2024.pdf",
        fileSize: 185000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 165 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: null,
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: true,
      },
      {
        id: "doc-5",
        supplierId: "supplier-1",
        documentType: "FGTS_CLEARANCE",
        documentTypeName: "CRF - FGTS",
        documentTypeNameLocalized: { ptBR: "CRF - FGTS", enUS: "FGTS Clearance Certificate" },
        fileName: "crf_fgts_dez2024.pdf",
        fileSize: 156000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        status: "EXPIRING_SOON",
        notes: "Renovar antes do vencimento",
        notesLocalized: { ptBR: "Renovar antes do vencimento", enUS: "Renew before expiration" },
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: true,
      },
      {
        id: "doc-6",
        supplierId: "supplier-1",
        documentType: "FIRE_BRIGADE_LICENSE",
        documentTypeName: "AVCB",
        documentTypeNameLocalized: { ptBR: "AVCB", enUS: "Fire Brigade Certificate" },
        fileName: "avcb_2023.pdf",
        fileSize: 2340000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        status: "EXPIRED",
        notes: "URGENTE: Documento vencido, aguardando renovação",
        notesLocalized: { ptBR: "URGENTE: Documento vencido, aguardando renovação", enUS: "URGENT: Expired document, awaiting renewal" },
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: true,
      },
      {
        id: "doc-7",
        supplierId: "supplier-1",
        documentType: "INSURANCE_POLICY",
        documentTypeName: "Apólice de Seguro RC",
        documentTypeNameLocalized: { ptBR: "Apólice de Seguro RC", enUS: "Liability Insurance Policy" },
        fileName: "apolice_rc_2025.pdf",
        fileSize: 4500000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: "Cobertura de R$ 5 milhões",
        notesLocalized: { ptBR: "Cobertura de R$ 5 milhões", enUS: "Coverage of R$ 5 million" },
        uploadedById: "user-2",
        uploadedByName: "Roberto Costa",
        isRequired: false,
      },

      // InsuQuim - good standing
      {
        id: "doc-8",
        supplierId: "supplier-2",
        documentType: "CNPJ_CARD",
        documentTypeName: "Cartão CNPJ",
        documentTypeNameLocalized: { ptBR: "Cartão CNPJ", enUS: "CNPJ Card" },
        fileName: "cnpj_insuquim.pdf",
        fileSize: 198000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
        expiresAt: null,
        status: "VALID",
        notes: null,
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-9",
        supplierId: "supplier-2",
        documentType: "ISO_CERTIFICATE",
        documentTypeName: "Certificado ISO 14001",
        documentTypeNameLocalized: { ptBR: "Certificado ISO 14001", enUS: "ISO 14001 Certificate" },
        fileName: "iso_14001_insuquim.pdf",
        fileSize: 1890000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 320 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: "Certificação ambiental ISO 14001:2015",
        notesLocalized: { ptBR: "Certificação ambiental ISO 14001:2015", enUS: "Environmental certification ISO 14001:2015" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-10",
        supplierId: "supplier-2",
        documentType: "TAX_CLEARANCE_FEDERAL",
        documentTypeName: "CND Federal",
        documentTypeNameLocalized: { ptBR: "CND Federal", enUS: "Federal Tax Clearance" },
        fileName: "cnd_federal_insuquim.pdf",
        fileSize: 175000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 175 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: null,
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-11",
        supplierId: "supplier-2",
        documentType: "SOCIAL_CONTRACT",
        documentTypeName: "Contrato Social",
        documentTypeNameLocalized: { ptBR: "Contrato Social", enUS: "Articles of Association" },
        fileName: "contrato_social_insuquim_consolidado.pdf",
        fileSize: 3200000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        expiresAt: null,
        status: "VALID",
        notes: "Última alteração: 15ª alteração contratual",
        notesLocalized: { ptBR: "Última alteração: 15ª alteração contratual", enUS: "Last amendment: 15th contractual amendment" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },

      // SolventTech - pending review
      {
        id: "doc-12",
        supplierId: "supplier-3",
        documentType: "CNPJ_CARD",
        documentTypeName: "Cartão CNPJ",
        documentTypeNameLocalized: { ptBR: "Cartão CNPJ", enUS: "CNPJ Card" },
        fileName: "cnpj_solventtech.pdf",
        fileSize: 210000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: null,
        status: "PENDING_REVIEW",
        notes: "Aguardando validação pelo comprador",
        notesLocalized: { ptBR: "Aguardando validação pelo comprador", enUS: "Awaiting validation by buyer" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-13",
        supplierId: "supplier-3",
        documentType: "OPERATING_LICENSE",
        documentTypeName: "Alvará de Funcionamento",
        documentTypeNameLocalized: { ptBR: "Alvará de Funcionamento", enUS: "Operating License" },
        fileName: "alvara_solventtech_2024.pdf",
        fileSize: 890000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        status: "PENDING_REVIEW",
        notes: "Documento recém enviado",
        notesLocalized: { ptBR: "Documento recém enviado", enUS: "Recently submitted document" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },

      // PigSul - some issues
      {
        id: "doc-14",
        supplierId: "supplier-4",
        documentType: "CNPJ_CARD",
        documentTypeName: "Cartão CNPJ",
        documentTypeNameLocalized: { ptBR: "Cartão CNPJ", enUS: "CNPJ Card" },
        fileName: "cnpj_pigsul.pdf",
        fileSize: 195000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000),
        expiresAt: null,
        status: "VALID",
        notes: null,
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-15",
        supplierId: "supplier-4",
        documentType: "TAX_CLEARANCE_STATE",
        documentTypeName: "CND Estadual",
        documentTypeNameLocalized: { ptBR: "CND Estadual", enUS: "State Tax Clearance" },
        fileName: "cnd_estadual_pigsul.pdf",
        fileSize: 167000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: "EXPIRED",
        notes: "Documento vencido - solicitar atualização",
        notesLocalized: { ptBR: "Documento vencido - solicitar atualização", enUS: "Expired document - request update" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-16",
        supplierId: "supplier-4",
        documentType: "LABOR_CLEARANCE",
        documentTypeName: "CNDT - Trabalhista",
        documentTypeNameLocalized: { ptBR: "CNDT - Trabalhista", enUS: "Labor Clearance Certificate" },
        fileName: "cndt_pigsul.pdf",
        fileSize: 145000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 172 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: null,
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },

      // ResinCorp
      {
        id: "doc-17",
        supplierId: "supplier-5",
        documentType: "CNPJ_CARD",
        documentTypeName: "Cartão CNPJ",
        documentTypeNameLocalized: { ptBR: "Cartão CNPJ", enUS: "CNPJ Card" },
        fileName: "cnpj_resincorp.pdf",
        fileSize: 205000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
        expiresAt: null,
        status: "VALID",
        notes: null,
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-18",
        supplierId: "supplier-5",
        documentType: "TECHNICAL_RESPONSIBILITY",
        documentTypeName: "ART - Responsabilidade Técnica",
        documentTypeNameLocalized: { ptBR: "ART - Responsabilidade Técnica", enUS: "Technical Responsibility Certificate" },
        fileName: "art_resincorp_2024.pdf",
        fileSize: 567000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 285 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: "Eng. Químico Responsável: Dr. Carlos Mendes",
        notesLocalized: { ptBR: "Eng. Químico Responsável: Dr. Carlos Mendes", enUS: "Responsible Chemical Eng.: Dr. Carlos Mendes" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: true,
      },
      {
        id: "doc-19",
        supplierId: "supplier-5",
        documentType: "FINANCIAL_STATEMENT",
        documentTypeName: "Balanço Patrimonial",
        documentTypeNameLocalized: { ptBR: "Balanço Patrimonial", enUS: "Financial Statement" },
        fileName: "balanco_2023_resincorp.pdf",
        fileSize: 4890000,
        mimeType: "application/pdf",
        uploadedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        status: "VALID",
        notes: "Exercício 2023 - Auditado por PwC",
        notesLocalized: { ptBR: "Exercício 2023 - Auditado por PwC", enUS: "FY 2023 - Audited by PwC" },
        uploadedById: "user-1",
        uploadedByName: "Maria Silva",
        isRequired: false,
      },
    ];
    supplierDocuments.forEach(d => this.supplierDocuments.set(d.id, d));
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
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      role: insertUser.role as any,
      phone: insertUser.phone || null,
      department: insertUser.department || null,
      supplierId: insertUser.supplierId || null,
    };
    this.users.set(id, user);
    return user;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).map(supplier => ({
      ...supplier,
      providers: typeof supplier.providers === 'string' ? JSON.parse(supplier.providers) : supplier.providers || []
    })).sort((a, b) => {
      const scoreA = a.performanceScore ? parseFloat(a.performanceScore) : 0;
      const scoreB = b.performanceScore ? parseFloat(b.performanceScore) : 0;
      return scoreB - scoreA;
    });
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    return {
      ...supplier,
      providers: typeof supplier.providers === 'string' ? JSON.parse(supplier.providers) : supplier.providers || []
    };
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      ...insertSupplier,
      id,
      createdAt: new Date(),
      status: insertSupplier.status as any,
      mainActivity: insertSupplier.mainActivity || null,
      performanceScore: insertSupplier.performanceScore || null,
      qualityScore: insertSupplier.qualityScore || null,
      deliveryScore: insertSupplier.deliveryScore || null,
      priceScore: insertSupplier.priceScore || null,
      providers: "[]",
    };
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

  // Quotations
  async getQuotationItems(): Promise<QuotationItem[]> {
    return Array.from(this.quotationItems.values());
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
    const quotations: QuotationWithItems[] = Array.from(this.quotations.values())
      .filter(q => q.rfciId === id)
      .map(q => ({
        ...q,
        items: Array.from(this.quotationItems.values()).filter(qi => qi.quotationId === q.id),
      } as QuotationWithItems));
    const createdBy = this.users.get(rfci.createdById);

    return {
      ...rfci,
      items,
      suppliers: rfciSuppliers,
      quotations,
      createdBy,
    };
  }

  async createRfci(
    rfciData: InsertRfci,
    items: Array<
      InsertRfciItem & {
        preco?: number | string;
        proposta?: number | string;
        unitPrice?: number | string;
        totalPrice?: number | string;
      }
    >,
    supplierIds: string[]
  ): Promise<Rfci> {
    const id = randomUUID();
    const code = `RFCI-2024-${String(this.rfcis.size + 1).padStart(3, '0')}`;

    const rfci: Rfci = {
      ...rfciData,
      id,
      code,
      status: "SENT",
      createdAt: new Date(),
      updatedAt: new Date(),
      description: rfciData.description || null,
      priority: rfciData.priority as any,
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
        unitPrice: item.preco ? String(item.preco) : item.unitPrice ? String(item.unitPrice) : null,
        totalPrice: item.proposta ? String(item.proposta) : item.totalPrice ? String(item.totalPrice) : null,
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
        status: "SUBMITTED" as const,
        submittedAt: new Date(),
        createdAt: new Date(),
        totalValue: quotationData.totalValue || null,
        deliveryDays: quotationData.deliveryDays || null,
        paymentTerms: quotationData.paymentTerms || null,
        validUntil: quotationData.validUntil || null,
        notes: quotationData.notes || null,
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
        currentStock: item.currentStock || null,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        currentDeliveryDays: item.currentDeliveryDays || null,
        deliveryDays: item.deliveryDays || null,
      };
      this.quotationItems.set(itemId, quotationItem);
    });

    // Update RFCI status if needed
    const rfci = this.rfcis.get(quotationData.rfciId);
    if (rfci && rfci.status === "SENT") {
      rfci.status = "IN_QUOTATION" as const;
      this.rfcis.set(rfci.id, rfci);
    }

    return quotation!;
  }

  // Supplier Portal
  async getPendingRfcisForSupplier(supplierId: string): Promise<Rfci[]> {
    const matchesSupplierId = (value: string) =>
      value === supplierId || value.startsWith(`${supplierId}:`);

    // Get all RFCI IDs where this supplier was invited
    const supplierRfciIds = Array.from(this.rfciSuppliers.values())
      .filter(rs => matchesSupplierId(rs.supplierId))
      .map(rs => rs.rfciId);

    // Get RFCI IDs where this supplier already submitted a quotation
    const submittedQuotationRfciIds = Array.from(this.quotations.values())
      .filter(q => matchesSupplierId(q.supplierId) && q.status !== "PENDING")
      .map(q => q.rfciId);

    // Return RFCIs where supplier was invited but hasn't submitted yet
    return Array.from(this.rfcis.values())
      .filter(r =>
        supplierRfciIds.includes(r.id) &&
        !submittedQuotationRfciIds.includes(r.id) &&
        (r.status === "SENT" || r.status === "IN_QUOTATION")
      )
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  async getRfciTotalValues(): Promise<Record<string, number>> {
    const totals: Record<string, number> = {};

    Array.from(this.rfciItems.values()).forEach((item) => {
      const qty = item.quantity ? parseFloat(String(item.quantity)) : 0;
      const unitPrice = item.unitPrice ? parseFloat(String(item.unitPrice)) : 0;
      const totalPrice = item.totalPrice ? parseFloat(String(item.totalPrice)) : 0;
      const value = totalPrice > 0 ? totalPrice : qty * unitPrice;

      if (!totals[item.rfciId]) {
        totals[item.rfciId] = 0;
      }
      totals[item.rfciId] += value;
    });

    return totals;
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

  // Supplier Documents
  async getSupplierDocuments(supplierId: string): Promise<SupplierDocument[]> {
    return Array.from(this.supplierDocuments.values())
      .filter(d => d.supplierId === supplierId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async getAllSupplierDocuments(): Promise<SupplierDocument[]> {
    return Array.from(this.supplierDocuments.values())
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async getSupplierDocumentStats(supplierId?: string): Promise<SupplierDocumentStats> {
    let docs = Array.from(this.supplierDocuments.values());
    if (supplierId) {
      docs = docs.filter(d => d.supplierId === supplierId);
    }

    const total = docs.length;
    const valid = docs.filter(d => d.status === "VALID").length;
    const expiringSoon = docs.filter(d => d.status === "EXPIRING_SOON").length;
    const expired = docs.filter(d => d.status === "EXPIRED").length;
    const pendingReview = docs.filter(d => d.status === "PENDING_REVIEW").length;
    const requiredDocs = docs.filter(d => d.isRequired);
    const validRequired = requiredDocs.filter(d => d.status === "VALID" || d.status === "EXPIRING_SOON").length;
    const complianceRate = requiredDocs.length > 0 ? (validRequired / requiredDocs.length) * 100 : 100;

    return { total, valid, expiringSoon, expired, pendingReview, complianceRate };
  }

  async getExpiringDocuments(days: number): Promise<SupplierDocument[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return Array.from(this.supplierDocuments.values())
      .filter(d => {
        if (!d.expiresAt) return false;
        const expDate = new Date(d.expiresAt);
        return expDate > now && expDate <= futureDate;
      })
      .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());
  }
}

export const storage = new MemStorage();

