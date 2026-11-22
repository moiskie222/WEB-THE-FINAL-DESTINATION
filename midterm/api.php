<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const DB_HOST = '127.0.0.1';
const DB_NAME = 'pizzahaus_db';
const DB_USER = 'root';
const DB_PASS = '';

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$pdo = null;
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (Throwable $error) {
    respond(500, ['error' => 'Cannot connect to the PizzaHaus database.']);
}

$action = $_GET['action'] ?? '';

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($body)) {
        $body = $_POST;
    }
    $email = strtolower(trim((string) ($body['email'] ?? $body['username'] ?? '')));
    $password = trim((string) ($body['password'] ?? ''));

    if ($email === '' || $password === '') {
        respond(401, ['error' => 'Invalid email or password.']);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT `rule`, email, password
            FROM account_table
            WHERE LOWER(email) = ?
            LIMIT 1
        ");
        $stmt->execute([$email]);
        $account = $stmt->fetch();
    } catch (Throwable $error) {
        respond(500, ['error' => 'Unable to validate the staff account.']);
    }

    if (
        !$account
        || !in_array($account['rule'], ['admin', 'clerk'], true)
        || !hash_equals(trim((string) $account['password']), $password)
    ) {
        respond(401, ['error' => 'Invalid email or password.']);
    }

    respond(200, [
        'role' => $account['rule'],
        'name' => $account['rule'] === 'admin'
            ? 'PizzaHaus Administrator'
            : 'PizzaHaus Clerk',
    ]);
}

if ($action === 'orders' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "
        SELECT co.OrderID, co.Reference, co.StoreID, s.StoreName,
               co.CustomerName, co.ContactNumber, co.PickupMethod,
               co.DeliveryLocation, co.Notes, co.PaymentMethod,
               co.PaymentStatus, co.OrderDateTime, co.Total, co.Status
        FROM CustomerOrder co
        JOIN Store s ON s.StoreID = co.StoreID
        ORDER BY co.OrderDateTime ASC
    ";
    $orders = $pdo->query($sql)->fetchAll();

    $detailStmt = $pdo->prepare("
        SELECT od.MenuItemID, od.ItemNameSnapshot, od.Quantity, od.Price,
               od.SizeInches, od.Crust, od.Toppings
        FROM OrderDetails od
        WHERE od.OrderID = ?
        ORDER BY od.OrderDetailID
    ");

    $result = [];
    foreach ($orders as $order) {
        $detailStmt->execute([(int) $order['OrderID']]);
        $items = [];
        foreach ($detailStmt->fetchAll() as $detail) {
            $toppings = json_decode((string) $detail['Toppings'], true);
            $items[] = [
                'ItemName' => $detail['ItemNameSnapshot'],
                'Quantity' => (int) $detail['Quantity'],
                'Price' => (float) $detail['Price'],
                'Size' => (int) $detail['SizeInches'],
                'Crust' => $detail['Crust'],
                'Toppings' => is_array($toppings) ? $toppings : [],
            ];
        }
        $order['OrderID'] = (int) $order['OrderID'];
        $order['StoreID'] = (int) $order['StoreID'];
        $order['Total'] = (float) $order['Total'];
        $order['PaymentStatus'] = $order['PaymentStatus'] === 'Paid'
            ? 'Paid'
            : 'Pay on pickup/delivery';
        $order['OrderItems'] = $items;
        $result[] = $order;
    }
    respond(200, ['orders' => $result]);
}

if ($action === 'save_orders' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true);
    $orders = $body['orders'] ?? null;
    if (!is_array($orders)) {
        respond(400, ['error' => 'Invalid order data.']);
    }

    $allowedStatuses = ['Received', 'Preparing', 'Ready', 'Completed', 'Delivered', 'Cancelled'];
    $menuStmt = $pdo->prepare('SELECT MenuItemID FROM MenuItem WHERE ItemName = ? LIMIT 1');

    try {
        $pdo->beginTransaction();
        foreach ($orders as $order) {
            if (!is_array($order) || empty($order['Reference'])) continue;

            $storeId = (int) ($order['StoreID'] ?? 0);
            $pickupMethod = ($order['PickupMethod'] ?? 'Pickup') === 'Delivery' ? 'Delivery' : 'Pickup';
            $deliveryLocation = $pickupMethod === 'Delivery'
                ? trim((string) ($order['DeliveryLocation'] ?? ''))
                : null;
            if ($pickupMethod === 'Delivery' && $deliveryLocation === '') {
                throw new RuntimeException('A delivery location is required.');
            }

            $status = in_array($order['Status'] ?? '', $allowedStatuses, true)
                ? $order['Status']
                : 'Received';
            $total = max(0.0, (float) ($order['Total'] ?? 0));
            $customerName = trim((string) ($order['CustomerName'] ?? 'Guest customer'));
            $contactNumber = trim((string) ($order['ContactNumber'] ?? ''));
            $reference = trim((string) $order['Reference']);
            $orderDate = trim((string) ($order['OrderDateTime'] ?? ''));
            $orderDateValue = new DateTimeImmutable($orderDate ?: 'now');
            $orderDateValue = $orderDateValue->format('Y-m-d H:i:s');
            $paymentStatus = ($order['PaymentStatus'] ?? '') === 'Paid' ? 'Paid' : 'Unpaid';

            $select = $pdo->prepare('SELECT OrderID FROM CustomerOrder WHERE Reference = ?');
            $select->execute([$reference]);
            $existing = $select->fetch();

            if ($existing) {
                $orderId = (int) $existing['OrderID'];
                $update = $pdo->prepare("
                    UPDATE CustomerOrder
                    SET StoreID = ?, CustomerName = ?, ContactNumber = ?, PickupMethod = ?,
                        DeliveryLocation = ?, Notes = ?, PaymentMethod = 'Cash',
                        PaymentStatus = ?, OrderDateTime = ?, Total = ?, Status = ?
                    WHERE OrderID = ?
                ");
                $update->execute([
                    $storeId, $customerName, $contactNumber, $pickupMethod,
                    $deliveryLocation, trim((string) ($order['Notes'] ?? '')),
                    $paymentStatus, $orderDateValue, $total, $status, $orderId,
                ]);
            } else {
                $insert = $pdo->prepare("
                    INSERT INTO CustomerOrder
                        (Reference, StoreID, CustomerName, ContactNumber, PickupMethod,
                         DeliveryLocation, Notes, PaymentMethod, PaymentStatus,
                         OrderDateTime, Total, Status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'Cash', ?, ?, ?, ?)
                ");
                $insert->execute([
                    $reference, $storeId, $customerName, $contactNumber, $pickupMethod,
                    $deliveryLocation, trim((string) ($order['Notes'] ?? '')),
                    $paymentStatus, $orderDateValue, $total, $status,
                ]);
                $orderId = (int) $pdo->lastInsertId();
            }

            $deleteDetails = $pdo->prepare('DELETE FROM OrderDetails WHERE OrderID = ?');
            $deleteDetails->execute([$orderId]);

            $detailInsert = $pdo->prepare("
                INSERT INTO OrderDetails
                    (OrderID, MenuItemID, ItemNameSnapshot, Quantity, Price,
                     SizeInches, Crust, Toppings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $items = is_array($order['OrderItems'] ?? null) ? $order['OrderItems'] : [];
            foreach ($items as $item) {
                if (!is_array($item)) continue;
                $itemName = trim((string) ($item['ItemName'] ?? ''));
                $quantity = (int) ($item['Quantity'] ?? 0);
                if ($itemName === '' || $quantity < 1) continue;
                $menuStmt->execute([$itemName]);
                $menuItem = $menuStmt->fetch();
                if (!$menuItem) continue;

                $size = (int) ($item['Size'] ?? 10);
                $size = $size > 0 ? $size : 10;
                $crust = trim((string) ($item['Crust'] ?? 'Classic'));
                $toppings = is_array($item['Toppings'] ?? null) ? $item['Toppings'] : [];
                $detailInsert->execute([
                    $orderId,
                    (int) $menuItem['MenuItemID'],
                    $itemName,
                    $quantity,
                    max(0.0, (float) ($item['Price'] ?? 0)),
                    $size,
                    $crust !== '' ? $crust : 'Classic',
                    json_encode($toppings, JSON_UNESCAPED_UNICODE),
                ]);
            }
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        respond(400, ['error' => $error->getMessage()]);
    }

    $_GET['action'] = 'orders';
    $sql = "
        SELECT co.OrderID, co.Reference, co.StoreID, s.StoreName,
               co.CustomerName, co.ContactNumber, co.PickupMethod,
               co.DeliveryLocation, co.Notes, co.PaymentMethod,
               co.PaymentStatus, co.OrderDateTime, co.Total, co.Status
        FROM CustomerOrder co
        JOIN Store s ON s.StoreID = co.StoreID
        ORDER BY co.OrderDateTime ASC
    ";
    $orders = $pdo->query($sql)->fetchAll();
    $detailStmt = $pdo->prepare("
        SELECT ItemNameSnapshot, Quantity, Price, SizeInches, Crust, Toppings
        FROM OrderDetails WHERE OrderID = ? ORDER BY OrderDetailID
    ");
    $result = [];
    foreach ($orders as $order) {
        $detailStmt->execute([(int) $order['OrderID']]);
        $items = [];
        foreach ($detailStmt->fetchAll() as $detail) {
            $toppings = json_decode((string) $detail['Toppings'], true);
            $items[] = [
                'ItemName' => $detail['ItemNameSnapshot'],
                'Quantity' => (int) $detail['Quantity'],
                'Price' => (float) $detail['Price'],
                'Size' => (int) $detail['SizeInches'],
                'Crust' => $detail['Crust'],
                'Toppings' => is_array($toppings) ? $toppings : [],
            ];
        }
        $order['OrderID'] = (int) $order['OrderID'];
        $order['StoreID'] = (int) $order['StoreID'];
        $order['Total'] = (float) $order['Total'];
        $order['PaymentStatus'] = $order['PaymentStatus'] === 'Paid'
            ? 'Paid'
            : 'Pay on pickup/delivery';
        $order['OrderItems'] = $items;
        $result[] = $order;
    }
    respond(200, ['orders' => $result]);
}

respond(404, ['error' => 'Unknown API action.']);
