import React from 'react';
import type { FC } from 'react';

import { Box, Button, FormHelperText, Typography } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import { Formik, Form, Field } from 'formik';
import type { FormikHelpers } from 'formik';
import { Checkbox, TextField } from 'formik-material-ui';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { SubmitButton, TermsOfUseDialog } from '../../../components';
import type { MobileCoinDContextValue } from '../../../contexts/MobileCoinDContext';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import useMobileCoinD from '../../../hooks/useMobileCoinD';

export interface CreateAccountFormValues {
  accountName: string;
  checkedSavePassword: boolean;
  checkedTerms: boolean;
  password: string;
  passwordConfirmation: string;
  submit: null;
}

interface CreateAccountFormPseudoProps {
  isMountedRef: { current: boolean };
  createAccount: MobileCoinDContextValue['createAccount'];
}

export const createAccountFormOnSubmit = async (
  pseudoProps: CreateAccountFormPseudoProps,
  values: CreateAccountFormValues,
  helpers: FormikHelpers<CreateAccountFormValues>
): Promise<void> => {
  const { isMountedRef, createAccount } = pseudoProps;
  const { accountName, password, checkedSavePassword } = values;
  const { setStatus, setErrors, setSubmitting } = helpers;

  try {
    await createAccount(accountName, password);

    if (isMountedRef.current) {
      if (checkedSavePassword) {
        ipcRenderer.sendSync('set-password', accountName, password);
      }
      setStatus({ success: true });
      setSubmitting(false);
    }
  } catch (err) {
    if (isMountedRef.current) {
      setStatus({ success: false });
      setErrors({ submit: err.message });
      setSubmitting(false);
    }
  }
};

interface CreateAccountFormProps {
  isTest: boolean | undefined;
  onSubmit: typeof createAccountFormOnSubmit;
}

const CreateAccountForm: FC<CreateAccountFormProps> = ({
  isTest,
  onSubmit,
}: CreateAccountFormProps) => {
  const isMountedRef = useIsMountedRef();
  const { createAccount } = useMobileCoinD();
  const { t } = useTranslation('CreateAccountForm');

  const [canCheck, setCanCheck] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleCloseTerms = () => {
    setCanCheck(true);
    setOpen(false);
  };

  // FIX-ME: This hack is to avoid opening the Dialog -- which is causing some
  // headaches in testing.
  const handleClickOpen = () => {
    return isTest ? handleCloseTerms() : setOpen(true);
  };

  const handleOnSubmit = async (
    values: CreateAccountFormValues,
    helpers: FormikHelpers<CreateAccountFormValues>
  ) => {
    const pseduoProps = { createAccount, isMountedRef };
    onSubmit(pseduoProps, values, helpers);
  };

  const initialValues = {
    accountName: '',
    checkedSavePassword: true,
    checkedTerms: false,
    password: '',
    passwordConfirmation: '',
    submit: null,
  };

  const validationSchema = Yup.object().shape({
    accountName: Yup.string().max(64, t('accountNameValidation')),
    // CBB: It appears that the checkedTerms error message is not working properly.
    checkedTerms: Yup.bool().oneOf([true], t('checkedTermsValidation')),
    password: Yup.string()
      .min(8, t('passwordMin'))
      .max(99, t('passwordMax'))
      .required(t('passwordRequired')),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref('password')], t('passwordConfirmationRef'))
      .required(t('passwordConfirmationRequired')),
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleOnSubmit}
      validationSchema={validationSchema}
    >
      {({ errors, isSubmitting, dirty, isValid, submitForm }) => {
        return (
          <Form name="CreateAccountFormName">
            <Field
              id="CreateAccountForm-accountNameField"
              component={TextField}
              fullWidth
              label={t('nameLabel')}
              name="accountName"
            />
            <Field
              id="CreateAccountForm-passwordField"
              component={TextField}
              fullWidth
              label={t('passwordLabel')}
              margin="dense"
              name="password"
              type="password"
            />
            <Field
              id="CreateAccountForm-passwordConfirmationField"
              component={TextField}
              fullWidth
              label={t('passwordConfirmationLabel')}
              margin="dense"
              name="passwordConfirmation"
              type="password"
            />
            <Box pt={1} display="flex">
              <Box display="flex" alignItems="center" flexDirection="row-reverse">
                <Box>
                  <Typography display="inline">Save Password to Keychain</Typography>
                </Box>
                <Field component={Checkbox} type="checkbox" name="checkedSavePassword" />
              </Box>
            </Box>
            <Box pt={1} display="flex">
              <Box display="flex" alignItems="center" flexDirection="row-reverse">
                <Box>
                  <Typography display="inline">{t('acceptTerms')}</Typography>
                  <Button color="primary" onClick={handleClickOpen}>
                    {t('acceptTermsButton')}
                  </Button>
                </Box>
                <Field
                  component={Checkbox}
                  type="checkbox"
                  name="checkedTerms"
                  disabled={!canCheck}
                  indeterminate={!canCheck}
                />
              </Box>
            </Box>
            {!canCheck && <FormHelperText focused>{t('acceptTermsFormHelper')}</FormHelperText>}
            {errors.submit && (
              <Box mt={3}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}
            <SubmitButton
              disabled={!dirty || !isValid || isSubmitting}
              onClick={submitForm}
              isSubmitting={isSubmitting}
            >
              {t('createAccountButton')}
            </SubmitButton>
            <TermsOfUseDialog open={open} handleCloseTerms={handleCloseTerms} />
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreateAccountForm;
