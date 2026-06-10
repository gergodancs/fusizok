import { describe, expect, it } from "vitest";
import {
  getBidCreditCostForCategory,
  getBidCreditCostRange,
  getCategoriesGroupedByBidCost,
} from "@/lib/constants/categories";

describe("getBidCreditCostForCategory", () => {
  it("1.5 kredit: bútor, ezermester, takarítás", () => {
    expect(getBidCreditCostForCategory("butorosszeszereles")).toBe(1.5);
    expect(getBidCreditCostForCategory("ezermester")).toBe(1.5);
    expect(getBidCreditCostForCategory("takaritas")).toBe(1.5);
  });

  it("2.0 kredit: kert, szállítás", () => {
    expect(getBidCreditCostForCategory("kertgondozas")).toBe(2);
    expect(getBidCreditCostForCategory("szallitas")).toBe(2);
  });

  it("3.0 kredit: festés, villany, víz-gáz, klíma, asztalos", () => {
    expect(getBidCreditCostForCategory("festes_dekor")).toBe(3);
    expect(getBidCreditCostForCategory("villanyszereles")).toBe(3);
    expect(getBidCreditCostForCategory("viz_gaz")).toBe(3);
    expect(getBidCreditCostForCategory("klima")).toBe(3);
    expect(getBidCreditCostForCategory("asztalos")).toBe(3);
  });

  it("5.0 kredit: építőipar, lakatos", () => {
    expect(getBidCreditCostForCategory("epitoipar")).toBe(5);
    expect(getBidCreditCostForCategory("lakatos")).toBe(5);
  });

  it("régi kategórianév is működik", () => {
    expect(getBidCreditCostForCategory("Villanyszerelés")).toBe(3);
    expect(getBidCreditCostForCategory("Bútorösszeszerelés")).toBe(1.5);
  });
});

describe("getBidCreditCostRange", () => {
  it("1.5 és 5 között van a tartomány", () => {
    expect(getBidCreditCostRange()).toEqual({ min: 1.5, max: 5 });
  });
});

describe("getCategoriesGroupedByBidCost", () => {
  it("négy díjszintet ad vissza", () => {
    expect(getCategoriesGroupedByBidCost()).toHaveLength(4);
  });
});
