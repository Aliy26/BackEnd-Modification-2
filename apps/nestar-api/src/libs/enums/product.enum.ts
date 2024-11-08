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
  SAMSUNG = "SAMSUNG",
  LG = "LG",
  CUCKOO = "CUCKOO",
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
  Lightning = "Lightning",
  Pillows = "Pillows",
}
registerEnumType(ProductCategory, {
  name: "productCategory",
});
