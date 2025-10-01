import React from 'react';
import CategoryEditModal from './components/CategoryEditModal';

export function useCategoryEditModal() {
  const [modal, setModal] = React.useState<null | {
    category: any;
    onSave: (data: { image: string; visible: boolean }) => void;
  }>(null);

  const show = (category: any, onSave: (data: { image: string; visible: boolean }) => void) => {
    setModal({ category, onSave });
  };
  const hide = () => setModal(null);

  const Modal = modal ? (
    <CategoryEditModal
      visible={true}
      image={modal.category.image || ''}
      visibleFlag={modal.category.visible !== false}
      categoryName={modal.category.name}
      onClose={hide}
      onSave={async (data) => {
        await modal.onSave(data);
        hide();
      }}
    />
  ) : null;

  return { show, Modal };
}
