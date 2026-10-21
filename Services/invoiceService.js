import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

import * as invoiceRepository from "../repositories/invoiceRepository.js";

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function ensureReferencesExist(data) {
  if (data.userId) {
    const userExists = await User.exists({ _id: data.userId });

    if (!userExists) {
      throw createError("User not found", 404);
    }
  }

  if (data.courseId) {
    const courseExists = await Course.exists({ _id: data.courseId });

    if (!courseExists) {
      throw createError("Course not found", 404);
    }
  }
}

function handleDuplicateReceipt(error) {
  if (error?.code === 11000) {
    throw createError("Receipt number already exists", 409);
  }

  throw error;
}

export async function createInvoice(data) {
  await ensureReferencesExist(data);

  try {
    const invoice = await invoiceRepository.create(data);
    return invoice;
  } catch (error) {
    handleDuplicateReceipt(error);
  }
}

export async function getInvoices({ page, limit }) {
  const [invoices, total] = await Promise.all([
    invoiceRepository.findAll({ page, limit }),
    invoiceRepository.countAll(),
  ]);

  return {
    invoices,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getInvoiceById(id) {
  const invoice = await invoiceRepository.findById(id);

  if (!invoice) {
    throw createError("Invoice not found", 404);
  }

  return invoice;
}

export async function updateInvoice(id, data) {
  const existingInvoice = await invoiceRepository.findByIdForUpdate(id);

  if (!existingInvoice) {
    throw createError("Invoice not found", 404);
  }

  await ensureReferencesExist(data);

  try {
    const updatedInvoice = await invoiceRepository.updateById(id, data);

    if (!updatedInvoice) {
      throw createError("Invoice not found", 404);
    }

    return updatedInvoice;
  } catch (error) {
    handleDuplicateReceipt(error);
  }
}

export async function deleteInvoice(id) {
  const invoice = await invoiceRepository.deleteById(id);

  if (!invoice) {
    throw createError("Invoice not found", 404);
  }

  return { message: "Invoice deleted successfully" };
}
