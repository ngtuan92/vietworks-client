import { useEffect, useState, useRef } from 'react';
import { checkSepayPayment } from '../services/paymentService';

/**
 * Hook polling trạng thái thanh toán SePay.
 *
 * @param {string|null} orderCode - Mã đơn hàng SePay (SEVQR...)
 * @param {object} options
 * @param {boolean} options.enabled - Bật/tắt polling
 * @param {number} options.intervalMs - Chu kỳ polling (default 4000ms)
 * @param {(orderCode:string) => void} options.onPaid - Callback khi xác nhận đã thanh toán
 * @returns {{ paid: boolean, reset: () => void }}
 */
export const useSepayPolling = (orderCode, { enabled = true, intervalMs = 4000, onPaid } = {}) => {
  const [paid, setPaid] = useState(false);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    if (!orderCode || !enabled || paid) return;

    let stopped = false;
    const tick = async () => {
      try {
        const res = await checkSepayPayment(orderCode);
        if (!stopped && res?.paid) {
          setPaid(true);
          onPaidRef.current?.(orderCode);
        }
      } catch {
        // Polling lỗi - swallow để không ngắt loop
      }
    };

    // Polling ngay lần đầu, sau đó định kỳ
    tick();
    const id = setInterval(tick, intervalMs);

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [orderCode, enabled, paid, intervalMs]);

  const reset = () => setPaid(false);
  return { paid, reset };
};

export default useSepayPolling;
