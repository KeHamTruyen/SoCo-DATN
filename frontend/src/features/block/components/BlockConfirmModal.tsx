import { Dialog } from "@headlessui/react";
import { Button } from "../../../shared/ui/atoms/button";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  targetName: string;
};

export default function BlockConfirmModal({ open, onClose, onConfirm, targetName }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">{t('block.confirmTitle', { name: targetName })}</Dialog.Title>
          <div className="mt-4 text-sm text-muted-foreground">
            {t('block.confirmBody', { name: targetName })}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button className="bg-destructive text-white" onClick={async () => { await onConfirm(); onClose(); }}>{t('block.block')}</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
