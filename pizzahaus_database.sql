CREATE DATABASE IF NOT EXISTS pizzahaus_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pizzahaus_db;

CREATE TABLE IF NOT EXISTS Store (
  StoreID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreName VARCHAR(120) NOT NULL,
  Location VARCHAR(255) NOT NULL,
  OperatingHours VARCHAR(120) NOT NULL,
  ManagerName VARCHAR(120) NOT NULL,
  PRIMARY KEY (StoreID)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Supplier (
  SupplierID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  SupplierName VARCHAR(120) NOT NULL,
  ContactInfo VARCHAR(150),
  Address VARCHAR(255),
  PRIMARY KEY (SupplierID)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MenuItem (
  MenuItemID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ItemName VARCHAR(120) NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (MenuItemID)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Ingredient (
  IngredientID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  IngredientName VARCHAR(120) NOT NULL,
  UnitMeasure VARCHAR(40) NOT NULL,
  CurrentStock DECIMAL(10,2) NOT NULL DEFAULT 0,
  ReorderLevel DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (IngredientID)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CustomerOrder (
  OrderID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreID INT UNSIGNED NOT NULL,
  CustomerName VARCHAR(120) NOT NULL,
  ContactNumber VARCHAR(40) NOT NULL,
  PickupMethod VARCHAR(40) NOT NULL,
  OrderDateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (OrderID),
  INDEX idx_customerorder_store (StoreID),
  CONSTRAINT fk_customerorder_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS OrderDetails (
  OrderDetailID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  OrderID INT UNSIGNED NOT NULL,
  MenuItemID INT UNSIGNED NOT NULL,
  Quantity INT UNSIGNED NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (OrderDetailID),
  INDEX idx_orderdetails_order (OrderID),
  INDEX idx_orderdetails_menuitem (MenuItemID),
  CONSTRAINT fk_orderdetails_order
    FOREIGN KEY (OrderID) REFERENCES CustomerOrder (OrderID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orderdetails_menuitem
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem (MenuItemID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS QualityIssue (
  IssueID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  OrderID INT UNSIGNED NOT NULL,
  Description TEXT NOT NULL,
  DateReported DATE NOT NULL,
  ResolutionStatus VARCHAR(60) NOT NULL,
  PRIMARY KEY (IssueID),
  INDEX idx_qualityissue_order (OrderID),
  CONSTRAINT fk_qualityissue_order
    FOREIGN KEY (OrderID) REFERENCES CustomerOrder (OrderID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Delivery (
  DeliveryID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  SupplierID INT UNSIGNED NOT NULL,
  StoreID INT UNSIGNED NOT NULL,
  DeliveryDate DATE NOT NULL,
  TotalQuantity DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (DeliveryID),
  INDEX idx_delivery_supplier (SupplierID),
  INDEX idx_delivery_store (StoreID),
  CONSTRAINT fk_delivery_supplier
    FOREIGN KEY (SupplierID) REFERENCES Supplier (SupplierID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS InventoryTransaction (
  TransactionID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  IngredientID INT UNSIGNED NOT NULL,
  DeliveryID INT UNSIGNED NULL,
  OrderID INT UNSIGNED NULL,
  TransactionType VARCHAR(40) NOT NULL,
  Quantity DECIMAL(10,2) NOT NULL,
  TransactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (TransactionID),
  INDEX idx_inventory_ingredient (IngredientID),
  INDEX idx_inventory_delivery (DeliveryID),
  INDEX idx_inventory_order (OrderID),
  CONSTRAINT fk_inventory_ingredient
    FOREIGN KEY (IngredientID) REFERENCES Ingredient (IngredientID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_delivery
    FOREIGN KEY (DeliveryID) REFERENCES Delivery (DeliveryID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_order
    FOREIGN KEY (OrderID) REFERENCES CustomerOrder (OrderID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DailyReport (
  ReportID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreID INT UNSIGNED NOT NULL,
  SupplierID INT UNSIGNED NOT NULL,
  ReportDate DATE NOT NULL,
  TotalSales DECIMAL(12,2) NOT NULL DEFAULT 0,
  TotalOrders INT UNSIGNED NOT NULL DEFAULT 0,
  IngredientUsageSummary TEXT,
  PRIMARY KEY (ReportID),
  INDEX idx_dailyreport_store (StoreID),
  INDEX idx_dailyreport_supplier (SupplierID),
  CONSTRAINT fk_dailyreport_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_dailyreport_supplier
    FOREIGN KEY (SupplierID) REFERENCES Supplier (SupplierID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS RecipeIngredient (
  MenuItemID INT UNSIGNED NOT NULL,
  IngredientID INT UNSIGNED NOT NULL,
  QuantityRequired DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (MenuItemID, IngredientID),
  INDEX idx_recipeingredient_ingredient (IngredientID),
  CONSTRAINT fk_recipeingredient_menuitem
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem (MenuItemID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_recipeingredient_ingredient
    FOREIGN KEY (IngredientID) REFERENCES Ingredient (IngredientID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;