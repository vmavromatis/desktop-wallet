import type Address from '../../types/Address';
import type { StringHex } from '../../types/SpecialStrings';
import axiosFullService from '../axiosFullService';

const ASSIGN_ADDRESS_FOR_ACCOUNT_METHOD = 'assign_address_for_account';

type AssignAddressForAccountParams = {
  accountId: StringHex;
  metadata?: string;
};

type AssignAddressForAccountResult = {
  address: Address;
};

const assignAddressForAccount = async ({
  accountId,
  metadata,
}: AssignAddressForAccountParams): Promise<AssignAddressForAccountResult> => {
  const { result, error } = await axiosFullService(ASSIGN_ADDRESS_FOR_ACCOUNT_METHOD, {
    accountId,
    metadata,
  });

  if (error) {
    // TODO - I'll write up a better error handler
    const errorMessage = error === 'Database(PasswordFailed)' ? 'Incorrect Password' : error;
    throw new Error(errorMessage);
  } else {
    return result;
  }
};

export default assignAddressForAccount;
