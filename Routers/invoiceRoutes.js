import { Router } from "express";

import * as invoiceController from "../controllers/invoiceController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticateToken);

router.post(
  "/",
  authorize("invoices.create"),
  invoiceController.createInvoice
);

router.get(
  "/",
  authorize("invoices.read"),
  invoiceController.getInvoices
);

router.get(
  "/:id",
  authorize("invoices.read"),
  invoiceController.getInvoiceById
);

router.patch(
  "/:id",
  authorize("invoices.update"),
  invoiceController.updateInvoice
);

router.delete(
  "/:id",
  authorize("invoices.delete"),
  invoiceController.deleteInvoice
);

export default router;
