/**
 * Thermal Printer ESC/POS Command Generator
 * Generates ESC/POS commands for 80mm thermal receipt printers
 */

// ESC/POS control characters
const ESC = '\x1B';
const GS = '\x1D';
const LF = '\x0A';

interface ReceiptData {
  tokenNumber: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  timestamp?: string;
}

/**
 * Generate ESC/POS commands for thermal printer
 * @param data Receipt data to print
 * @returns String containing ESC/POS commands
 */
export function generateThermalReceipt(data: ReceiptData): string {
  let receipt = '';

  // Initialize printer
  receipt += ESC + '@'; // Reset printer

  // Set print mode to double height and double width
  receipt += ESC + 'M\x00'; // Font A

  // Top border
  receipt += createLine('=');

  // Header - Token number (large)
  receipt += ESC + '!' + String.fromCharCode(0x10); // Bold + double size
  receipt += centerText('TOKEN #' + data.tokenNumber, 32);
  receipt += ESC + '!' + String.fromCharCode(0x00); // Normal size

  receipt += createLine('=');

  // Order items
  receipt += ESC + '!' + String.fromCharCode(0x00); // Normal size
  receipt += 'Item                 Qty  Price' + LF;
  receipt += createLine('-');

  for (const item of data.orderItems) {
    const itemName = item.name.substring(0, 18);
    const qty = item.quantity.toString().padStart(3);
    const price = ('₹' + item.price.toFixed(2)).padStart(8);
    receipt += itemName.padEnd(18) + qty + price + LF;
  }

  receipt += createLine('-');

  // Total
  receipt += ESC + '!' + String.fromCharCode(0x08); // Double width
  const totalText = 'TOTAL: ₹' + data.totalAmount.toFixed(2);
  receipt += centerText(totalText, 32);
  receipt += ESC + '!' + String.fromCharCode(0x00); // Normal

  // Payment method
  receipt += LF;
  receipt += centerText('Payment: ' + data.paymentMethod.toUpperCase(), 32);

  // Timestamp
  if (data.timestamp) {
    receipt += LF;
    receipt += centerText(data.timestamp, 32);
  }

  receipt += LF;
  receipt += createLine('=');

  // Footer
  receipt += centerText('Please collect your order', 32);
  receipt += 'when token is announced' + LF;
  receipt += centerText('Thank you!', 32);

  receipt += LF;
  receipt += LF;

  // Cut paper
  receipt += GS + 'V\x00'; // Partial cut

  return receipt;
}

/**
 * Center text for 80mm printer (32 characters per line)
 */
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text + LF;
}

/**
 * Create a line of characters
 */
function createLine(char: string): string {
  return char.repeat(32) + LF;
}

/**
 * Convert receipt to bytes for direct printer communication
 */
export function receiptToBytes(receipt: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(receipt);
}

/**
 * Generate token number based on prefix and counter
 * Example: A101, B234, etc.
 */
export function generateTokenNumber(counter: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token = '';

  // First digit: letter based on counter mod 26
  const letterIndex = Math.floor((counter - 1) / 100) % letters.length;
  token += letters[letterIndex];

  // Next digits: counter padded to 3 digits
  token += String(counter % 1000).padStart(3, '0');

  return token;
}

/**
 * Format price in Indian Rupees
 */
export function formatPrice(amount: number): string {
  return '₹' + amount.toFixed(2);
}

/**
 * Generate ESC/POS receipt from order data
 */
export function generateReceiptESCPOS(
  order: any,
  selectedItems: Map<number, number>,
  foodItems: any[]
): string {
  const items = Array.from(selectedItems.entries()).map(([itemId, qty]) => {
    const item = foodItems.find((f: any) => f.id === itemId);
    return {
      name: item?.name || 'Unknown',
      quantity: qty,
      price: (item?.price || 0) * qty,
    };
  });

  return generateThermalReceipt({
    tokenNumber: order.token_number,
    orderItems: items,
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method,
    timestamp: new Date().toLocaleString('en-IN'),
  });
}
