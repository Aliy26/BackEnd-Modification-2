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
  BUSAN = "BUSAN",
  INCHEON = "INCHEON",
  DAEGU = "DAEGU",
  GYEONGJU = "GYEONGJU",
  GWANGJU = "GWANGJU",
  CHONJU = "CHONJU",
  DAEJON = "DAEJON",
  JEJU = "JEJU",
}
registerEnumType(ProductCategory, {
  name: "productCategory",
});
