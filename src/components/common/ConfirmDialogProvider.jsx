import useConfirmStore from '../../store/confirmStore'
import ConfirmDialog from './ConfirmDialog'

export default function ConfirmDialogProvider() {
  const { confirm, confirmAction, cancelConfirm } = useConfirmStore()

  return (
    <ConfirmDialog
      open={!!confirm}
      onClose={cancelConfirm}
      onConfirm={confirmAction}
      title="Konfirmasi Token"
      message={confirm?.message || ''}
    />
  )
}
