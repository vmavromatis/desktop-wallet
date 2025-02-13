import TransactionLog from '../../../types/TransactionLog';

export interface HistoryListProps {
  onTransactionClick: (transactionLog: TransactionLog) => void;
  transactionLogsList: TransactionLog[];
}
