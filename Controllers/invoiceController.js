import * as invoiceService from "../services/invoiceService.js";

import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceIdSchema,
  invoiceListQuerySchema,
} from "../Validation/invoiceValidator.js";

function validate(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    throw error;
  }

  return result.data;
}

export async function createInvoice(req, res, next) {
  try {
    const data = validate(createInvoiceSchema, req.body);
    const invoice = await invoiceService.createInvoice(data);

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvoices(req, res, next) {
  try {
    const query = validate(invoiceListQuerySchema, req.query);
    const result = await invoiceService.getInvoices(query);

    return res.status(200).json({
      success: true,
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceById(req, res, next) {
  try {
    const { id } = validate(invoiceIdSchema, req.params);
    const invoice = await invoiceService.getInvoiceById(id);

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    const { id } = validate(invoiceIdSchema, req.params);
    const data = validate(updateInvoiceSchema, req.body);

    const invoice = await invoiceService.updateInvoice(id, data);

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteInvoice(req, res, next) {
  try {
    const { id } = validate(invoiceIdSchema, req.params);
    const result = await invoiceService.deleteInvoice(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
