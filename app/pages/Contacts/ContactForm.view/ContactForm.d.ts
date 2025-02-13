import Contact from '../../../types/Contact';

export interface ContactFormProps {
  abbreviation?: string;
  alias?: string;
  assignedAddress?: string;
  color?: string;
  isFavorite?: boolean;
  recipientAddress?: string;
  onCancel: () => void;
  onDelete?: () => void;
  onSaved: (x: Contact) => void;
}
