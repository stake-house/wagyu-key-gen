import { Grid, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction } from 'react';
import styled from "styled-components";
import { errors, tooltips } from '../../constants';

type GenerateKeysProps = {
  index: number,
  setIndex: Dispatch<SetStateAction<number>>,
  btecIndices: string,
  setBtecIndices: Dispatch<SetStateAction<string>>,
  btecCredentials: string,
  setBtecCredentials: Dispatch<SetStateAction<string>>,
  withdrawalAddress: string,
  setWithdrawalAddress: Dispatch<SetStateAction<string>>,
  withdrawalAddressError: boolean,
  setWithdrawalAddressError: Dispatch<SetStateAction<boolean>>,
  withdrawalAddressErrorMsg: string,
  setWithdrawalAddressErrorMsg: Dispatch<SetStateAction<string>>,
  startingIndexError: boolean,
  setStartingIndexError: Dispatch<SetStateAction<boolean>>,
  indicesError: boolean,
  setIndicesError: Dispatch<SetStateAction<boolean>>,
  indicesErrorMsg: string,
  setIndicesErrorMsg: Dispatch<SetStateAction<string>>,
  btecCredentialsError: boolean,
  setBtecCredentialsError: Dispatch<SetStateAction<boolean>>,
  btecCredentialsErrorMsg: string,
  setBtecCredentialsErrorMsg: Dispatch<SetStateAction<string>>,
  onFinish: () => void
}

const IndexTextField = styled(TextField)`
  width: 200px;
`;

const IndiceTextField = styled(TextField)`
  width: 560px;
`

const BLSCredentialsField = styled(TextField)`
  width: 680px;
`

const AddressTextField = styled(TextField)`
  margin: 12px 0;
  width: 440px;
`

const WithdrawalNotice = styled(Typography)`
  margin: 0 60px;
`

/**
 * This page gathers data about the keys to generate for the user
 * 
 * @param props self documenting parameters passed in
 * @returns 
 */
const MainInputs = (props: GenerateKeysProps) => {

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setIndex(num);
  }

  const updateIndices = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setBtecIndices(e.target.value.trim());
  }

  const updateBTECCredentials = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setBtecCredentials(e.target.value.trim());
  }

  const updateEth1WithdrawAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setWithdrawalAddress(e.target.value.trim());
  }

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
      <Grid item xs={3}>
        <Tooltip title={tooltips.BTEC_START_INDEX}>
          <IndexTextField
            id="index"
            label="Start index"
            variant="outlined"
            type="number"
            value={props.index}
            onChange={updateIndex}
            InputProps={{ inputProps: { min: 0 } }}
            error={props.startingIndexError}
            helperText={props.startingIndexError ? errors.STARTING_INDEX : ""}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={9}>
        <Tooltip title={tooltips.BTEC_INDICES}>
          <IndiceTextField
            id="indices"
            label="Indices or validator indexes (comma separated)"
            variant="outlined"
            type="string"
            value={props.btecIndices}
            onChange={updateIndices}
            error={props.indicesError}
            helperText={props.indicesError ? props.indicesErrorMsg : ""}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={tooltips.BLS_CREDENTIALS}>
          <BLSCredentialsField
            multiline
            minRows="3"
            id="bls-credentials"
            label="BLS withdrawal credentials (comma separated)"
            variant="outlined"
            value={props.btecCredentials}
            onChange={updateBTECCredentials}
            error={props.btecCredentialsError}
            helperText={ props.btecCredentialsError ? props.btecCredentialsErrorMsg : ""}
            required
          />
        </Tooltip>
      </Grid>
      <Grid item xs={12}>
        <Tooltip title={tooltips.BTEC_WITHDRAW_ADDRESS}>
          <AddressTextField
            id="eth1-withdraw-address"
            label="Ethereum Withdrawal Address"
            variant="outlined"
            value={props.withdrawalAddress}
            onChange={updateEth1WithdrawAddress}
            error={props.withdrawalAddressError}
            helperText={ props.withdrawalAddressError ? props.withdrawalAddressErrorMsg : ""}
            required
          />
        </Tooltip>
        <WithdrawalNotice variant="body1">
          Please ensure that you have control over this address.
        </WithdrawalNotice>
      </Grid>
    </Grid>
  );
}

export default MainInputs;
