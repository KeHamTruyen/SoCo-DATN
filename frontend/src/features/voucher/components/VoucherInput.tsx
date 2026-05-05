import { useState } from 'react';
import { Trash2, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { voucherApi } from '../api/voucherApi';

interface VoucherInputProps {
  onVoucherApplied?: (discount: number, code: string) => void;
  onVoucherRemoved?: () => void;
  subtotal: number;
  disabled?: boolean;
}

export function VoucherInput({
  onVoucherApplied,
  onVoucherRemoved,
  subtotal,
  disabled = false,
}: VoucherInputProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApply = async () => {
    if (!code.trim()) {
      setError(t('voucher.enterCode') || 'Please enter a voucher code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await voucherApi.applyVoucher(code.toUpperCase(), subtotal);
      
      if (result.isValid) {
        setAppliedCode(result.code);
        setAppliedDiscount(result.discount);
        setCode('');
        onVoucherApplied?.(result.discount, result.code);
      } else {
        setError(t('voucher.invalid') || 'Invalid voucher code');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        t('voucher.error') || 
        'Failed to apply voucher'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCode('');
    setAppliedDiscount(0);
    setCode('');
    setError('');
    onVoucherRemoved?.();
  };

  if (appliedCode) {
    return (
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                {appliedCode}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {t('voucher.applied') || 'Voucher applied'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-green-700 dark:text-green-300">
                -{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(appliedDiscount)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="text-green-600 hover:text-green-800 dark:text-green-400 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {t('voucher.haveCode') || 'Have a promo code?'}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && !disabled) {
              handleApply();
            }
          }}
          placeholder={t('voucher.enterCode') || 'Enter code'}
          disabled={disabled || loading}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder:text-neutral-500"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={disabled || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? t('common.loading') || 'Loading...' : t('voucher.apply') || 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
