import { useEffect, useState, useRef } from 'react';
import { checkSepayPayment } from '../services/paymentService';

/**
 * Hook polling trạng thái thanh toán SePay.
 *
 * @param {string|null} orderCode - Mã đơn hàng SePay (SEVQR...)
 * @param {object} options
 * @param {boolean} options.enabled - Bật/tắt polling
 * @param {number} options.intervalMs - Chu kỳ polling (default 4000ms)
 * @param {number} options.timeoutMs - Hết hạn mã QR (default 15 phút) → dừng polling + báo expired
 * @param {(orderCode:string) => void} options.onPaid - Callback khi xác nhận đã thanh toán
 * @param {(orderCode:string) => void} options.onExpired - Callback khi mã QR hết hạn
 * @returns {{ paid: boolean, expired: boolean, reset: () => void }}
 */
export const useSepayPolling = (
  orderCode,
  { enabled = true, intervalMs = 4000, timeoutMs = 15 * 60 * 1000, onPaid, onExpired } = {}
) => {
  const [paid, setPaid] = useState(false);
  const [expired, setExpired] = useState(false);
  const onPaidRef = useRef(onPaid);
  const onExpiredRef = useRef(onExpired);
  onPaidRef.current = onPaid;
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!orderCode || !enabled || paid || expired) return;

    let stopped = false;
    const startedAt = Date.now();

    const finishExpired = () => {
      if (stopped) return;
      setExpired(true);
      onExpiredRef.current?.(orderCode);
    };

    const tick = async () => {
      // Hết hạn phía client (dự phòng nếu BE chưa kịp trả expired)
      if (Date.now() - startedAt > timeoutMs) {
        finishExpired();
        return;
      }
      try {
        const res = await checkSepayPayment(orderCode);
        if (stopped) return;
        if (res?.paid) {
          setPaid(true);
          onPaidRef.current?.(orderCode);
        } else if (res?.expired) {
          finishExpired();
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
  }, [orderCode, enabled, paid, expired, intervalMs, timeoutMs]);

  const reset = () => {
    setPaid(false);
    setExpired(false);
  };
  return { paid, expired, reset };
};

export default useSepayPolling;
