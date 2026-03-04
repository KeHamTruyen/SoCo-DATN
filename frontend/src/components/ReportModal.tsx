import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import reportService, { ReportTargetType } from '../services/report.service';

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Spam hoặc quảng cáo',
  'Nội dung quấy rối/thù ghét',
  'Lừa đảo hoặc giả mạo',
  'Nội dung không phù hợp',
  'Khác',
];

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      await reportService.createReport({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      onClose();
      alert('Đã gửi báo cáo. Cảm ơn bạn đã giúp cộng đồng an toàn hơn.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi báo cáo lúc này');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg">Báo cáo nội dung</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-2">Lý do báo cáo</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Mô tả thêm (không bắt buộc)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Mô tả ngắn nội dung vi phạm..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
