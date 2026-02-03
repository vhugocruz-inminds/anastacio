import { pgTable, text, varchar, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const UserRole = {
  ADMIN: "ADMIN",
  BUYER: "BUYER",
  BUYER_MANAGER: "BUYER_MANAGER",
  SUPPLIER: "SUPPLIER",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const SupplierStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type SupplierStatusType = typeof SupplierStatus[keyof typeof SupplierStatus];

export const RFCIStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  IN_QUOTATION: "IN_QUOTATION",
  QUOTATION_CLOSED: "QUOTATION_CLOSED",
  AWARDED: "AWARDED",
  CANCELLED: "CANCELLED",
} as const;

export type RFCIStatusType = typeof RFCIStatus[keyof typeof RFCIStatus];

export const QuotationStatus = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;

export type QuotationStatusType = typeof QuotationStatus[keyof typeof QuotationStatus];

export const RequisitionPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type RequisitionPriorityType = typeof RequisitionPriority[keyof typeof RequisitionPriority];

// ============================================
// TABLES
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().$type<UserRoleType>(),
  phone: text("phone"),
  department: text("department"),
  supplierId: varchar("supplier_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  legalName: text("legal_name").notNull(),
  tradeName: text("trade_name").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().$type<SupplierStatusType>(),
  addressCity: text("address_city").notNull(),
  addressState: text("address_state").notNull(),
  mainActivity: text("main_activity"),
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  deliveryScore: decimal("delivery_score", { precision: 5, scale: 2 }),
  priceScore: decimal("price_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  ncmCode: text("ncm_code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfcis = pgTable("rfcis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().$type<RFCIStatusType>(),
  priority: text("priority").notNull().$type<RequisitionPriorityType>(),
  createdById: varchar("created_by_id").notNull(),
  deadline: timestamp("deadline").notNull(),
  requestDate: timestamp("request_date").notNull(),
  requestedBy: text("requested_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfciItems = pgTable("rfci_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfciId: varchar("rfci_id").notNull(),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  specifications: text("specifications"),
});

export const rfciSuppliers = pgTable("rfci_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfciId: varchar("rfci_id").notNull(),
  supplierId: varchar("supplier_id").notNull(),
  invitedAt: timestamp("invited_at").defaultNow(),
});

export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfciId: varchar("rfci_id").notNull(),
  supplierId: varchar("supplier_id").notNull(),
  supplierName: text("supplier_name").notNull(),
  status: text("status").notNull().$type<QuotationStatusType>(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  deliveryDays: integer("delivery_days"),
  paymentTerms: text("payment_terms"),
  validUntil: timestamp("valid_until"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quotationItems = pgTable("quotation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").notNull(),
  rfciItemId: varchar("rfci_item_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 4 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  deliveryDays: integer("delivery_days"),
});

// ============================================
// INSERT SCHEMAS
// ============================================

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertRfciSchema = createInsertSchema(rfcis).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRfciItemSchema = createInsertSchema(rfciItems).omit({ id: true });
export const insertRfciSupplierSchema = createInsertSchema(rfciSuppliers).omit({ id: true, invitedAt: true });
export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true });
export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({ id: true });

// ============================================
// TYPES
// ============================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertRfci = z.infer<typeof insertRfciSchema>;
export type Rfci = typeof rfcis.$inferSelect;

export type InsertRfciItem = z.infer<typeof insertRfciItemSchema>;
export type RfciItem = typeof rfciItems.$inferSelect;

export type InsertRfciSupplier = z.infer<typeof insertRfciSupplierSchema>;
export type RfciSupplier = typeof rfciSuppliers.$inferSelect;

export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;
export type QuotationItem = typeof quotationItems.$inferSelect;

// ============================================
// LOCALIZATION TYPES
// ============================================

export interface LocalizedText {
  ptBR: string;
  enUS: string;
}

// Extended types with optional localization fields
export interface LocalizedSupplier extends Supplier {
  mainActivityLocalized?: LocalizedText;
}

export interface LocalizedProduct extends Product {
  nameLocalized?: LocalizedText;
  descriptionLocalized?: LocalizedText;
  categoryLocalized?: LocalizedText;
}

export interface LocalizedRfci extends Rfci {
  titleLocalized?: LocalizedText;
  descriptionLocalized?: LocalizedText;
}

export interface LocalizedRfciItem extends RfciItem {
  productNameLocalized?: LocalizedText;
  specificationsLocalized?: LocalizedText;
}

export interface LocalizedQuotation extends Quotation {
  paymentTermsLocalized?: LocalizedText;
  notesLocalized?: LocalizedText;
}

// ============================================
// EXTENDED TYPES FOR FRONTEND
// ============================================

export interface RfciWithDetails extends LocalizedRfci {
  items: LocalizedRfciItem[];
  suppliers: (RfciSupplier & { supplier?: LocalizedSupplier })[];
  quotations: LocalizedQuotation[];
  createdBy?: User;
}

export interface QuotationWithItems extends LocalizedQuotation {
  items: QuotationItem[];
  supplier?: LocalizedSupplier;
  rfci?: LocalizedRfci;
}

export interface DashboardStats {
  totalSuppliers: number;
  approvedSuppliers: number;
  activeRfcis: number;
  pendingQuotations: number;
  totalSavings: number;
  avgLeadTime: number;
}

export interface SupplierDashboardStats {
  activeRfcis: number;
  pendingQuotations: number;
  submittedQuotations: number;
  wonQuotations: number;
  winRate: number;
  avgResponseTime: number;
}

// ============================================
// SUPPLIER DOCUMENTS
// ============================================

export const DocumentStatus = {
  VALID: "VALID",
  EXPIRING_SOON: "EXPIRING_SOON",
  EXPIRED: "EXPIRED",
  PENDING_REVIEW: "PENDING_REVIEW",
} as const;

export type DocumentStatusType = typeof DocumentStatus[keyof typeof DocumentStatus];

export const DocumentType = {
  CNPJ_CARD: "CNPJ_CARD",
  STATE_REGISTRATION: "STATE_REGISTRATION",
  OPERATING_LICENSE: "OPERATING_LICENSE",
  ISO_CERTIFICATE: "ISO_CERTIFICATE",
  ENVIRONMENTAL_LICENSE: "ENVIRONMENTAL_LICENSE",
  FIRE_BRIGADE_LICENSE: "FIRE_BRIGADE_LICENSE",
  TECHNICAL_RESPONSIBILITY: "TECHNICAL_RESPONSIBILITY",
  FINANCIAL_STATEMENT: "FINANCIAL_STATEMENT",
  TAX_CLEARANCE_FEDERAL: "TAX_CLEARANCE_FEDERAL",
  TAX_CLEARANCE_STATE: "TAX_CLEARANCE_STATE",
  TAX_CLEARANCE_MUNICIPAL: "TAX_CLEARANCE_MUNICIPAL",
  FGTS_CLEARANCE: "FGTS_CLEARANCE",
  LABOR_CLEARANCE: "LABOR_CLEARANCE",
  SOCIAL_CONTRACT: "SOCIAL_CONTRACT",
  POWER_OF_ATTORNEY: "POWER_OF_ATTORNEY",
  INSURANCE_POLICY: "INSURANCE_POLICY",
  OTHER: "OTHER",
} as const;

export type DocumentTypeType = typeof DocumentType[keyof typeof DocumentType];

export interface SupplierDocument {
  id: string;
  supplierId: string;
  documentType: DocumentTypeType;
  documentTypeName: string;
  documentTypeNameLocalized?: LocalizedText;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt: Date | null;
  status: DocumentStatusType;
  notes?: string | null;
  notesLocalized?: LocalizedText;
  uploadedById: string;
  uploadedByName?: string;
  isRequired: boolean;
}

export interface SupplierDocumentStats {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  pendingReview: number;
  complianceRate: number;
}
