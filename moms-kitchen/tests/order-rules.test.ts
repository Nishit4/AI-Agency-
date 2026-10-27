/**
 * Unit tests for business rules (run with `npm test`).
 * Covers the "Orders", "Cart" and "Reviews" rows of the project testing plan.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "../lib/constants";
import {
  allowedNextStatuses,
  calculateTotals,
  canReviewOrder,
  canTransition,
  generateOrderNumber,
  isActiveStatus,
} from "../lib/order-rules";

describe("cart totals", () => {
  it("is zero for an empty cart", () => {
    assert.deepEqual(calculateTotals([]), { subtotal: 0, deliveryFee: 0, totalAmount: 0 });
  });

  it("adds a delivery fee to small orders", () => {
    const totals = calculateTotals([
      { unitPrice: 90, quantity: 1 },
      { unitPrice: 60, quantity: 2 },
    ]);
    assert.equal(totals.subtotal, 210);
    assert.equal(totals.deliveryFee, DELIVERY_FEE);
    assert.equal(totals.totalAmount, 210 + DELIVERY_FEE);
  });

  it("gives free delivery at the threshold", () => {
    const totals = calculateTotals([{ unitPrice: FREE_DELIVERY_ABOVE, quantity: 1 }]);
    assert.equal(totals.deliveryFee, 0);
    assert.equal(totals.totalAmount, FREE_DELIVERY_ABOVE);
  });

  it("ignores negative or fractional quantities", () => {
    const totals = calculateTotals([
      { unitPrice: 100, quantity: -3 },
      { unitPrice: 50, quantity: 2.9 },
    ]);
    assert.equal(totals.subtotal, 100);
  });
});

describe("order status transitions", () => {
  it("lets a provider accept or reject a pending order", () => {
    assert.deepEqual(allowedNextStatuses("PENDING", "PROVIDER"), ["ACCEPTED", "REJECTED"]);
  });

  it("follows the happy path for providers", () => {
    assert.ok(canTransition("ACCEPTED", "PREPARING", "PROVIDER"));
    assert.ok(canTransition("PREPARING", "READY", "PROVIDER"));
    assert.ok(canTransition("READY", "OUT_FOR_DELIVERY", "PROVIDER"));
    assert.ok(canTransition("READY", "DELIVERED", "PROVIDER"));
    assert.ok(canTransition("OUT_FOR_DELIVERY", "DELIVERED", "PROVIDER"));
  });

  it("blocks skipping steps or going backwards", () => {
    assert.equal(canTransition("PENDING", "DELIVERED", "PROVIDER"), false);
    assert.equal(canTransition("PREPARING", "ACCEPTED", "PROVIDER"), false);
    assert.equal(canTransition("DELIVERED", "PREPARING", "PROVIDER"), false);
  });

  it("only lets customers cancel while pending", () => {
    assert.ok(canTransition("PENDING", "CANCELLED", "CUSTOMER"));
    assert.equal(canTransition("ACCEPTED", "CANCELLED", "CUSTOMER"), false);
    assert.equal(canTransition("PENDING", "ACCEPTED", "CUSTOMER"), false);
  });

  it("lets admins cancel any active order but not finished ones", () => {
    assert.ok(canTransition("PREPARING", "CANCELLED", "ADMIN"));
    assert.equal(canTransition("DELIVERED", "CANCELLED", "ADMIN"), false);
    assert.equal(canTransition("PREPARING", "CANCELLED", "PROVIDER"), false);
  });

  it("knows which statuses are active", () => {
    assert.ok(isActiveStatus("PENDING"));
    assert.ok(isActiveStatus("OUT_FOR_DELIVERY"));
    assert.equal(isActiveStatus("DELIVERED"), false);
    assert.equal(isActiveStatus("CANCELLED"), false);
  });
});

describe("reviews", () => {
  it("are allowed only once, after delivery", () => {
    assert.ok(canReviewOrder("DELIVERED", false));
    assert.equal(canReviewOrder("DELIVERED", true), false);
    assert.equal(canReviewOrder("PREPARING", false), false);
  });
});

describe("order numbers", () => {
  it("look like MK-YYMMDD-NNNN", () => {
    assert.match(generateOrderNumber(new Date(2026, 9, 27)), /^MK-261027-\d{4}$/);
  });
});
