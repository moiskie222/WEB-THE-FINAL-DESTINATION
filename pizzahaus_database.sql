DROP DATABASE IF EXISTS pizzahaus_db;

CREATE DATABASE pizzahaus_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pizzahaus_db;

CREATE TABLE Store (
  StoreID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreName VARCHAR(120) NOT NULL,
  Location VARCHAR(255) NOT NULL,
  OperatingHours VARCHAR(120) NOT NULL,
  ManagerName VARCHAR(120) NULL,
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (StoreID),
  UNIQUE KEY uq_store_name (StoreName)
) ENGINE=InnoDB;


  StaffID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreID INT UNSIGNED NULL,
  FullName VARCHAR(120) NOT NULL,
  Email VARCHAR(254) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  Role ENUM('admin', 'clerk') NOT NULL,
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (StaffID),
  UNIQUE KEY uq_staff_email (Email),
  KEY idx_staff_store (StoreID),
  CONSTRAINT chk_staff_clerk_store
    CHECK (Role <> 'clerk' OR StoreID IS NOT NULL),
  CONSTRAINT fk_staff_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Supplier (
  SupplierID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  SupplierName VARCHAR(120) NOT NULL,
  ContactInfo VARCHAR(150) NULL,
  Address VARCHAR(255) NULL,
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (SupplierID),
  UNIQUE KEY uq_supplier_name (SupplierName)
) ENGINE=InnoDB;

CREATE TABLE MenuItem (
  MenuItemID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ItemName VARCHAR(120) NOT NULL,
  Category ENUM('Classic', 'Supreme', 'Premium', 'Special Pizza Combo') NOT NULL,
  Description TEXT NULL,
  Price DECIMAL(10,2) NOT NULL,
  IsAvailable BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (MenuItemID),
  UNIQUE KEY uq_menu_item_name (ItemName),
  CONSTRAINT chk_menu_item_price CHECK (Price >= 0)
) ENGINE=InnoDB;

CREATE TABLE Ingredient (
  IngredientID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  IngredientName VARCHAR(120) NOT NULL,
  UnitMeasure VARCHAR(40) NOT NULL,
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (IngredientID),
  UNIQUE KEY uq_ingredient_name (IngredientName)
) ENGINE=InnoDB;

CREATE TABLE StoreInventory (
  StoreID INT UNSIGNED NOT NULL,
  IngredientID INT UNSIGNED NOT NULL,
  CurrentStock DECIMAL(12,3) NOT NULL DEFAULT 0,
  ReorderLevel DECIMAL(12,3) NOT NULL DEFAULT 0,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (StoreID, IngredientID),
  KEY idx_store_inventory_ingredient (IngredientID),
  CONSTRAINT chk_store_inventory_stock CHECK (CurrentStock >= 0),
  CONSTRAINT chk_store_inventory_reorder CHECK (ReorderLevel >= 0),
  CONSTRAINT fk_store_inventory_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_store_inventory_ingredient
    FOREIGN KEY (IngredientID) REFERENCES Ingredient (IngredientID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE RecipeIngredient (
  MenuItemID INT UNSIGNED NOT NULL,
  IngredientID INT UNSIGNED NOT NULL,
  QuantityRequired DECIMAL(12,3) NOT NULL,
  PRIMARY KEY (MenuItemID, IngredientID),
  KEY idx_recipe_ingredient (IngredientID),
  CONSTRAINT chk_recipe_quantity CHECK (QuantityRequired > 0),
  CONSTRAINT fk_recipe_menu_item
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem (MenuItemID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_recipe_ingredient
    FOREIGN KEY (IngredientID) REFERENCES Ingredient (IngredientID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE CustomerOrder (
  OrderID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  Reference VARCHAR(40) NOT NULL,
  StoreID INT UNSIGNED NOT NULL,
  CustomerName VARCHAR(120) NOT NULL,
  ContactNumber VARCHAR(40) NOT NULL,
  PickupMethod ENUM('Delivery', 'Pickup') NOT NULL,
  DeliveryLocation VARCHAR(500) NULL,
  Notes TEXT NULL,
  PaymentMethod ENUM('Cash') NOT NULL DEFAULT 'Cash',
  PaymentStatus ENUM('Unpaid', 'Paid') NOT NULL DEFAULT 'Unpaid',
  OrderDateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Total DECIMAL(12,2) NOT NULL,
  Status ENUM('Received', 'Preparing', 'Ready', 'Completed', 'Delivered', 'Cancelled')
    NOT NULL DEFAULT 'Received',
  PRIMARY KEY (OrderID),
  UNIQUE KEY uq_customer_order_reference (Reference),
  KEY idx_customer_order_store_date (StoreID, OrderDateTime),
  KEY idx_customer_order_status (Status),
  CONSTRAINT chk_customer_order_total CHECK (Total >= 0),
  CONSTRAINT chk_delivery_location CHECK (
    PickupMethod <> 'Delivery' OR DeliveryLocation IS NOT NULL
  ),
  CONSTRAINT fk_customer_order_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE OrderDetails (
  OrderDetailID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  OrderID BIGINT UNSIGNED NOT NULL,
  MenuItemID INT UNSIGNED NOT NULL,
  ItemNameSnapshot VARCHAR(120) NOT NULL,
  Quantity SMALLINT UNSIGNED NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  SizeInches TINYINT UNSIGNED NOT NULL DEFAULT 10,
  Crust VARCHAR(40) NOT NULL DEFAULT 'Classic',
  Toppings JSON NULL,
  PRIMARY KEY (OrderDetailID),
  KEY idx_order_details_order (OrderID),
  KEY idx_order_details_menu_item (MenuItemID),
  CONSTRAINT chk_order_details_quantity CHECK (Quantity > 0),
  CONSTRAINT chk_order_details_price CHECK (Price >= 0),
  CONSTRAINT fk_order_details_order
    FOREIGN KEY (OrderID) REFERENCES CustomerOrder (OrderID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_order_details_menu_item
    FOREIGN KEY (MenuItemID) REFERENCES MenuItem (MenuItemID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE QualityIssue (
  IssueID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  OrderID BIGINT UNSIGNED NOT NULL,
  Description TEXT NOT NULL,
  DateReported DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ResolutionStatus ENUM('Open', 'Investigating', 'Resolved', 'Closed')
    NOT NULL DEFAULT 'Open',
  PRIMARY KEY (IssueID),
  KEY idx_quality_issue_order (OrderID),
  CONSTRAINT fk_quality_issue_order
    FOREIGN KEY (OrderID) REFERENCES CustomerOrder (OrderID)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE Delivery (
  DeliveryID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  SupplierID INT UNSIGNED NOT NULL,
  StoreID INT UNSIGNED NOT NULL,
  DeliveryDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  DeliveryStatus ENUM('Received', 'Cancelled') NOT NULL DEFAULT 'Received',
  Notes TEXT NULL,
  CreatedByStaffID INT UNSIGNED NULL,
  PRIMARY KEY (DeliveryID),
  KEY idx_delivery_supplier_date (SupplierID, DeliveryDate),
  KEY idx_delivery_store_date (StoreID, DeliveryDate),
  CONSTRAINT fk_delivery_supplier
    FOREIGN KEY (SupplierID) REFERENCES Supplier (SupplierID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_delivery_staff
    FOREIGN KEY (CreatedByStaffID) REFERENCES StaffAccount (StaffID)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE InventoryTransaction (
  TransactionID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreID INT UNSIGNED NOT NULL,
  IngredientID INT UNSIGNED NOT NULL,
  DeliveryID INT UNSIGNED NULL,
  OrderID BIGINT UNSIGNED NULL,
  CreatedByStaffID INT UNSIGNED NULL,
  TransactionType ENUM('Delivery', 'Usage', 'Adjustment', 'Waste') NOT NULL,
  Quantity DECIMAL(12,3) NOT NULL,
  TransactionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Notes VARCHAR(500) NULL,
  PRIMARY KEY (TransactionID),
  KEY idx_inventory_store_date (StoreID, TransactionDate),
  KEY idx_inventory_ingredient_date (IngredientID, TransactionDate),
  KEY idx_inventory_delivery (DeliveryID),
  KEY idx_inventory_order (OrderID),
  CONSTRAINT chk_inventory_quantity CHECK (Quantity > 0),
  CONSTRAINT chk_inventory_transaction_source CHECK (
    (TransactionType = 'Delivery' AND DeliveryID IS NOT NULL)
    OR (TransactionType = 'Usage' AND OrderID IS NOT NULL)
    OR TransactionType IN ('Adjustment', 'Waste')
  ),
  CONSTRAINT fk_inventory_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_ingredient
    FOREIGN KEY (IngredientID) REFERENCES Ingredient (IngredientID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_delivery
    FOREIGN KEY (DeliveryID) REFERENCES Delivery (DeliveryID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_order
    FOREIGN KEY (OrderID) REFERENCES CustomerOrder (OrderID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_inventory_staff
    FOREIGN KEY (CreatedByStaffID) REFERENCES StaffAccount (StaffID)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE DailyReport (
  ReportID INT UNSIGNED NOT NULL AUTO_INCREMENT,
  StoreID INT UNSIGNED NOT NULL,
  ReportDate DATE NOT NULL,
  TotalSales DECIMAL(12,2) NOT NULL DEFAULT 0,
  TotalOrders INT UNSIGNED NOT NULL DEFAULT 0,
  IngredientUsageSummary TEXT NULL,
  CreatedByStaffID INT UNSIGNED NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ReportID),
  UNIQUE KEY uq_daily_report_store_date (StoreID, ReportDate),
  CONSTRAINT chk_daily_report_sales CHECK (TotalSales >= 0),
  CONSTRAINT fk_daily_report_store
    FOREIGN KEY (StoreID) REFERENCES Store (StoreID)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_daily_report_staff
    FOREIGN KEY (CreatedByStaffID) REFERENCES StaffAccount (StaffID)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO Store (StoreID, StoreName, Location, OperatingHours, ManagerName) VALUES
  (1, 'PizzaHaus Sipocot', 'Sipocot, Camarines Sur', 'Daily, 10:00 AM - 9:00 PM', NULL),
  (2, 'PizzaHaus Naga City', 'Naga City, Camarines Sur', 'Daily, 10:00 AM - 9:00 PM', NULL);

INSERT INTO MenuItem (MenuItemID, ItemName, Category, Description, Price) VALUES
  (1, 'Ham & Cheese', 'Classic', 'A delicious combination of ham and cheese on a crispy crust.', 150.00),
  (2, 'Hawaiian', 'Classic', 'A generous mix of savory toppings on a golden, cheesy crust.', 150.00),
  (3, 'Pepperoni', 'Classic', 'A spicy blend of pepperoni and mozzarella on a classic tomato base.', 150.00),
  (4, 'Pork Floss', 'Supreme', 'A classic pizza topped with sweet and savory pork floss.', 180.00),
  (5, 'Overload', 'Supreme', 'Meat and vegetables loaded with our signature tomato sauce.', 190.00),
  (6, 'PizzaHaus Special', 'Supreme', 'One of our signature pizza creations from PizzaHaus.', 220.00),
  (7, 'Beef & Mushroom', 'Premium', 'A hearty combination of tender beef and fresh mushrooms on a crispy crust.', 180.00),
  (8, 'Crab & Garlic', 'Premium', 'A delightful combination of succulent crab and aromatic garlic on a crispy crust.', 180.00),
  (9, 'Chinese Sausage', 'Premium', 'A savory combination of authentic Chinese sausage on a crispy crust.', 180.00),
  (10, 'Tuna & Corn', 'Premium', 'A refreshing combination of fresh tuna and sweet corn on a crispy crust.', 180.00),
  (11, 'Bacon', 'Premium', 'A delicious combination of crispy bacon on a crispy crust.', 180.00),
  (12, 'Sisig', 'Premium', 'A flavorful Filipino dish featuring crispy pork belly and other ingredients on a crispy crust.', 180.00),
  (13, 'Cheese Burger', 'Premium', 'A delicious combination of melted cheese and juicy beef on a crispy crust.', 180.00),
  (14, 'Combo A', 'Special Pizza Combo', 'Regular Ham & Cheese, 1.5L Coke, and our signature tomato sauce.', 225.00),
  (15, 'Combo B', 'Special Pizza Combo', 'Regular Ham & Cheese, Hawaiian, and 1.5L Coke with our signature tomato sauce.', 375.00);

SHOW TABLES;
SELECT StoreID, StoreName, Location FROM Store ORDER BY StoreID;
SELECT MenuItemID, ItemName, Category, Price FROM MenuItem ORDER BY MenuItemID;
SELECT COUNT(*) AS CustomerOrders FROM CustomerOrder;
SELECT COUNT(*) AS StaffAccounts FROM StaffAccount;
