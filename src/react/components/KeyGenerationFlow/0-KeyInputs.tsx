import { Button, Fade, FormControlLabel, Grid, Switch, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from "styled-components";
import { errors, tooltips } from '../../constants';

type GenerateKeysProps = {
  numberOfKeys: number,
  setNumberOfKeys: Dispatch<SetStateAction<number>>,
  withdrawalAddress: string,
  setWithdrawalAddress: Dispatch<SetStateAction<string>>,
  index: number,
  setIndex: Dispatch<SetStateAction<number>>,
  showIndexInput: boolean,
  password: string,
  setPassword: Dispatch<SetStateAction<string>>,
  withdrawalAddressFormatError: boolean,
  setWithdrawalAddressFormatError: Dispatch<SetStateAction<boolean>>,
  numberOfKeysError: boolean,
  passwordStrengthError: boolean,
  startingIndexError: boolean,
  showAdvanced: boolean,
  setShowAdvanced: Dispatch<SetStateAction<boolean>>,
  onFinish: () => void
}

const StyledTextField = styled(TextField)`
  margin: 12px 0;
  width: 260px;
  min-height: 79px;
`

const AddressTextField = styled(TextField)`
  margin: 12px 0;
  width: 440px;
`

const Eth1WithdrawGrid = styled(Grid)`
  margin-top: -30px;
`

/**
 * This page gathers data about the keys to generate for the user
 * 
 * @param props self documenting parameters passed in
 * @returns 
 */
const KeyInputs = (props: GenerateKeysProps) => {

  const updateNumberOfKeys = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setNumberOfKeys(num);
  }

  const updateIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    props.setIndex(num);
  }

  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setPassword(e.target.value);
  }

  const updateEth1WithdrawAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setWithdrawalAddress(e.target.value.trim());
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1">
          Nice!  Your Secret Recovery Phrase is verified. Now let's collect some info about the keys to create:
        </Typography>
      </Grid>
      <Grid container item direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
        <Grid item>
          <Tooltip title={tooltips.NUMBER_OF_KEYS}>
            <StyledTextField
              id="number-of-keys"
              label="Number of New Keys"
              variant="outlined"
              type="number"
              value={props.numberOfKeys}
              onChange={updateNumberOfKeys}
              InputProps={{ inputProps: { min: 1, max: 1000 } }}
              error={props.numberOfKeysError}
              helperText={ props.numberOfKeysError ? errors.NUMBER_OF_KEYS : ""}
            />
          </Tooltip>
        </Grid>
        { props.showIndexInput &&
          <Grid item>
            <Tooltip title={tooltips.STARTING_INDEX}>
              <StyledTextField
                id="index"
                label="Amount of Existing (starting index)"
                variant="outlined"
                type="number"
                value={props.index}
                onChange={updateIndex}
                InputProps={{ inputProps: { min: 0 } }}
                error={props.startingIndexError}
                helperText={props.startingIndexError ? errors.STARTING_INDEX : ""}
              />
            </Tooltip>
          </Grid>
        }
        <Grid item>
          <Tooltip title={tooltips.PASSWORD}>
            <StyledTextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              value={props.password}
              onChange={updatePassword}
              error={props.passwordStrengthError}
              helperText={props.passwordStrengthError ? errors.PASSWORD_STRENGTH : ""}
            />
          </Tooltip>
        </Grid>
      </Grid>
      <Eth1WithdrawGrid item>
        <Typography variant="body1">
        You can use a single LUKSO address as withdraw destination for all generated validator keys.
        <br/>
        If left empty, it will generate a seperate BLS withdraw credential for each validator key.
        </Typography>
        {/* <FormControlLabel
          control={<Switch checked={props.showAdvanced} onChange={handleToggleShowAdvanced} color="default" size="small" />}
          label="Use a single LUKSO address as withdraw destination for all generated validator keys. If Turned off, it will generate a seperate BLS withdraw credential for each validator key."
        /> */}
      </Eth1WithdrawGrid>
      <Grid item>
            <Grid container item direction="row" justifyContent="center" alignItems="center" spacing={2} xs={12}>
              <Grid item>
                <Tooltip title={tooltips.ETH1_WITHDRAW_ADDRESS}>
                  <AddressTextField
                    id="eth1-withdraw-address"
                    label="LUKSO Withdrawal Address (Optional)"
                    variant="outlined"
                    value={props.withdrawalAddress}
                    onChange={updateEth1WithdrawAddress}
                    error={props.withdrawalAddressFormatError}
                    helperText={ props.withdrawalAddressFormatError ? errors.ADDRESS_FORMAT_ERROR : ""}
                  />
                </Tooltip>
                <Typography variant="body1">
                  A LUKSO address is a ETH1 public key on the LUKSO blockchain (Can be generated with any tool like MetaMask), <b>make sure that you control
                  the private key, otherwise you will not be able to use the funds withdrawn to this address!</b>
                </Typography>
              </Grid>
            </Grid>
        </Grid>
    </Grid>
  );
}

export default KeyInputs;
