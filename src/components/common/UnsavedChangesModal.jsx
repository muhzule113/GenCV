import Modal from './Modal'
import Button from './Button'

export default function UnsavedChangesModal({ open, onSave, onDiscard, onCancel, saving }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Simpan Perubahan?"
      size="sm"
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel}>Batal</Button>
          <Button variant="secondary" size="sm" onClick={onDiscard}>Jangan Simpan</Button>
          <Button size="sm" onClick={onSave} loading={saving}>Simpan Draft</Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        Anda memiliki perubahan yang belum disimpan. Apakah Anda ingin menyimpan draft terlebih dahulu?
      </p>
    </Modal>
  )
}
