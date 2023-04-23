import { Grid, IconButton, Snackbar, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from "styled-components";
import { tooltips } from '../../constants';
import { Keystore } from '../../types';
import { FileCopy } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

const ScrollableGrid = styled(Grid)`
  max-height: 350px;
  overflow-y: auto;
`;

const GlobalTextField = styled(TextField)`
  width: 300px;
`;

const ValidatorIndexTextField = styled(TextField)`
  width: 150px;
`;

const ValidatorPasswordTextField = styled(TextField)`
  width: 200px;
`;

type KeystoreValidationProps = {
  epoch: number;
  setEpoch: Dispatch<SetStateAction<number>>;
  keystores: Keystore[];
  setKeystores: Dispatch<SetStateAction<Keystore[]>>;
}

/**
 * This page allows the users to specify a folder containing the keystore files
 * 
 * @param props self documenting parameters passed in
 * @returns 
 */
const KeystoreValidation = (props: KeystoreValidationProps) => {
  const [copiedPublicKey, setCopiedPublicKey] = useState<string>("");
  const [masterPassword, setMasterPassword] = useState<string>("");

  const copyPublicKey = (publicKey: string) => {
    window.electronAPI.clipboardWriteText(publicKey);
    setCopiedPublicKey(publicKey);
  };

  const handleSnackbarClose = () => {
    setCopiedPublicKey("");
  }

  const onMasterPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setMasterPassword(newPassword);

    const updatedKeystores = props.keystores.map((keystore) => {
      return {
        ...keystore,
        password: newPassword
      };
    });

    props.setKeystores(updatedKeystores);
  }

  const onEpochChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEpoch = parseInt(e.target.value || "0");
    props.setEpoch(newEpoch);
  }

  const onValidatorIndexChange = (value: string, keystore: Keystore) => {
    const index = parseInt(value);

    props.setKeystores(props.keystores.map((k) => k.index === keystore.index ? Object.assign({}, k, { validatorIndex: index }): k))
  }

  const onValidatorPasswordChange = (value: string, keystore: Keystore) => {
    props.setKeystores(props.keystores.map((k) => k.index === keystore.index ? Object.assign({}, k, { password: value }): k))
  }

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1">
          Please provide the validator index and password for each discovered keystore.
        </Typography>
        <Typography variant="subtitle1">
          You can copy the public key to search on Beaconcha.in to easily find your validator index.
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Tooltip title={tooltips.KEYSTORE_MASTER_PASSWORD}>
          <GlobalTextField
            id="master_password"
            label="Master password"
            variant="outlined"
            type="text"
            value={masterPassword}
            onChange={onMasterPasswordChange}
          />
        </Tooltip>
      </Grid>

      <Grid item xs={6}>
        <Tooltip title={tooltips.EXIT_EPOCH}>
          <GlobalTextField
            id="epoch"
            label="Valid epoch"
            variant="outlined"
            type="number"
            value={props.epoch}
            onChange={onEpochChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Tooltip>
      </Grid>
      <ScrollableGrid item xs={12}>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
          <Grid item xs={2}>
            Path Index
          </Grid>
          <Grid item xs={3}>
            Public Key
          </Grid>
          <Grid item xs={3}>
            Validator Index
          </Grid>
          <Grid item xs={4}>
            Password
          </Grid>
        </Grid>

        {props.keystores.map((keystore: Keystore) => (
          <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} key={keystore.index}>
            <Grid item xs={2}>{keystore.index}</Grid>

            <Grid item xs={3}>
              {keystore.shortenedPub}

              <IconButton aria-label="copy public key" color="primary" onClick={() => copyPublicKey(keystore.publicKey)}>
                <FileCopy />
              </IconButton>
            </Grid>

            <Grid item xs={3}>
              <ValidatorIndexTextField
                id={`validator-index-${keystore.index}`}
                variant="outlined"
                type="number"
                value={keystore.validatorIndex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValidatorIndexChange(e.target.value, keystore)}
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            </Grid>

            <Grid item xs={4}>
              <ValidatorPasswordTextField
                id={`validator-password-${keystore.index}`}
                variant="outlined"
                type="text"
                value={keystore.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValidatorPasswordChange(e.target.value, keystore)}
                required
              />
              </Grid>
          </Grid>
        ))}
      </ScrollableGrid>
      <Snackbar
        open={copiedPublicKey !== ""}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Copied {copiedPublicKey} to your clipboard
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default KeystoreValidation;
