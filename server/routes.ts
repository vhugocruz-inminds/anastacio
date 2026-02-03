import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { InsertRfci } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In demo mode, accept any password
      res.json({ user, token: "demo-token" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Supplier dashboard stats
  app.get("/api/supplier/dashboard/stats", async (req, res) => {
    try {
      // In real app, get from session. For demo, use supplier-1
      const supplierId = "supplier-1";
      const stats = await storage.getSupplierDashboardStats(supplierId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (_req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Products routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // RFCIs routes
  app.get("/api/rfcis", async (_req, res) => {
    try {
      const rfcis = await storage.getRfcis();
      res.json(rfcis);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rfcis/:id", async (req, res) => {
    try {
      const rfci = await storage.getRfciWithDetails(req.params.id);
      if (!rfci) {
        return res.status(404).json({ error: "RFCI not found" });
      }
      res.json(rfci);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/debug/quotation-items", async (_req, res) => {
    try {
      // Debug endpoint to check if quotation items exist
      const quotationItems = await storage.getQuotationItems();
      res.json(quotationItems);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rfcis", async (req, res) => {
    try {
      const { title, description, priority, deadline, requestDate, requestedBy, items, selectedProviders } = req.body;
      
      // Validate required fields
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Title is required" });
      }
      if (!deadline) {
        return res.status(400).json({ error: "Deadline is required" });
      }
      if (!requestDate) {
        return res.status(400).json({ error: "Request date is required" });
      }
      if (!requestedBy || typeof requestedBy !== "string" || requestedBy.trim().length === 0) {
        return res.status(400).json({ error: "Requested by is required" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }
      if (!selectedProviders || !Array.isArray(selectedProviders) || selectedProviders.length === 0) {
        return res.status(400).json({ error: "At least one provider must be selected" });
      }

      const supplierIds = Array.from(
        new Set(
          selectedProviders
            .map((provider: string) => (typeof provider === "string" ? provider.split(":")[0] : ""))
            .filter((supplierId: string) => supplierId)
        )
      );

      if (supplierIds.length === 0) {
        return res.status(400).json({ error: "At least one supplier must be selected" });
      }

      const rfciData = {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "NORMAL",
        deadline: new Date(deadline),
        requestDate: new Date(requestDate),
        requestedBy: requestedBy.trim(),
        code: "", // Will be generated in storage
        status: "SENT" as const,
        createdById: "user-1",
      };

      const rfci = await storage.createRfci(rfciData as any, items || [], supplierIds);
      res.status(201).json(rfci);
    } catch (error) {
      console.error("Error creating RFCI:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rfcis/:id/award", async (req, res) => {
    try {
      const { quotationId } = req.body;
      await storage.awardRfci(req.params.id, quotationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Quotations routes
  app.get("/api/rfcis/:id/quotations", async (req, res) => {
    try {
      const quotations = await storage.getQuotationsByRfci(req.params.id);
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rfcis/:rfciId/quotations", async (req, res) => {
    try {
      const rfciId = req.params.rfciId;
      const { items, paymentTerms, validUntil, notes } = req.body;
      
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items are required" });
      }

      // Validate each item has required fields
      for (const item of items) {
        if (!item.rfciItemId || !item.productName || !item.quantity || !item.unitPrice) {
          return res.status(400).json({ error: "Each item must have rfciItemId, productName, quantity, and unitPrice" });
        }
        if (isNaN(parseFloat(item.unitPrice)) || parseFloat(item.unitPrice) <= 0) {
          return res.status(400).json({ error: "Unit price must be a positive number" });
        }
      }
      
      // For demo, use supplier-1
      const supplierId = "supplier-1";
      const supplier = await storage.getSupplier(supplierId);

      // Server-side calculation of totals (never trust client-side totals)
      let totalValue = 0;
      let maxDeliveryDays = 0;
      
      const quotationItems = items.map((item: any) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unitPrice) || 0;
        const total = qty * price;
        totalValue += total;
        
        const itemDeliveryDays = item.deliveryDays ? parseInt(item.deliveryDays) : 0;
        if (itemDeliveryDays > maxDeliveryDays) {
          maxDeliveryDays = itemDeliveryDays;
        }
        
        const currentStock = item.currentStock ? parseFloat(item.currentStock) : 0;
        const currentDeliveryDays = item.currentDeliveryDays ? parseInt(item.currentDeliveryDays) : null;
        
        return {
          rfciItemId: item.rfciItemId,
          productName: item.productName,
          quantity: String(qty),
          unitPrice: String(price),
          totalPrice: String(total.toFixed(2)),
          currentStock: currentStock ? String(currentStock) : null,
          currentDeliveryDays: currentDeliveryDays,
          deliveryDays: itemDeliveryDays || null,
          quotationId: "temp", // Temporary ID, will be replaced by storage
        };
      });

      const quotationData = {
        rfciId,
        supplierId,
        supplierName: supplier?.tradeName || "Fornecedor",
        status: "SUBMITTED" as const,
        totalValue: totalValue.toFixed(2),
        deliveryDays: maxDeliveryDays || null,
        paymentTerms: paymentTerms || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes: notes || null,
        submittedAt: new Date(),
      };

      const quotation = await storage.createQuotation(quotationData, quotationItems);
      res.status(201).json(quotation);
    } catch (error) {
      console.error("Error creating quotation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Supplier portal routes
  app.get("/api/supplier/rfcis/pending", async (_req, res) => {
    try {
      // For demo, use supplier-1
      const supplierId = "supplier-1";
      const rfcis = await storage.getPendingRfcisForSupplier(supplierId);
      res.json(rfcis);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/supplier/quotations", async (_req, res) => {
    try {
      // For demo, use supplier-1
      const supplierId = "supplier-1";
      const quotations = await storage.getQuotationsBySupplierId(supplierId);
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/supplier/quotations/recent", async (_req, res) => {
    try {
      // For demo, use supplier-1
      const supplierId = "supplier-1";
      const quotations = await storage.getQuotationsBySupplierId(supplierId);
      res.json(quotations.slice(0, 5));
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Supplier Documents routes
  app.get("/api/documents", async (_req, res) => {
    try {
      const documents = await storage.getAllSupplierDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/documents/stats", async (_req, res) => {
    try {
      const stats = await storage.getSupplierDocumentStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/documents/expiring", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const documents = await storage.getExpiringDocuments(days);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/suppliers/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getSupplierDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/suppliers/:id/documents/stats", async (req, res) => {
    try {
      const stats = await storage.getSupplierDocumentStats(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
