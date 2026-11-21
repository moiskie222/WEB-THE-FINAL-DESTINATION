# PizzaHaus

## Set up the MySQL database

Requirements: MySQL Server 8.0.16 or later and MySQL Workbench. Workbench is the client; the MySQL Server must also be installed and running.

1. Open `pizzahaus_database.sql` in MySQL Workbench and connect to your local MySQL Server.
2. Read the reset warning at the top of the script, then run the full script.
3. Check the result tabs: it should show two PizzaHaus stores, 15 menu items, zero customer orders, and zero staff accounts.

The script drops and recreates only `pizzahaus_db`. Rerunning it deletes all records in that database, so do not rerun it after real customer or staff data has been added.

The script seeds the current store and menu catalog; manager names are left blank for the admin to enter. Customer orders, staff accounts, suppliers, ingredients, inventory, and reports are not seeded with demo records. Staff passwords must be securely hashed by the application; do not insert plain-text passwords.

## Application connection status

The current website is still a static, browser-storage prototype. Creating this database does not connect the website to MySQL. A server-side API is still required to save customer orders, authenticate staff accounts, and let admins manage suppliers and inventory. Do not use the current site to collect real customer information until that API is implemented.