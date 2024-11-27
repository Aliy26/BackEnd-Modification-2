import { registerEnumType } from "@nestjs/graphql";

export enum ProductType {
  FURNITURE = "FURNITURE",
  APPLIANCES = "APPLIANCES",
}
registerEnumType(ProductType, {
  name: "productType",
});

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  DELETE = "DELETE",
}
registerEnumType(ProductStatus, {
  name: "ProductStatus",
});

export enum ProductBrand {
  BOSCH = "BOSCH",
  SAMSUNG = "SAMSUNG",
  LG = "LG",
  IKEA = "IKEA",
  TARGET = "TARGET",
}
registerEnumType(ProductBrand, {
  name: "ProductBrand",
});

export enum ProductCategory {
  LivingRoom = "Living Room",
  Bedroom = "Bedroom",
  Kitchen = "Kitchen",
  Work = "Work",
  Kids = "Kids",
  Appliances = "Appliances",
  Pet = "Pet",
  Outdoors = "Outdoors",
}
registerEnumType(ProductCategory, {
  name: "productCategory",
});
