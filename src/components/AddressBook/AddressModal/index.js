import React from 'react'
import PropTypes from 'prop-types'

import Modal from '../../Modal'
import {
  ContactsModalWrapper,
  ContactsModalCard,
  Divider,
  Action,
  ActionText,
  Title
} from './elements'

import tl from '../../../utils/i18n'

const AddressBookModal = ({
  visible,
  closeModal,
  animationType,
  onPressEdit,
  onPressSend,
  onPressDelete
}) => (
  <Modal
    modalOpened={visible}
    closeModal={closeModal}
    animationType={animationType}
    transparent
  >
    <ContactsModalWrapper onPress={closeModal}>
      <ContactsModalCard>
        <Title>{tl.t('addressBook.modal.title')}</Title>
        <Action onPress={onPressEdit}>
          <ActionText>{tl.t('addressBook.shared.edit')}</ActionText>
        </Action>
        <Divider />
        <Action onPress={onPressDelete}>
          <ActionText>{tl.t('addressBook.shared.delete')}</ActionText>
        </Action>
        <Divider />
        <Action onPress={onPressSend}>
          <ActionText>{tl.t('addressBook.shared.send')}</ActionText>
        </Action>
      </ContactsModalCard>
    </ContactsModalWrapper>
  </Modal>
)

AddressBookModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onPressEdit: PropTypes.func.isRequired,
  onPressSend: PropTypes.func.isRequired,
  onPressDelete: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  animationType: PropTypes.string
}

export default AddressBookModal
